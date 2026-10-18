import React from "react";
import { useOutletContext } from "react-router";
import { CheckCircle, Image as ImageIcon, Upload as UploadIcon } from "lucide-react";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

type UploadProps = {
  onComplete: (base64Data: string) => void;
};

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const progressInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSignedIn } = useOutletContext<AuthContext>();

  React.useEffect(() => () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    if (progressInterval.current) clearInterval(progressInterval.current);
    if (redirectTimeout.current) clearTimeout(redirectTimeout.current);

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      const base64Data = reader.result;
      let currentProgress = 0;
      progressInterval.current = setInterval(() => {
        currentProgress = Math.min(currentProgress + PROGRESS_STEP, 100);
        setProgress(currentProgress);

        if (currentProgress === 100) {
          if (progressInterval.current) clearInterval(progressInterval.current);
          progressInterval.current = null;
          redirectTimeout.current = setTimeout(() => {
            onComplete(base64Data);
            redirectTimeout.current = null;
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.onerror = () => {
      setFile(null);
      setProgress(0);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const selectedFile = event.currentTarget.files?.[0];
    if (selectedFile) processFile(selectedFile);
    event.currentTarget.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isSignedIn) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (!isSignedIn) return;

    // Some browsers expose dropped files through `items` before `files` is
    // populated, so support both transfer representations.
    const droppedFile =
      event.dataTransfer.files[0] ??
      Array.from(event.dataTransfer.items)
        .find((item) => item.kind === "file")
        ?.getAsFile();
    if (droppedFile) processFile(droppedFile);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
