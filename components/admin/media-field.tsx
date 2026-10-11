"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { deleteMedia } from "@/app/admin/media-actions";
import { CloseIcon } from "@/components/icons";
import { convertToWebp, ImageConvertError, mediaPath, type MediaFolder } from "@/lib/admin/image";
import type { AdminMessages } from "@/lib/admin/messages";
import { IMAGES_BUCKET, imageUrl } from "@/lib/data/images";
import { format } from "@/lib/i18n/format";
import { createBrowserClient } from "@/lib/supabase/browser";
import { Button, buttonClass } from "./ui";

const MAX_BYTES = 5 * 1024 * 1024; // the bucket's limit

type Props = {
  label: string;
  hint?: string;
  folder: MediaFolder;
  value: string | null;
  onChange: (path: string | null) => void;
  messages: AdminMessages["media"];
  /** Thumbnail shape: covers are 2:3, photos 4:5, logos square. */
  aspect?: "cover" | "photo" | "square";
};

const ASPECT = { cover: "aspect-[2/3]", photo: "aspect-[4/5]", square: "aspect-square" };

/** An image field: shows the current image, opens the library to pick or upload one. */
export function MediaField({ label, hint, folder, value, onChange, messages: m, aspect = "cover" }: Props) {
  const [open, setOpen] = useState(false);
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId}>
      <p id={labelId} className="mb-1.5 text-ui font-semibold">
        {label}
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div className={`relative w-28 overflow-hidden rounded-control border border-line bg-label-paper ${ASPECT[aspect]}`}>
          {value ? (
            <Image src={imageUrl(value)} alt="" fill sizes="112px" className={aspect === "square" ? "object-contain p-2" : "object-cover"} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-meta text-ink-soft">—</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => setOpen(true)}>{value ? m.change : m.choose}</Button>
          {value && (
            <Button variant="quiet" onClick={() => onChange(null)}>
              {m.remove}
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-meta text-ink-soft">{hint}</p>}
      {open && (
        <MediaLibrary
          folder={folder}
          current={value}
          aspect={aspect}
          messages={m}
          onSelect={(path) => {
            onChange(path);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

type FileItem = { path: string; name: string; createdAt: string | null };

function MediaLibrary({
  folder,
  current,
  aspect,
  messages: m,
  onSelect,
  onClose,
}: {
  folder: MediaFolder;
  current: string | null;
  aspect: NonNullable<Props["aspect"]>;
  messages: AdminMessages["media"];
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const headingId = useId();

  const load = useCallback(async () => {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setMessage(format(m.errors.list, { reason: error.message }));
      setFiles([]);
      return;
    }
    setFiles(
      (data ?? [])
        .filter((f) => f.id && !f.name.startsWith("."))
        .map((f) => ({ path: `${folder}/${f.name}`, name: f.name, createdAt: f.created_at })),
    );
  }, [folder, m.errors.list]);

  useEffect(() => {
    dialog.current?.showModal();
    // Loading the list is the effect's job; state updates come after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function upload(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const { blob } = await convertToWebp(file, folder);
      if (blob.size > MAX_BYTES) {
        setMessage(m.errors.tooLarge);
        return;
      }
      const path = mediaPath(folder, file.name);
      const supabase = createBrowserClient();
      const { error } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
      if (error) {
        setMessage(format(m.errors.upload, { reason: error.message }));
        return;
      }
      onSelect(path);
    } catch (e) {
      setMessage(e instanceof ImageConvertError ? m.errors[e.reason] : format(m.errors.upload, { reason: String(e) }));
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function remove(path: string) {
    if (!window.confirm(m.deleteConfirm)) return;
    setMessage(null);
    const result = await deleteMedia(path);
    if (result.ok) {
      setFiles((list) => list?.filter((f) => f.path !== path) ?? null);
    } else if ("inUse" in result) {
      setMessage(format(m.inUse, { where: result.inUse.join(", ") }));
    } else {
      setMessage(format(m.errors.delete, { reason: result.error }));
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-panel border border-line-strong bg-paper p-0 text-ink backdrop:bg-ink/55 tab:m-auto tab:max-h-[85dvh] tab:max-w-[56rem] tab:rounded-panel"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-paper-raised px-4 py-2 tab:px-6">
        <h2 id={headingId} className="text-h3">
          {format(m.libraryTitle, { folder: m.folders[folder] })}
        </h2>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={m.close}
          className="flex size-11 items-center justify-center rounded-control text-ink-soft hover:text-ink"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="px-4 py-5 tab:px-6">
        <label className={`${buttonClass.primary} w-full cursor-pointer tab:w-auto ${busy ? "pointer-events-none opacity-45" : ""}`}>
          {busy ? m.uploading : `+ ${m.upload}`}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        <p className="mt-2 text-meta text-ink-soft">{m.uploadHint}</p>
        <p role="status" aria-live="polite" className="mt-2 text-ui font-semibold text-walnut empty:hidden">
          {message}
        </p>

        {files === null ? (
          <p className="mt-6 text-ui text-ink-soft">…</p>
        ) : files.length === 0 ? (
          <p className="mt-6 text-ui text-ink-soft">{m.empty}</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 tab:grid-cols-4">
            {files.map((f) => {
              const isCurrent = f.path === current;
              return (
                <li key={f.path} className={`rounded-panel border bg-paper-raised p-2 ${isCurrent ? "border-2 border-walnut" : "border-line"}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(f.path)}
                    className="block w-full text-left"
                    aria-label={`${m.select}: ${f.name}`}
                  >
                    <span className={`relative block w-full overflow-hidden rounded-control bg-label-paper ${ASPECT[aspect]}`}>
                      <Image
                        src={imageUrl(f.path)}
                        alt=""
                        fill
                        sizes="(min-width: 37.5rem) 200px, 45vw"
                        className={aspect === "square" ? "object-contain p-2" : "object-cover"}
                      />
                    </span>
                    <span className="mt-1.5 block truncate text-meta text-ink-soft">{f.name}</span>
                  </button>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {isCurrent ? <span className="text-meta font-semibold text-walnut">{m.current}</span> : <span />}
                    <button
                      type="button"
                      onClick={() => void remove(f.path)}
                      className="min-h-11 px-1 text-meta font-medium text-walnut underline underline-offset-4"
                    >
                      {m.deleteImage}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </dialog>
  );
}
