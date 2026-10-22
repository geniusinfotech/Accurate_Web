'use client'

import { useState, useEffect } from 'react'
import { apiRequest, apiUpload } from '@/lib/api-client'
import { getUploadUrl } from '@/lib/api'
import Modal from '@/components/admin/Modal'
import MediaUpload from '@/components/admin/MediaUpload'
import { useDialog } from '@/components/admin/ConfirmDialog'
import { PageHeader } from '@/components/admin/AdminShell'
import { modalInputCls, stackedLabelCls, formatBillDate } from '@/lib/admin-ui'
import { Plus, Power } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { DataTable } from '@/components/admin/DataTable'
import { ShortcutHint, LIST_SHORTCUTS } from '@/components/admin/ShortcutHint'
import type { DealOffer as DealOfferType } from '@/lib/types/api'

interface DealOffer extends DealOfferType {}

const emptyForm = {
  title: '',
  description: '',
  discountPercentage: 10,
  couponCode: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Offers() {
  const { alert, confirm } = useDialog()
  const toast = useToast()
  const [offers, setOffers] = useState<DealOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({ ...emptyForm })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)


  useEffect(() => { fetchOffers() }, [])

  async function fetchOffers() {
    try {
      const data: any = await apiRequest('/deals-offers')
      const list = Array.isArray(data) ? data : data?.items || []
      setOffers(list)
    } catch { setOffers([])
    } finally { setLoading(false) }
  }

  function resetForm() {
    setFormData({ ...emptyForm })
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
  }

  function openCreate() {
    resetForm()
    // Default the window to "starting now, running a fortnight".
    const now = new Date()
    const fortnight = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    setFormData({
      ...emptyForm,
      validFrom: toLocalInput(now.toISOString()),
      validUntil: toLocalInput(fortnight.toISOString()),
    })
    setIsModalOpen(true)
  }

  function openEdit(offer: DealOffer) {
    setEditingId(offer._id)
    setFormData({
      title: offer.title,
      description: offer.description || '',
      discountPercentage: offer.discountPercentage ?? 10,
      couponCode: offer.couponCode || '',
      validFrom: offer.validFrom ? toLocalInput(offer.validFrom) : '',
      validUntil: offer.validUntil ? toLocalInput(offer.validUntil) : '',
      isActive: offer.isActive !== false,
    })
    setImagePreview(offer.image ? getUploadUrl(offer.image) : null)
    setImageFile(null)
    setIsModalOpen(true)
  }



  const datesReversed =
    !!formData.validFrom && !!formData.validUntil && formData.validFrom >= formData.validUntil
  const valid =
    formData.title.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.discountPercentage > 0 &&
    formData.discountPercentage <= 100 &&
    !!formData.validFrom &&
    !!formData.validUntil &&
    !datesReversed

  async function handleSubmit() {
    if (!formData.title.trim() || !formData.description.trim() || !formData.discountPercentage) {
      await alert('Title, description and discount % are all required.', 'warning')
      return
    }
    // The API wants ISO timestamps; empty strings would produce Invalid Date.
    if (!formData.validFrom || !formData.validUntil) {
      await alert('Set both the start and end of the offer window.', 'warning')
      return
    }
    if (datesReversed) {
      await alert('The offer must end after it starts.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('description', formData.description)
      fd.append('discountPercentage', String(formData.discountPercentage))
      fd.append('couponCode', formData.couponCode)
      fd.append('validFrom', new Date(formData.validFrom).toISOString())
      fd.append('validUntil', new Date(formData.validUntil).toISOString())
      fd.append('isActive', formData.isActive ? 'true' : 'false')
      if (imageFile) fd.append('image', imageFile)

      if (editingId) {
        await apiUpload(`/deals-offers/${editingId}`, fd, 'PATCH')
        toast.success("Offer updated successfully")
      } else {
        await apiUpload('/deals-offers', fd)
        toast.success("Offer created successfully")
      }
      setIsModalOpen(false)
      resetForm()
      fetchOffers()
      await alert(editingId ? 'Offer updated.' : 'Offer created.', 'success')
    } catch (err: any) {
      await alert(err.message || 'Failed to save offer', 'error')
      toast.error(err.message || 'Failed to save offer')
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    const o = offers.find(x => x._id === id)
    const ok = await confirm(
      `Delete the offer “${o?.title || 'this offer'}”? It disappears from the homepage straight away.`,
      'Delete Offer',
    )
    if (!ok) return
    try {
      await apiRequest(`/deals-offers/${id}`, { method: 'DELETE' })
      fetchOffers()
      toast.success("Offer deleted successfully")
    } catch (err: any) {
      await alert(err.message || 'Failed to delete', 'error')
      toast.error(err.message || 'Failed to delete')
    }
  }

  async function toggleActive(id: string) {
    try {
      await apiRequest(`/deals-offers/${id}/toggle-active`, { method: 'PATCH' })
      fetchOffers()
      toast.success("Offer status updated")
    } catch (err: any) {
      await alert(err.message || 'Failed to change the offer status', 'error')
      toast.error(err.message || 'Failed to change the offer status')
    }
  }

  const expired = (o: DealOffer) => !!o.validUntil && new Date(o.validUntil) < new Date()
  const liveCount = offers.filter(o => o.isActive !== false && !expired(o)).length

  return (
    <div className="space-y-4">
      <PageHeader
        title="Offers & Deals"
        description="The promotional offer banner shown on the homepage"
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary px-5 py-2.5">
            <Plus size={18} /> Add Offer
          </button>
        }
      />


      <DataTable
        trail={[]}
        headerRight={`${liveCount} live of ${offers.length}`}
        loading={loading}
        defaultPageSize={25}
        columns={[
          {
            key: 'image',
            label: 'Image',
            sortable: false,
            width: 'w-28',
            render: (v: string) =>
              !v ? '—' : (
                <img src={getUploadUrl(v)} alt="" className="w-20 h-12 object-cover rounded-sm border border-border-gray" />
              ),
          },
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
            key: 'discountPercentage',
            label: 'Off %',
            align: 'center',
            width: 'w-20',
            render: (v: number) => (v != null ? `${v}%` : '—'),
          },
          {
            key: 'couponCode',
            label: 'Promo Code',
            render: (v: string) => v ? (
              <span className="font-mono tracking-wider text-sm">{v}</span>
            ) : '—',
          },
          {
            key: 'validFrom',
            label: 'Valid From',
            hideOnMobile: true,
            sortValue: (r: DealOffer) => new Date(r.validFrom).getTime() || 0,
            render: (v: string) => formatBillDate(v),
          },
          {
            key: 'validUntil',
            label: 'Valid Until',
            hideOnMobile: true,
            sortValue: (r: DealOffer) => new Date(r.validUntil).getTime() || 0,
            render: (v: string) => formatBillDate(v),
          },
          {
            key: 'isActive',
            label: 'Status',
            align: 'center',
            sortValue: (r: DealOffer) => (r.isActive !== false && !expired(r) ? 1 : 0),
            render: (_v: any, row: DealOffer) => {
              const isExpired = expired(row)
              const live = row.isActive !== false && !isExpired
              return (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  live ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/5 text-charcoal/45'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-charcoal/30'}`} />
                  {isExpired ? 'Expired' : live ? 'Live' : 'Hidden'}
                </span>
              )
            },
          },
        ]}
        data={[...offers].sort((a, b) =>
          new Date(b.validFrom || b.createdAt).getTime() - new Date(a.validFrom || a.createdAt).getTime()
        )}
        onEdit={openEdit}
        onDelete={handleDelete}
        customActions={(row: DealOffer) => (
          <button
            type="button"
            onClick={() => toggleActive(row._id)}
            className="p-1.5 text-charcoal/60 hover:text-gold-deep rounded hover:bg-gold/10 transition-colors"
            title={row.isActive !== false ? 'Deactivate' : 'Activate'}
          >
            <Power size={16} />
          </button>
        )}
        searchPlaceholder="Search offers by title…"
        exportFileName="offers"
        emptyTitle="No offers yet"
        emptyDescription="Offers you create will appear here and on the homepage banner."
        emptyAction={
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 inline-flex items-center gap-2">
            <Plus size={18} /> Add Offer
          </button>
        }
      />

      <ShortcutHint keys={LIST_SHORTCUTS} />

      <Modal
        isOpen={isModalOpen}
        maxWidth="max-w-xl md:max-w-2xl"
        title={editingId ? 'Edit Offer' : 'Add Offer'}
        subtitle="Runs on the homepage between the start and end times below."
        onClose={() => { setIsModalOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update' : 'Create'}
        submitting={submitting}
        disabled={!valid}
      >
        <div className="space-y-4">
          <div>
            <label className={stackedLabelCls}>Title <span className="text-rose-gold">*</span></label>
            <input
              type="text"
              tabIndex={1}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Heritage Collection"
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>Description <span className="text-rose-gold">*</span></label>
            <textarea
              tabIndex={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What the offer covers…"
              rows={3}
              className={`${modalInputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={stackedLabelCls}>Discount % <span className="text-rose-gold">*</span></label>
              <input
                type="number"
                tabIndex={3}
                value={formData.discountPercentage}
                onChange={e => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                min="1"
                max="100"
                className={modalInputCls}
              />
            </div>
            <div>
              <label className={stackedLabelCls}>Promo Code</label>
              <input
                type="text"
                tabIndex={4}
                value={formData.couponCode}
                onChange={e => setFormData({ ...formData, couponCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                placeholder="e.g. ROYAL20"
                className={`${modalInputCls} font-mono tracking-wider`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={stackedLabelCls}>Valid From <span className="text-rose-gold">*</span></label>
              <input
                type="datetime-local"
                tabIndex={5}
                value={formData.validFrom}
                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                className={modalInputCls}
              />
            </div>
            <div>
              <label className={stackedLabelCls}>Valid Until <span className="text-rose-gold">*</span></label>
              <input
                type="datetime-local"
                tabIndex={6}
                value={formData.validUntil}
                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                className={`${modalInputCls} ${datesReversed ? 'border-rose-gold' : ''}`}
              />
              {datesReversed && (
                <p className="text-[11px] text-rose-gold mt-1">Must be after the start time.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              tabIndex={7}
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-border-gray accent-gold"
            />
            <span className="text-sm font-medium text-charcoal">Active</span>
          </label>

          <MediaUpload
            label="Offer Image"
            preview={imagePreview}
            fileName={imageFile?.name}
            maxMB={10}
            onFileChange={(file, dataUrl) => { setImageFile(file); setImagePreview(dataUrl) }}
            onClear={() => { setImageFile(null); setImagePreview(null) }}
          />
        </div>
      </Modal>
    </div>
  )
}
