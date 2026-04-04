import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  // File Metadata Record
  type FileMetadata = {
    title : Text;
    grade : Text;
    subject : Text;
    fileType : Text;
    blob : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let fileMetadata = Map.empty<Nat, FileMetadata>();
  var nextId = 0;

  // Mixins
  include MixinStorage();

  // Integrate persistent authentication/authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // USER PROFILE MANAGEMENT

  // Get caller's profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile - admin can view any, users can only view their own
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save/Update caller's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // FILE METADATA MANAGEMENT

  // Add file metadata (open - access controlled by frontend password)
  public shared func addFileMetadata(metadata : FileMetadata) : async Nat {
    let id = nextId;
    let newEntry : FileMetadata = {
      metadata with
      uploadedAt = Time.now();
    };
    fileMetadata.add(id, newEntry);
    nextId += 1;
    id;
  };

  // Delete file metadata by ID (open - access controlled by frontend password)
  public shared func deleteFileMetadata(id : Nat) : async Bool {
    let existed = fileMetadata.containsKey(id);
    fileMetadata.remove(id);
    existed;
  };

  // PUBLIC - List all file metadata
  public query func listAllFileMetadata() : async [FileMetadata] {
    fileMetadata.values().toArray();
  };
};
