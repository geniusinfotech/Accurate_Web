"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { apiDownload, apiUpload } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { captionCls, inputCls } from "@/lib/admin-ui";
import type { Category } from "@/lib/types/api";

type ImportResult = { created: number; updated: number; errors: string[] };

/** "Import" button + dialog: download the .xlsx template, fill it in, upload it. */
export function ProductImport({
  categories,
  onDone,
}: {
  categories: Category[];
  onDone: () => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const close = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
  };

  const submit = async () => {
    if (!file || !categoryId) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("categoryId", categoryId);
      const res = await apiUpload<ImportResult>("/products/upload-excel", body);
      setResult(res);
      if (res.created + res.updated > 0) onDone();
    } catch (err: any) {
      toast.error(err?.message || "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <FileSpreadsheet size={18} />
        Import
      </button>

      <Modal
        isOpen={open}
        title="Import products"
        subtitle="Add many products at once. Photos can be added afterwards."
        onClose={close}
        onSubmit={result ? close : submit}
        submitLabel={result ? "Done" : "Import"}
        submitting={busy}
        disabled={!result && (!file || !categoryId)}
        maxWidth="max-w-lg"
      >
        {result ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-slate-900">
              {result.created} added, {result.updated} updated
              {result.errors.length > 0 && `, ${result.errors.length} skipped`}
            </p>
            {result.errors.length > 0 && (
              <ul className="max-h-48 list-disc space-y-1 overflow-y-auto rounded-lg bg-rose-50 p-3 pl-6 text-rose-700">
                {result.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    apiDownload("/products/import-template", "product-import-template.xlsx").catch(
                      (e: Error) => toast.error(e.message),
                    )
                  }
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 underline"
                >
                  <Download size={14} /> Download the template
                </button>{" "}
                and fill one product per row (only Name and Price are required).
              </li>
              <li>Choose the category these products belong to.</li>
              <li>Upload the file. A SKU that already exists updates that product.</li>
            </ol>

            <div>
              <label className={`${captionCls} mb-1 block`}>Category *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`${captionCls} mb-1 block`}>Excel file (.xlsx) *</label>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
