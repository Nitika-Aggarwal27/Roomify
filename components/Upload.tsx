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
  const [error, setError] = React.useState("");

  React.useEffect(() => () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
  }, []);

  const processFile = (selectedFile: File) => {
    if (!/^image\/(jpeg|png)$/.test(selectedFile.type)) {
      setError("Please choose a JPG or PNG image.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image must be 10 MB or smaller.");
      return;
    }

    if (progressInterval.current) clearInterval(progressInterval.current);
    if (redirectTimeout.current) clearTimeout(redirectTimeout.current);

    setError("");
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
      setError("Could not read this image. Please try another file.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    if (selectedFile) processFile(selectedFile);
    event.currentTarget.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
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
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Upload a JPG or PNG floor plan to preview it"}
            </p>
            <p className="help">Maximum file size 10 MB.</p>
            {error && <p role="alert" className="help">{error}</p>}
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
