import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/FileDropzone";
import { uploadDocuments, getPlan } from "@/api/client";
import type { MedicalDocument, ClinicalNote } from "@/types/models";

type Step = "idle" | "uploading" | "analysing" | "done";

const stepLabels: Record<Step, string> = {
  idle: "",
  uploading: "Reading documents…",
  analysing: "Medical analysis in progress…",
  done: "Plan ready!",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async () => {
    if (files.length === 0 && !audioFile) return;

    setError(null);
    setStep("uploading");
    setProgress(20);

    try {
      // Step 1 — upload (mock)
      const uploadResult = await uploadDocuments(files, audioFile ?? undefined);
      setProgress(55);
      setStep("analysing");

      // Step 2 — plan (real or mock)
      const plan = await getPlan(
        uploadResult.documents as MedicalDocument[],
        uploadResult.clinical_note as ClinicalNote | null
      );
      setProgress(100);
      setStep("done");

      // Store in session for next pages
      sessionStorage.setItem("upload", JSON.stringify(uploadResult));
      sessionStorage.setItem("plan", JSON.stringify(plan));

      setTimeout(() => navigate("/plan"), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("idle");
      setProgress(0);
    }
  };

  const isLoading = step === "uploading" || step === "analysing";
  const canAnalyse = (files.length > 0 || audioFile !== null) && !isLoading;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-alan-border bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-alan-indigo">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-alan-text-primary">CuraPath</span>
            <span className="ml-2 text-sm text-alan-text-muted">par Alan</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-alan-text-primary leading-tight">
            Your post-consultation steps,
            <br />
            <span className="text-alan-indigo">organised automatically</span>
          </h1>
          <p className="mt-3 text-base text-alan-text-muted max-w-md mx-auto">
            Upload your medical documents. CuraPath generates your action plan and detects critical interactions.
          </p>
        </div>

        {/* Dropzone */}
        {!isLoading && (
          <FileDropzone
            files={files}
            audioFile={audioFile}
            onFilesChange={setFiles}
            onAudioChange={setAudioFile}
          />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="rounded-card border border-alan-border bg-alan-surface px-8 py-12 text-center space-y-5">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-alan-indigo/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-6 w-6 text-alan-indigo" />
              </div>
            </div>
            <p className="text-sm font-medium text-alan-text-secondary">{stepLabels[step]}</p>
            <Progress value={progress} className="mx-auto max-w-xs" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-btn border border-alan-error/30 bg-alan-error/5 px-4 py-3 text-sm text-alan-error">
            {error}
          </div>
        )}

        {/* CTA */}
        {!isLoading && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleAnalyse}
              disabled={!canAnalyse}
              className="gap-2 px-10"
            >
              Analyse documents
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Demo hint */}
        {files.length === 0 && !audioFile && !isLoading && (
          <p className="mt-6 text-center text-xs text-alan-text-muted">
            Demo mode — drop any file to test with the Pierre Muller urology case
          </p>
        )}
      </main>
    </div>
  );
}
