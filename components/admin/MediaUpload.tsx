"use client";

import { useRef, useState } from "react";
import { Upload, X, FileVideo } from "lucide-react";
import { stackedLabelCls } from "@/lib/admin-ui";

/**
 * The single image/video picker used by every admin form that uploads media.
 * Shows a preview with Replace / Remove once something is chosen, validates
 * type and size up front, and states the limits instead of failing silently
 * on the server.
 */
export default function MediaUpload({
  label,
  preview,
  onFileChange,
  onClear,
  required,
  accept = "image/*",
  maxMB = 5,
  hint,
  round,
  fileName,
}: {
  label: string;
  /** Data URL or remote URL of the current media. */
  preview: string | null;
  onFileChange: (file: File, dataUrl: string) => void;
  onClear?: () => void;
  required?: boolean;
  accept?: string;
  maxMB?: number;
  hint?: string;
  /** Circular preview, for avatars. */
  round?: boolean;
  fileName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const isVideo = (src: string | null) =>
    !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(src));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowsVideo = accept.includes("video");
    if (!file.type.startsWith("image/") && !(allowsVideo && file.type.startsWith("video/"))) {
      setError(allowsVideo ? "Pick an image or video file." : "Pick an image file.");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${maxMB} MB.`);
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => onFileChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  };

  return (
    <div>
      <label className={stackedLabelCls}>
        {label}
        {required && <span className="text-rose-gold ml-0.5">*</span>}
      </label>

      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

      {preview ? (
        <div className="flex items-center gap-4 border border-border-gray rounded-sm p-3">
          {isVideo(preview) ? (
            <video
              src={preview}
              className="w-24 h-16 object-cover rounded-sm bg-charcoal/5"
              muted
              playsInline
            />
          ) : (
            <img
              src={preview}
              alt=""
              className={`object-cover border border-border-gray ${
                round ? "w-16 h-16 rounded-full" : "w-24 h-16 rounded-sm"
              }`}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-charcoal truncate flex items-center gap-1.5">
              {isVideo(preview) && <FileVideo size={14} className="text-charcoal/50 shrink-0" />}
              {fileName || "Current file"}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-gold-deep font-semibold hover:underline mt-0.5"
            >
              Replace
            </button>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={clear}
              className="p-2 text-charcoal/40 hover:text-rose-gold hover:bg-rose-gold/10 rounded transition-colors shrink-0"
              title="Remove"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border-gray rounded-sm p-5 text-center hover:border-gold hover:bg-gold/5 transition-colors"
        >
          <Upload size={22} className="mx-auto text-charcoal/40 mb-2" />
          <p className="text-sm text-charcoal/60">Click to upload</p>
          <p className="text-[11px] text-charcoal/40 mt-0.5">
            {hint || `${accept.includes("video") ? "Image or video" : "JPG or PNG"}, up to ${maxMB} MB`}
          </p>
        </button>
      )}

      {error && <p className="text-[11px] text-rose-gold mt-1">{error}</p>}
    </div>
  );
}
