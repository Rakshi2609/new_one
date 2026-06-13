import { useCallback, useState } from "react";
import { Upload, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentCard } from "./DocumentCard";

interface FileDropzoneProps {
  files: File[];
  audioFile: File | null;
  onFilesChange: (files: File[]) => void;
  onAudioChange: (file: File | null) => void;
}

export function FileDropzone({ files, audioFile, onFilesChange, onAudioChange }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      onFilesChange([...files, ...dropped]);
    },
    [files, onFilesChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleAudioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAudioChange(e.target.files[0]);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-card border-2 border-dashed px-8 py-16 text-center transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-alan-indigo bg-alan-indigo/5"
            : "border-alan-border bg-alan-surface hover:border-alan-indigo/50 hover:bg-alan-indigo/3"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className={cn(
          "mb-4 rounded-full p-4 transition-colors",
          isDragOver ? "bg-alan-indigo/15" : "bg-alan-border/50"
        )}>
          <Upload className={cn("h-8 w-8 transition-colors", isDragOver ? "text-alan-indigo" : "text-alan-text-muted")} />
        </div>
        <p className="text-base font-medium text-alan-text-primary">
          {isDragOver ? "Drop your files here" : "Drag your documents here"}
        </p>
        <p className="mt-1 text-sm text-alan-text-muted">
          or <span className="text-alan-indigo font-medium">browse</span> — PDF, JPG, PNG
        </p>
        <p className="mt-3 text-xs text-alan-text-muted">
          Prescriptions, operative reports, lab results…
        </p>
      </div>

      {/* File chips */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <DocumentCard
              key={i}
              name={file.name}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      {/* Audio upload */}
      <div
        className="flex items-center gap-3 rounded-btn border border-dashed border-alan-border px-4 py-3 cursor-pointer hover:border-alan-teal/50 transition-colors"
        onClick={() => document.getElementById("audio-input")?.click()}
      >
        <input
          id="audio-input"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleAudioInput}
        />
        <div className="rounded-full bg-alan-teal/10 p-2">
          <Mic className="h-4 w-4 text-alan-teal" />
        </div>
        <div className="flex-1">
          {audioFile ? (
            <p className="text-sm font-medium text-alan-text-primary">{audioFile.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-alan-text-secondary">Voice note (optional)</p>
              <p className="text-xs text-alan-text-muted">MP3, M4A, WAV — doctor's report</p>
            </>
          )}
        </div>
        {audioFile && (
          <button
            onClick={(e) => { e.stopPropagation(); onAudioChange(null); }}
            className="text-xs text-alan-text-muted hover:text-alan-error transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
