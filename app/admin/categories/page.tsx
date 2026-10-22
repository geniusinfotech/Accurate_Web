'use client'

import { useState, useEffect } from 'react'
import { apiRequest, apiUpload } from '@/lib/api-client'
import { getUploadUrl } from '@/lib/api'
import Modal from '@/components/admin/Modal'
import { useDialog } from '@/components/admin/ConfirmDialog'
import { PageHeader } from '@/components/admin/AdminShell'
import { modalInputCls, stackedLabelCls } from '@/lib/admin-ui'
import { Plus, Image as ImageIcon } from 'lucide-react'
import { activityLoggers } from '@/lib/activity-log'
import { useToast } from '@/components/ui/Toast'
import { DataTable } from '@/components/admin/DataTable'
import { ShortcutHint, LIST_SHORTCUTS } from '@/components/admin/ShortcutHint'
import { useFormTabNavigation } from '@/components/admin/useFormTabNavigation'
import MediaUpload from '@/components/admin/MediaUpload'
import type { Category } from '@/lib/types/api'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
  showOnHomepage: false,
}

export default function Categories() {
  const { alert, confirm } = useDialog()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  useFormTabNavigation()

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    try {
      const data = await apiRequest('/categories')
      const list = Array.isArray(data) ? data : data?.items || []
      setCategories(list)
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(false)
  }

  function openCreate() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEdit(item: any) {
    setEditingId(item._id)
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      isActive: item.isActive !== false,
      showOnHomepage: item.showOnHomepage || false,
    })
    const photo = item.image || item.homepageCoverImage
    setImagePreview(photo ? getUploadUrl(photo, 'images/categories') : null)
    setImageFile(null)
    setRemoveImage(false)
    setIsModalOpen(true)
  }

  async function handleSubmit() {
    if (!formData.name.trim() || !formData.slug.trim()) {
      await alert('Category name and slug are both required.', 'warning')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', formData.name.trim())
      fd.append('slug', formData.slug.trim())
      fd.append('description', formData.description || '')
      fd.append('isActive', formData.isActive ? 'true' : 'false')
      fd.append('showOnHomepage', formData.showOnHomepage ? 'true' : 'false')

      if (imageFile) {
        fd.append('image', imageFile)
      } else if (removeImage) {
        fd.append('removeImage', 'true')
      }

      if (editingId) {
        const oldCategory = categories.find(c => c._id === editingId)
        await apiUpload(`/categories/${editingId}`, fd, 'PATCH')
        if (oldCategory) {
          await activityLoggers.category.updated(
            editingId,
            oldCategory,
            { ...oldCategory, ...formData },
            `Updated category: ${formData.name}`
          )
        }
        toast.success("Category updated successfully")
      } else {
        const res = await apiUpload('/categories', fd, 'POST')
        await activityLoggers.category.created(
          res._id || res.id,
          res,
          `Created category: ${formData.name}`
        )
        toast.success("Category created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchCategories()
      await alert(editingId ? 'Category updated.' : 'Category created.', 'success')
    } catch (err: any) {
      await alert(err.message || 'Failed to save category', 'error')
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    const categoryToDelete = categories.find(c => c._id === id)
    const ok = await confirm(
      `Delete “${categoryToDelete?.name || 'this category'}”? Products in it will no longer be grouped under it.`,
      'Delete Category',
    )
    if (!ok) return
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' })
      if (categoryToDelete) {
        await activityLoggers.category.deleted(id, categoryToDelete, `Deleted category: ${categoryToDelete.name}`)
      }
      fetchCategories()
      toast.success("Category deleted successfully")
    } catch (err: any) {
      await alert(err.message || 'Failed to delete', 'error')
      toast.error(err.message || 'Failed to delete')
    }
  }

  const yesNo = (v: boolean) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${v ? 'text-emerald-600' : 'text-charcoal/40'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v ? 'bg-emerald-500' : 'bg-charcoal/25'}`} />
      {v ? 'Yes' : 'No'}
    </span>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="Product categories shown on the website"
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary px-5 py-2.5">
            <Plus size={18} /> Add Category
          </button>
        }
      />

      <DataTable
        trail={[]}
        headerRight={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        loading={loading}
        columns={[
          {
            key: 'image',
            label: 'Photo',
            align: 'center',
            render: (_: any, r: any) => {
              const photo = r.image || r.homepageCoverImage
              return photo ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-gray shadow-xs mx-auto bg-stone-50 flex items-center justify-center">
                  <img
                    src={getUploadUrl(photo, 'images/categories')}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-lg border border-dashed border-border-gray/80 bg-charcoal/[0.02] flex flex-col items-center justify-center text-charcoal/35 text-[10px] mx-auto font-medium"
                  title="No photo uploaded"
                >
                  <ImageIcon size={14} className="opacity-40 mb-0.5" />
                  <span>None</span>
                </div>
              )
            },
          },
          { key: 'name', label: 'Category Name' },
          { key: 'slug', label: 'Slug' },
          { key: 'description', label: 'Description', render: (v: string) => v || '—', hideOnMobile: true },
          { key: 'isActive', label: 'Active', align: 'center', render: (v: boolean) => yesNo(v !== false), sortValue: (r: any) => (r.isActive !== false ? 1 : 0) },
          { key: 'showOnHomepage', label: 'On Homepage', align: 'center', render: (v: boolean) => yesNo(!!v), sortValue: (r: any) => (r.showOnHomepage ? 1 : 0) },
        ]}
        data={categories}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search categories by name or slug…"
        exportFileName="categories"
        emptyTitle="No categories yet"
        emptyDescription="Categories group your products on the website. Add your first one to get started."
        emptyAction={
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 inline-flex items-center gap-2">
            <Plus size={18} /> Add Category
          </button>
        }
      />

      <ShortcutHint keys={LIST_SHORTCUTS} />

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Category' : 'Add Category'}
        subtitle={editingId ? 'Changes apply to the website immediately.' : 'Categories group products on the shop page.'}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update' : 'Create'}
        submitting={submitting}
        disabled={!formData.name.trim() || !formData.slug.trim()}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <MediaUpload
            label="Category Photo"
            preview={imagePreview}
            fileName={imageFile?.name}
            maxMB={10}
            hint="JPG, PNG, WebP or SVG up to 10 MB. Displayed on storefront and showcase."
            onFileChange={(file, dataUrl) => {
              setImageFile(file)
              setImagePreview(dataUrl)
              setRemoveImage(false)
            }}
            onClear={() => {
              setImageFile(null)
              setImagePreview(null)
              setRemoveImage(true)
            }}
          />

          <div>
            <label className={stackedLabelCls}>Category Name <span className="text-rose-gold">*</span></label>
            <input
              type="text"
              tabIndex={1}
              value={formData.name}
              onChange={e => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: editingId ? formData.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                })
              }}
              placeholder="e.g. Dishwash Liquids"
              className={modalInputCls}
            />
          </div>
          <div>
            <label className={stackedLabelCls}>Slug <span className="text-rose-gold">*</span></label>
            <input
              type="text"
              tabIndex={2}
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. liquids"
              className={`${modalInputCls} font-mono`}
            />
            <p className="text-[11px] text-charcoal/55 mt-1">
              Used in the URL: accurateliquid.com/shop/<span className="font-mono">{formData.slug || 'slug'}</span>
            </p>
          </div>
          <div>
            <label className={stackedLabelCls}>Description</label>
            <textarea
              tabIndex={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category…"
              rows={3}
              className={`${modalInputCls} resize-none`}
            />
          </div>
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                tabIndex={4}
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-border-gray text-gold focus:ring-gold"
              />
              <span className="text-sm font-medium text-charcoal">Active</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                tabIndex={5}
                checked={formData.showOnHomepage}
                onChange={e => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                className="w-4 h-4 rounded border-border-gray text-gold focus:ring-gold"
              />
              <span className="text-sm font-medium text-charcoal">Show on Homepage</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
