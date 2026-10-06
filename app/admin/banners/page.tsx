'use client'

import { useState, useEffect } from 'react'
import { apiRequest, apiUpload } from '@/lib/api-client'
import { getUploadUrl } from '@/lib/api'
import Modal from '@/components/admin/Modal'
import MediaUpload from '@/components/admin/MediaUpload'
import { useDialog } from '@/components/admin/ConfirmDialog'
import { PageHeader } from '@/components/admin/AdminShell'
import { modalInputCls, stackedLabelCls } from '@/lib/admin-ui'
import { Plus, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { DataTable } from '@/components/admin/DataTable'
import { ShortcutHint, LIST_SHORTCUTS } from '@/components/admin/ShortcutHint'
import { useFormTabNavigation } from '@/components/admin/useFormTabNavigation'
import type { Banner } from '@/lib/types/api'

const emptyForm = {
  title: '', description: '', link: '', ctaText: '', displayOrder: 0, isActive: true,
}

export default function Banners() {
  const { alert, confirm } = useDialog()
  const toast = useToast()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({ ...emptyForm })
  const [desktopFile, setDesktopFile] = useState<File | null>(null)
  const [mobileFile, setMobileFile] = useState<File | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)

  useFormTabNavigation()

  useEffect(() => { fetchBanners() }, [])

  async function fetchBanners() {
    try {
      const data = await apiRequest('/banners')
      const list = Array.isArray(data) ? data : data?.items || []
      setBanners(list)
    } catch { setBanners([])
    } finally { setLoading(false) }
  }

  function resetForm() {
    setFormData({ ...emptyForm })
    setEditingId(null)
    setDesktopFile(null); setMobileFile(null)
    setDesktopPreview(null); setMobilePreview(null)
  }

  function openCreate() {
    resetForm()
    // New banners go to the end of the carousel by default.
    setFormData({ ...emptyForm, displayOrder: banners.length })
    setIsModalOpen(true)
  }

  function openEdit(banner: any) {
    setEditingId(banner._id)
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      ctaText: banner.ctaText || '',
      displayOrder: banner.displayOrder ?? 0,
      isActive: banner.isActive !== false,
    })
    setDesktopPreview(banner.desktopMedia ? getUploadUrl(banner.desktopMedia, 'banners') : null)
    setMobilePreview(banner.mobileMedia ? getUploadUrl(banner.mobileMedia, 'banners') : null)
    setDesktopFile(null); setMobileFile(null)
    setIsModalOpen(true)
  }


  const valid = formData.title.trim().length > 0 && (editingId || desktopFile)

  async function handleSubmit() {
    if (!formData.title.trim()) { await alert('Give the banner a title.', 'warning'); return }
    if (!editingId && !desktopFile) { await alert('A desktop image or video is required.', 'warning'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('description', formData.description)
      fd.append('link', formData.link)
      fd.append('ctaText', formData.ctaText)
      fd.append('displayOrder', String(formData.displayOrder))
      fd.append('isActive', formData.isActive ? 'true' : 'false')
      if (desktopFile) fd.append('desktopMedia', desktopFile)
      if (mobileFile) fd.append('mobileMedia', mobileFile)

      if (editingId) {
        await apiUpload(`/banners/${editingId}`, fd, 'PATCH')
        toast.success("Banner updated successfully")
      } else {
        await apiUpload('/banners', fd)
        toast.success("Banner created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchBanners()
      await alert(editingId ? 'Banner updated.' : 'Banner added.', 'success')
    } catch (err: any) {
      await alert(err.message || 'Failed to save banner', 'error')
      toast.error(err.message || 'Failed to save banner')
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    const b = banners.find(x => x._id === id)
    const ok = await confirm(
      `Delete the banner “${b?.title || 'this banner'}”? It will be removed from the homepage.`,
      'Delete Banner',
    )
    if (!ok) return
    try {
      await apiRequest(`/banners/${id}`, { method: 'DELETE' })
      fetchBanners()
      toast.success("Banner deleted successfully")
    } catch (err: any) {
      await alert(err.message || 'Failed to delete', 'error')
      toast.error(err.message || 'Failed to delete')
    }
  }

  const isVideoName = (v: string) => /\.(mp4|webm|mov|ogg)$/i.test(v || '')

  return (
    <div className="space-y-4">
      <PageHeader
        title="Banners"
        description="Hero banners and slides on the homepage, shown in display order"
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary px-5 py-2.5">
            <Plus size={18} /> Add Banner
          </button>
        }
      />

      <DataTable
        trail={[]}
        headerRight={`${banners.filter(b => b.isActive !== false).length} live of ${banners.length}`}
        loading={loading}
        defaultPageSize={25}
        columns={[
          {
            key: 'desktopMedia',
            label: 'Media',
            sortable: false,
            width: 'w-28',
            render: (v: string) =>
              !v ? '—' : isVideoName(v) ? (
                <video src={getUploadUrl(v, 'banners')} className="w-20 h-12 object-cover rounded-sm bg-charcoal/5" muted playsInline />
              ) : (
                <img src={getUploadUrl(v, 'banners')} alt="" className="w-20 h-12 object-cover rounded-sm border border-border-gray" />
              ),
          },
          { key: 'displayOrder', label: 'Order', align: 'center', width: 'w-20' },
          { key: 'title', label: 'Title' },
          {
            key: 'description',
            label: 'Description',
            hideOnMobile: true,
            render: (v: string) => (
              <span className="block max-w-xs truncate" title={v}>{v || '—'}</span>
            ),
          },
          {
            key: 'link',
            label: 'Links To',
            hideOnMobile: true,
            render: (v: string) => v ? (
              <a href={v} target="_blank" rel="noopener noreferrer" className="text-gold-deep hover:underline text-sm inline-flex items-center gap-1">
                {v} <ExternalLink size={12} />
              </a>
            ) : '—',
          },
          {
            key: 'isActive',
            label: 'Status',
            align: 'center',
            sortValue: (r: any) => (r.isActive !== false ? 1 : 0),
            render: (_v: any, row: any) => (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/5 text-charcoal/45'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${row.isActive !== false ? 'bg-emerald-500' : 'bg-charcoal/30'}`} />
                {row.isActive !== false ? 'Live' : 'Hidden'}
              </span>
            ),
          },
        ]}
        data={[...banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search banners by title…"
        exportFileName="banners"
        emptyTitle="No banners yet"
        emptyDescription="Banners fill the hero area at the top of the homepage."
        emptyAction={
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 inline-flex items-center gap-2">
            <Plus size={18} /> Add Banner
          </button>
        }
      />

      <ShortcutHint keys={LIST_SHORTCUTS} />

      <Modal
        isOpen={isModalOpen}
        maxWidth="max-w-xl md:max-w-2xl"
        title={editingId ? 'Edit Banner' : 'Add Banner'}
        subtitle="Lower display order shows first in the carousel."
        onClose={() => { setIsModalOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update' : 'Create'}
        submitting={submitting}
        disabled={!valid}
      >
        <div className="space-y-4">
          <div>
            <label className={stackedLabelCls}>Name <span className="text-rose-gold">*</span> <span className="font-normal normal-case text-charcoal/50">— for your reference and screen readers, not shown on the site</span></label>
            <input
              type="text"
              tabIndex={1}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Monsoon offer"
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>Link (optional — where a click on the banner goes)</label>
            <input
              type="text"
              tabIndex={2}
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
              placeholder="/shop"
              className={modalInputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={stackedLabelCls}>Display Order</label>
              <input
                type="number"
                tabIndex={5}
                value={formData.displayOrder}
                onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                min="0"
                className={modalInputCls}
              />
              <p className="text-[11px] text-charcoal/50 mt-1">0 shows first.</p>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  tabIndex={6}
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border-gray accent-gold"
                />
                <span className="text-sm font-medium text-charcoal">Show on homepage</span>
              </label>
            </div>
          </div>

          <MediaUpload
            label="Desktop Media"
            required={!editingId}
            accept="image/*,video/*"
            maxMB={20}
            hint="Exactly 1920 × 800 px, up to 20 MB. Put any text inside the image — none is added on the site."
            preview={desktopPreview}
            fileName={desktopFile?.name}
            onFileChange={(file, dataUrl) => { setDesktopFile(file); setDesktopPreview(dataUrl) }}
            onClear={() => { setDesktopFile(null); setDesktopPreview(null) }}
          />

          <MediaUpload
            label="Mobile Media"
            accept="image/*,video/*"
            maxMB={20}
            hint="Exactly 1080 × 1000 px, up to 20 MB. If empty, the desktop image is shown (fitted, with side margins)."
            preview={mobilePreview}
            fileName={mobileFile?.name}
            onFileChange={(file, dataUrl) => { setMobileFile(file); setMobilePreview(dataUrl) }}
            onClear={() => { setMobileFile(null); setMobilePreview(null) }}
          />
        </div>
      </Modal>
    </div>
  )
}
