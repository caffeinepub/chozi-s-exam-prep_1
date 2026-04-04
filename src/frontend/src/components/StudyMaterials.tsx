import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type FileMetadata } from "../backend";
import { useActor } from "../hooks/useActor";

type Grade = "9" | "12";

const SUBJECTS = [
  "Zambian Civic Education",
  "Biology",
  "Science",
  "Mathematics",
  "History",
];

// Admin credentials (frontend-only gate)
const ADMIN_USERNAME = "chozi";
const ADMIN_PASSWORD = "19979903";
const SESSION_KEY = "chozi_admin_session";

function isAdminSessionActive(): boolean {
  return localStorage.getItem(SESSION_KEY) === "active";
}

function setAdminSession() {
  localStorage.setItem(SESSION_KEY, "active");
}

function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ────────────────────────────────────────────────────────────
// Study Materials Section (public, student-facing)
// ────────────────────────────────────────────────────────────

interface StudyMaterialsSectionProps {
  grade: Grade;
}

export function StudyMaterialsSection({ grade }: StudyMaterialsSectionProps) {
  const { actor, isFetching } = useActor();

  const { data: allFiles = [], isLoading } = useQuery({
    queryKey: ["fileMetadata"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllFileMetadata();
    },
    enabled: !!actor && !isFetching,
  });

  const gradeFiles = allFiles.filter((f) => f.grade === `Grade ${grade}`);

  const filesBySubject = SUBJECTS.reduce<Record<string, typeof allFiles>>(
    (acc, subject) => {
      acc[subject] = gradeFiles.filter((f) => f.subject === subject);
      return acc;
    },
    {},
  );

  const hasAnyFiles = gradeFiles.length > 0;

  return (
    <section className="mb-10" data-ocid="study_materials.section">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-widest text-gold font-bold px-3">
          Study Materials
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {isLoading || isFetching ? (
        <div
          className="flex items-center justify-center py-12 text-lavender"
          data-ocid="study_materials.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Loading study materials…</span>
        </div>
      ) : !hasAnyFiles ? (
        <div
          className="card-glass rounded-2xl p-10 text-center"
          data-ocid="study_materials.empty_state"
        >
          <FolderOpen className="w-10 h-10 text-purple-bright mx-auto mb-3 opacity-50" />
          <p className="text-sm text-lavender">
            No study materials available for Grade {grade} yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back soon — the admin will upload PDFs and videos.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {SUBJECTS.map((subject) => {
            const files = filesBySubject[subject];
            if (!files || files.length === 0) return null;
            return (
              <div key={subject}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-bright mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
                  {subject}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {files.map((file, i) => (
                    <FileCard
                      key={`${file.subject}-${file.title}-${i}`}
                      file={file}
                      index={i + 1}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface FileCardProps {
  file: FileMetadata;
  index: number;
}

function FileCard({ file, index }: FileCardProps) {
  const isPdf = file.fileType === "pdf";

  const handleOpen = () => {
    const url = file.blob.getDirectURL();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="card-glass rounded-xl p-4 flex items-start gap-3 hover:border-purple-light transition-all duration-200 group"
      data-ocid={`study_materials.item.${index}`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isPdf
            ? "bg-red-500/20 text-red-400"
            : "bg-purple/30 text-purple-bright"
        }`}
      >
        {isPdf ? (
          <FileText className="w-5 h-5" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">
          {file.title}
        </p>
        <Badge
          className={`mt-1 text-[10px] px-1.5 py-0 ${
            isPdf
              ? "bg-red-500/20 text-red-300 border-red-500/30"
              : "bg-purple/30 text-purple-bright border-purple/40"
          }`}
        >
          {isPdf ? "PDF" : "Video"}
        </Badge>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-gold hover:text-gold hover:bg-gold/10 text-xs px-2 py-1 h-auto flex-shrink-0"
        onClick={handleOpen}
        data-ocid={`study_materials.open.button.${index}`}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-1" />
        Open
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Admin Panel Modal
// ────────────────────────────────────────────────────────────

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [isLoggedIn, setIsLoggedIn] = useState(() => isAdminSessionActive());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminSession();
      setIsLoggedIn(true);
      setLoginError("");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Incorrect username or password. Please try again.");
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsLoggedIn(false);
  };

  const handleClose = () => {
    onClose();
  };

  // List all files (admin view)
  const { data: allFiles = [], isLoading: loadingFiles } = useQuery({
    queryKey: ["fileMetadata"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllFileMetadata();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="card-glass border-border max-w-2xl mx-auto max-h-[92vh] overflow-y-auto"
        data-ocid="admin.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-gold text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-bright" />
            Admin Panel
          </DialogTitle>
        </DialogHeader>

        {/* Login form */}
        {!isLoggedIn && (
          <div className="py-6">
            <div className="w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-purple-bright" />
            </div>
            <h3 className="text-foreground font-bold text-base mb-1 text-center">
              Admin Login
            </h3>
            <p className="text-sm text-lavender mb-6 text-center">
              Enter your admin credentials to access the upload panel.
            </p>

            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-1.5">
                <Label className="text-xs text-lavender">Username</Label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-purple-deep/40 border-border text-foreground placeholder:text-muted-foreground"
                  data-ocid="admin.login.username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-lavender">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="bg-purple-deep/40 border-border text-foreground placeholder:text-muted-foreground pr-10"
                    data-ocid="admin.login.password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lavender hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-400 text-center">{loginError}</p>
              )}

              <Button
                onClick={handleLogin}
                disabled={!username || !password}
                className="w-full bg-gold text-purple-deep hover:bg-gold-light font-bold"
                data-ocid="admin.login.button"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        )}

        {/* Logged in as admin */}
        {isLoggedIn && (
          <AdminContent
            actor={actor}
            allFiles={allFiles}
            loadingFiles={loadingFiles}
            onLogout={handleLogout}
            onFileUploaded={() =>
              queryClient.invalidateQueries({ queryKey: ["fileMetadata"] })
            }
            onFileDeleted={() =>
              queryClient.invalidateQueries({ queryKey: ["fileMetadata"] })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// Admin Content (upload form + file list)
// ────────────────────────────────────────────────────────────

interface AdminContentProps {
  actor: any;
  allFiles: FileMetadata[];
  loadingFiles: boolean;
  onLogout: () => void;
  onFileUploaded: () => void;
  onFileDeleted: () => void;
}

function AdminContent({
  actor,
  allFiles,
  loadingFiles,
  onLogout,
  onFileUploaded,
  onFileDeleted,
}: AdminContentProps) {
  const [title, setTitle] = useState("");
  const [uploadGrade, setUploadGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "video" | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFileMetadata(id);
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
      onFileDeleted();
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setFileType("pdf");
      else if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext ?? ""))
        setFileType("video");
      else setFileType("");
    }
  };

  const handleUpload = async () => {
    if (!actor || !file || !title || !uploadGrade || !subject || !fileType)
      return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );

      const metadata: FileMetadata = {
        title,
        subject,
        blob,
        fileType,
        grade: uploadGrade,
        uploadedAt: BigInt(Date.now()),
      };

      await actor.addFileMetadata(metadata);
      toast.success(`"${title}" uploaded successfully!`);
      onFileUploaded();

      // Reset form
      setTitle("");
      setUploadGrade("");
      setSubject("");
      setFileType("");
      setFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    title.trim() !== "" &&
    uploadGrade !== "" &&
    subject !== "" &&
    fileType !== "" &&
    file !== null;

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
            ✓ Admin Access
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-lavender hover:text-foreground text-xs"
          data-ocid="admin.logout.button"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          Logout
        </Button>
      </div>

      {/* Upload Form */}
      <div
        className="rounded-2xl bg-purple-mid/10 border border-border p-5 space-y-4"
        data-ocid="admin.upload.panel"
      >
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-bold text-gold uppercase tracking-widest">
            Upload File
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs text-lavender">File Title</Label>
            <Input
              placeholder="e.g. Chapter 3 — Cell Division Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-purple-deep/40 border-border text-foreground placeholder:text-muted-foreground text-sm"
              data-ocid="admin.upload.title.input"
              disabled={isUploading}
            />
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lavender">Grade</Label>
            <Select
              value={uploadGrade}
              onValueChange={setUploadGrade}
              disabled={isUploading}
            >
              <SelectTrigger
                className="bg-purple-deep/40 border-border text-foreground text-sm"
                data-ocid="admin.upload.grade.select"
              >
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Grade 9">Grade 9</SelectItem>
                <SelectItem value="Grade 12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lavender">Subject</Label>
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={isUploading}
            >
              <SelectTrigger
                className="bg-purple-deep/40 border-border text-foreground text-sm"
                data-ocid="admin.upload.subject.select"
              >
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lavender">File Type</Label>
            <Select
              value={fileType}
              onValueChange={(v) => setFileType(v as "pdf" | "video")}
              disabled={isUploading}
            >
              <SelectTrigger
                className="bg-purple-deep/40 border-border text-foreground text-sm"
                data-ocid="admin.upload.filetype.select"
              >
                <SelectValue placeholder="PDF or Video" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="pdf">
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    PDF Document
                  </span>
                </SelectItem>
                <SelectItem value="video">
                  <span className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-purple-bright" />
                    Video
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs text-lavender">Select File</Label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="block w-full text-xs text-lavender file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple/40 file:text-foreground hover:file:bg-purple/60 cursor-pointer bg-purple-deep/40 border border-border rounded-lg p-2"
                data-ocid="admin.upload.dropzone"
              />
            </div>
            {file && (
              <p className="text-[10px] text-lavender truncate">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="space-y-1.5" data-ocid="admin.upload.loading_state">
            <div className="flex justify-between text-xs text-lavender">
              <span>Uploading…</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-purple-mid/30" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!isFormValid || isUploading}
          className="w-full bg-gold text-purple-deep hover:bg-gold-light font-bold text-sm"
          data-ocid="admin.upload.submit_button"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Uploading {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      </div>

      {/* File List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-bold text-gold uppercase tracking-widest">
            Uploaded Files
          </h3>
          <Badge className="ml-auto bg-purple/30 text-lavender border-purple/40 text-xs">
            {allFiles.length} total
          </Badge>
        </div>

        {loadingFiles ? (
          <div
            className="text-center py-6 text-lavender"
            data-ocid="admin.files.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading files…</p>
          </div>
        ) : allFiles.length === 0 ? (
          <div
            className="card-glass rounded-xl p-6 text-center"
            data-ocid="admin.files.empty_state"
          >
            <FolderOpen className="w-8 h-8 text-purple-bright mx-auto mb-2 opacity-40" />
            <p className="text-xs text-lavender">No files uploaded yet.</p>
          </div>
        ) : (
          <div
            className="space-y-2 max-h-72 overflow-y-auto pr-1"
            data-ocid="admin.files.list"
          >
            {allFiles.map((file, i) => (
              <AdminFileRow
                key={`${file.grade}-${file.subject}-${file.title}-${i}`}
                file={file}
                index={i + 1}
                onDelete={() => deleteMutation.mutate(BigInt(i))}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Admin File Row
// ────────────────────────────────────────────────────────────

interface AdminFileRowProps {
  file: FileMetadata;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}

function AdminFileRow({
  file,
  index,
  onDelete,
  isDeleting,
}: AdminFileRowProps) {
  const isPdf = file.fileType === "pdf";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-purple-mid/10 border border-border hover:border-purple-light transition-colors"
      data-ocid={`admin.files.item.${index}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isPdf
            ? "bg-red-500/20 text-red-400"
            : "bg-purple/30 text-purple-bright"
        }`}
      >
        {isPdf ? (
          <FileText className="w-4 h-4" />
        ) : (
          <Video className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {file.title}
        </p>
        <p className="text-[10px] text-lavender">
          {file.grade} · {file.subject}
        </p>
      </div>
      <Badge
        className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
          isPdf
            ? "bg-red-500/20 text-red-300 border-red-500/30"
            : "bg-purple/30 text-purple-bright border-purple/40"
        }`}
      >
        {file.fileType.toUpperCase()}
      </Badge>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        disabled={isDeleting}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0 flex-shrink-0"
        data-ocid={`admin.files.delete_button.${index}`}
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}
