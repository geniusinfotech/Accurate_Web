"use client";

import { useState, useRef, useEffect } from "react";
import { apiRequest, apiUpload } from "@/lib/api-client";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/AdminShell";
import { modalInputCls, stackedLabelCls } from "@/lib/admin-ui";
import { getImageUrl } from "@/lib/api";
import { Plus, Upload, X, Power } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Testimonial } from "@/lib/types/api";

interface AdminTestimonial {
  _id: string;
  customerName?: string;
  customerPost?: string;
  text?: string;
  name?: string;
  rating?: number;
  comment?: string;
  image?: string;
  isActive?: boolean;
}

const emptyForm = { customerName: "", customerPost: "", text: "" };

export default function Testimonials() {
  const { alert, confirm } = useDialog();
  const toast = useToast();
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const data = await apiRequest<AdminTestimonial[]>("/testimonials");
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(emptyForm);
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(row: any) {
    setEditingId(row._id);
    setFormData({
      customerName: row.customerName || row.name || "",
      customerPost: row.customerPost || "",
      text: row.text || row.comment || "",
    });
    setSelectedFile(null);
    setPreview(row.image ? getImageUrl(row.image) : null);
    setError("");
    setIsModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Pick an image file (jpg, png or webp).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is larger than 5 MB — please pick a smaller one.");
      return;
    }
    setError("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const valid =
    formData.customerName.trim() &&
    formData.customerPost.trim() &&
    formData.text.trim();

  async function handleSubmit() {
    setError("");
    if (!valid) {
      setError(
        "Customer name, role/occasion and the testimonial text are all required.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("customerName", formData.customerName);
      fd.append("customerPost", formData.customerPost);
      fd.append("text", formData.text);
      if (selectedFile) fd.append("image", selectedFile);

      if (editingId) {
        await apiUpload(`/testimonials/${editingId}`, fd, "PATCH");
        toast.success("Testimonial updated successfully");
      } else {
        await apiUpload("/testimonials", fd);
        toast.success("Testimonial created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
      await alert(
        editingId ? "Testimonial updated." : "Testimonial added.",
        "success",
      );
    } catch (err: any) {
      setError(err.message || "Failed to save testimonial");
      toast.error(err.message || "Failed to save testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const t = testimonials.find((x) => x._id === id);
    const ok = await confirm(
      `Delete the testimonial from “${t?.customerName || t?.name || "this customer"}”? It will disappear from the website.`,
      "Delete Testimonial",
    );
    if (!ok) return;
    try {
      await apiRequest(`/testimonials/${id}`, { method: "DELETE" });
      fetchTestimonials();
      toast.success("Testimonial deleted successfully");
    } catch (err: any) {
      await alert(err.message || "Failed to delete testimonial", "error");
      toast.error(err.message || "Failed to delete testimonial");
    }
  }

  async function handleToggle(row: any) {
    try {
      await apiRequest(`/testimonials/${row._id}/toggle-active`, {
        method: "PATCH",
      });
      fetchTestimonials();
      toast.success("Testimonial status updated");
    } catch (err: any) {
      await alert(err.message || "Failed to change status", "error");
      toast.error(err.message || "Failed to change status");
    }
  }

  const rows = testimonials.map((t) => ({
    ...t,
    displayName: t.customerName || t.name || "—",
    body: t.text || t.comment || "",
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Testimonials"
        description="Customer reviews shown on the website"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 btn-primary px-5 py-2.5"
          >
            <Plus size={18} /> Add Testimonial
          </button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
        subtitle="Appears in the reviews section of the website."
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        submitLabel={editingId ? "Update" : "Add Testimonial"}
        submitting={submitting}
        disabled={!valid}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-rose-gold/10 border border-rose-gold/25 text-rose-gold px-3 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={stackedLabelCls}>
              Customer Name <span className="text-rose-gold">*</span>
            </label>
            <input
              type="text"
              tabIndex={1}
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              placeholder="e.g. Priya Shah"
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>
              Role / Occasion <span className="text-rose-gold">*</span>
            </label>
            <input
              type="text"
              tabIndex={2}
              value={formData.customerPost}
              onChange={(e) =>
                setFormData({ ...formData, customerPost: e.target.value })
              }
              placeholder="e.g. Bride, Repeat Customer"
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>
              Testimonial <span className="text-rose-gold">*</span>
            </label>
            <textarea
              tabIndex={3}
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              placeholder="What the customer said…"
              rows={4}
              maxLength={500}
              className={`${modalInputCls} resize-none`}
            />
            <p className="text-[11px] text-charcoal/45 mt-1 text-right">
              {formData.text.length}/500
            </p>
          </div>

          <div>
            <label className={stackedLabelCls}>Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="flex items-center gap-4 border border-border-gray rounded-sm p-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal truncate">
                    {selectedFile?.name || "Current photo"}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gold-deep font-semibold hover:underline mt-0.5"
                  >
                    Replace
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-2 text-charcoal/40 hover:text-rose-gold hover:bg-rose-gold/10 rounded transition-colors"
                  title="Remove photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border-gray rounded-sm p-6 text-center hover:border-gold hover:bg-gold/5 transition-colors"
              >
                <Upload size={22} className="mx-auto text-charcoal/40 mb-2" />
                <p className="text-sm text-charcoal/60">
                  Click to upload a photo
                </p>
                <p className="text-[11px] text-charcoal/40 mt-0.5">
                  JPG or PNG, up to 5 MB
                </p>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
