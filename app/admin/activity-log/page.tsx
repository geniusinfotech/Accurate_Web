'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/admin/Modal'
import { apiRequest } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { PageHeader, PageLoader } from '@/components/admin/AdminShell'
import { inputCls } from '@/lib/admin-ui'
import { Filter, ChevronDown, X, ArrowRight, User, Package, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { DataTable } from '@/components/admin/DataTable'

/* ---------- Friendly formatting helpers ---------- */

const FIELD_LABELS: Record<string, string> = {
  customerName: 'Customer',
  customerId: 'Customer',
  dealerName: 'Dealer',
  workerName: 'Worker',
  orderNumber: 'Order no.',
  saleNumber: 'Sale no.',
  totalAmount: 'Total amount',
  grandTotal: 'Grand total',
  total: 'Total',
  price: 'Price',
  mrp: 'MRP',
  stock: 'Stock',
  quantity: 'Quantity',
  status: 'Status',
  paymentStatus: 'Payment',
  paymentMethod: 'Payment method',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  name: 'Name',
  title: 'Title',
  code: 'Code',
  sku: 'SKU',
  description: 'Description',
  notes: 'Notes',
  isActive: 'Active',
  lotId: 'Lot',
  kgGivenOut: 'Kg given',
  kgReturned: 'Kg returned',
  pcsGivenOut: 'Pcs given',
  pcsReturned: 'Pcs returned',
}

function humanizeField(field: string): string {
  if (!field) return 'Field'
  if (FIELD_LABELS[field]) return FIELD_LABELS[field]
  return field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

function humanizeEntity(entityType: any): string {
  if (!entityType) return 'Record'
  const raw = String(entityType)
  const map: Record<string, string> = {
    RawMaterial: 'Raw material',
    WorkBatch: 'Work batch',
    WorkerPayment: 'Worker payment',
    SemiFinishedStock: 'Semi-finished stock',
    Sale: 'Sale',
    Order: 'Order',
    Product: 'Product',
    Dealer: 'Dealer',
    Customer: 'Customer',
    Category: 'Category',
  }
  if (map[raw]) return map[raw]
  const spaced = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

const ACTION_META: Record<string, { label: string; classes: string }> = {
  create: { label: 'Created', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  created: { label: 'Created', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  update: { label: 'Updated', classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
  updated: { label: 'Updated', classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
  delete: { label: 'Deleted', classes: 'bg-rose-50 text-rose-700 border border-rose-200' },
  deleted: { label: 'Deleted', classes: 'bg-rose-50 text-rose-700 border border-rose-200' },
  mark_done: { label: 'Completed', classes: 'bg-violet-50 text-violet-700 border border-violet-200' },
  completed: { label: 'Completed', classes: 'bg-violet-50 text-violet-700 border border-violet-200' },
}

function actionMeta(action: any) {
  const key = String(action || '').toLowerCase()
  return ACTION_META[key] || { label: humanizeField(String(action || 'Event')), classes: 'bg-cream text-charcoal border border-border-gray' }
}

const isObjectIdLike = (v: string) => /^[a-f0-9]{24}$/i.test(v)

function formatFriendlyValue(v: any, field = ''): string {
  if (v === undefined || v === null || v === '') return '—'
  if (typeof v === 'string' && v === '[REDACTED]') return 'Hidden for privacy'
  if (typeof v === 'boolean') {
    // isActive reads better as Active / Inactive
    if (field === 'isActive') return v ? 'Active' : 'Inactive'
    return v ? 'Yes' : 'No'
  }
  if (typeof v === 'number') {
    if (/amount|total|price|charge|balance|mrp/i.test(field)) {
      return `₹${v.toLocaleString('en-IN')}`
    }
    return v.toLocaleString('en-IN')
  }
  if (typeof v === 'string') {
    const t = v.trim()
    // ISO date → "12 Jan 2026, 3:45 pm"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t)) {
      const d = new Date(t)
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      }
    }
    // Long ObjectId → short "…a3f9c1"
    if (isObjectIdLike(t)) return `…${t.slice(-6)}`
    // JSON-encoded array/object stored as string — try to unpack
    if ((t.startsWith('[') || t.startsWith('{')) && t.length < 2000) {
      try {
        return formatFriendlyValue(JSON.parse(t), field)
      } catch { /* fall through */ }
    }
    return t.length > 80 ? `${t.slice(0, 80)}…` : t
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return 'None'
    if (v.every((x) => typeof x === 'string' || typeof x === 'number')) {
      const joined = v.map((x) => formatFriendlyValue(x)).join(', ')
      return joined.length > 80 ? `${v.length} items: ${joined.slice(0, 80)}…` : joined
    }
    return `${v.length} item${v.length === 1 ? '' : 's'}`
  }
  if (typeof v === 'object') {
    const o = v as Record<string, any>
    const name = o.name || o.title || o.customerName || o.orderNumber || o.saleNumber || o.code || o.email
    if (name) return formatFriendlyValue(name)
    const keys = Object.keys(o)
    if (keys.length === 0) return '—'
    if (keys.length <= 3) {
      return keys.map((k) => `${humanizeField(k)}: ${formatFriendlyValue(o[k], k)}`).join(' · ')
    }
    return `${keys.length} fields changed`
  }
  return String(v)
}

function pickDisplayName(obj: any): string {
  if (!obj || typeof obj !== 'object') return ''
  const c = obj.name || obj.title || obj.customerName || obj.dealerName
    || (obj.orderNumber ? `#${obj.orderNumber}` : '') || (obj.saleNumber ? `${obj.saleNumber}` : '')
    || obj.code || obj.sku || obj.email || obj.lotId
  return typeof c === 'string' && c.trim() ? c.trim() : ''
}

/** True when the stored summary is the old generic "update Product <id>" shape. */
function isGenericSummary(summary: any): boolean {
  if (!summary || typeof summary !== 'string') return true
  return /^(create|update|delete|mark_done)\s+\S+\s+[A-Za-z0-9…\-_]+$/i.test(summary.trim())
}

/** Plain-language headline, e.g. `Asha updated Product "Floor Cleaner": Price ₹100 → ₹120`. */
function friendlyHeadline(log: any): string {
  const verb = actionMeta(log.action || log.type).label
  const entity = humanizeEntity(log.entityType || log.entity || log.resource)
  const name = pickDisplayName(log.after) || pickDisplayName(log.before)
  const who = log.actorName || log.actor || log.user?.name || ''

  if (log.summary && !isGenericSummary(log.summary)) return log.summary

  const changes = Array.isArray(log.changes) ? log.changes : []
  const what = name ? `${entity} "${name}"` : entity
  if (changes.length > 0) {
    const first = changes.slice(0, 2)
      .map((c: any) => `${humanizeField(c.field)} ${formatFriendlyValue(c.from, c.field)} → ${formatFriendlyValue(c.to, c.field)}`)
      .join('; ')
    const extra = changes.length > 2 ? ` (+${changes.length - 2} more)` : ''
    return who ? `${who} ${verb.toLowerCase()} ${what}: ${first}${extra}` : `${verb} ${what}: ${first}${extra}`
  }
  return who ? `${who} ${verb.toLowerCase()} ${what}` : `${verb} ${what}`
}

const formatLogTime = (value: any) =>
  value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'

const formatLogTimeShort = (value: any) =>
  value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'

const ENTITY_OPTIONS = ['Product', 'Order', 'Sale', 'Dealer', 'Customer', 'RawMaterial', 'WorkBatch', 'WorkerPayment', 'SemiFinishedStock', 'Category']
const ACTION_OPTIONS = [
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'mark_done', label: 'Completed' },
]

export default function ActivityLogPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actorFilter, setActorFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any | null>(null)

  // Route gating: Admin or Manager with view_activity_log permission
  useEffect(() => {
    if (!authLoading) {
      if (!user || (!isAdmin && user.role !== 'admin' && user.role !== 'manager')) {
        router.push('/admin')
      }
    }
  }, [authLoading, user, isAdmin, router])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (actorFilter) queryParams.append('actorId', actorFilter)
      if (entityFilter) queryParams.append('entityType', entityFilter)
      if (actionFilter) queryParams.append('action', actionFilter)
      if (dateFrom) queryParams.append('from', dateFrom)
      if (dateTo) queryParams.append('to', dateTo)
      queryParams.append('page', '1')
      queryParams.append('limit', '200')

      const queryString = queryParams.toString()
      const data = await apiRequest(`/activity-log${queryString ? `?${queryString}` : ''}`).catch(() => [])
      const list = Array.isArray(data) ? data : data?.items || data?.logs || []
      setLogs(list)
    } catch (err) {
      console.error('Failed to fetch activity logs:', err)
      setLogs([])
      toast.error('Failed to fetch activity logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && (isAdmin || user.role === 'admin' || user.role === 'manager')) {
      fetchLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorFilter, actionFilter, entityFilter, dateFrom, dateTo, user, isAdmin])

  const activeFilterCount = [actorFilter, actionFilter, entityFilter, dateFrom, dateTo].filter(Boolean).length

  const clearFilters = () => {
    setActorFilter('')
    setActionFilter('')
    setEntityFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const tableData = useMemo(() => logs.map((log: any) => {
    const headline = friendlyHeadline(log)
    return {
      id: log._id || log.id,
      timestamp: log.createdAt || log.timestamp,
      actor: log.actorName || log.user?.name || log.actor || 'System',
      actorRole: log.actorRole || log.userRole || '',
      action: log.action || log.type || 'EVENT',
      entity: humanizeEntity(log.entityType || log.entity || log.resource),
      details: headline,
      _raw: log,
    }
  }), [logs])

  if (authLoading || (!isAdmin && user?.role !== 'admin' && user?.role !== 'manager')) {
    return <PageLoader label="Checking access…" />
  }

  const renderLogDetails = (log: any) => {
    const meta = actionMeta(log.action || log.type)
    const changes = Array.isArray(log.changes) ? log.changes : []
    const headline = friendlyHeadline(log)
    const actorName = log.actorName || log.actor || log.user?.name || 'System'
    const entityLabel = humanizeEntity(log.entityType || log.entity || log.resource)
    const displayName = pickDisplayName(log.after) || pickDisplayName(log.before)

    return (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-charcoal">{headline}</p>

        <div className="flex items-center gap-2 flex-wrap text-xs text-charcoal/60">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.classes}`}>
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package size={13} className="text-charcoal/40" />
            {entityLabel}{displayName ? ` · ${displayName}` : ''}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-charcoal/40" />
            {formatLogTime(log.createdAt || log.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-cream/60 border border-border-gray p-4 rounded-md text-xs">
          <span className="w-9 h-9 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0">
            <User size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-charcoal truncate">{actorName}</p>
            <p className="text-charcoal/60 capitalize">{log.actorRole || log.userRole || 'Team member'}</p>
          </div>
        </div>

        {changes.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
              What changed ({changes.length})
            </p>
            <ul className="divide-y divide-border-gray/60 border border-border-gray rounded-md overflow-hidden">
              {changes.map((c: any, idx: number) => (
                <li key={idx} className="px-4 py-3 bg-white">
                  <p className="text-xs font-semibold text-charcoal">{humanizeField(c.field)}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 line-through decoration-rose-300 text-xs max-w-full break-words">
                      {formatFriendlyValue(c.from, c.field)}
                    </span>
                    <ArrowRight size={14} className="text-charcoal/40 shrink-0" />
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold max-w-full break-words">
                      {formatFriendlyValue(c.to, c.field)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-charcoal/50 bg-light-gray/60 border border-border-gray rounded-md px-4 py-3">
            No field-by-field changes were recorded for this event — the headline above says what happened.
          </p>
        )}

        {/* Technical snapshot, tucked away — support staff can still inspect it. */}
        <details className="text-xs text-charcoal/60">
          <summary className="cursor-pointer font-semibold hover:text-charcoal">Technical details</summary>
          <div className="mt-2 space-y-1 font-mono break-all">
            {log.entityId && <p>Record ID: {log.entityId}</p>}
            {log.actorId && <p>Actor ID: {typeof log.actorId === 'object' ? JSON.stringify(log.actorId) : String(log.actorId)}</p>}
            {log._id && <p>Log ID: {log._id}</p>}
          </div>
        </details>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activity Log"
        description="Plain-language history of everything changed — who did what, and when"
      />

      <DataTable
        trail={[]}
        headerRight={`${logs.length} event${logs.length === 1 ? '' : 's'}${logs.length >= 200 ? ' (latest 200)' : ''}`}
        loading={loading}
        defaultPageSize={25}
        columns={[
          {
            key: 'timestamp',
            label: 'When',
            render: (v: any) => <span className="whitespace-nowrap text-charcoal/80">{formatLogTimeShort(v)}</span>,
            sortValue: (r: any) => (r.timestamp ? new Date(r.timestamp).getTime() : 0),
          },
          {
            key: 'actor',
            label: 'Who',
            render: (v: any, row: any) => (
              <span>
                <span className="block font-medium text-charcoal">{v}</span>
                {row.actorRole && <span className="block text-[11px] text-charcoal/50 capitalize">{row.actorRole}</span>}
              </span>
            ),
          },
          {
            key: 'action',
            label: 'Action',
            render: (value: any) => {
              const meta = actionMeta(value)
              return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${meta.classes}`}>
                  {meta.label}
                </span>
              )
            },
          },
          { key: 'entity', label: 'Item' },
          {
            key: 'details',
            label: 'What happened',
            hideOnMobile: true,
            render: (v: string) => (
              <span className="block max-w-md whitespace-normal leading-snug text-charcoal/80" title={v}>{v}</span>
            ),
          },
        ]}
        data={tableData}
        searchPlaceholder="Search by person, item, or change…"
        exportFileName="activity-log"
        emptyTitle="No activity recorded"
        emptyDescription={
          activeFilterCount > 0
            ? 'No events match these filters. Try widening the date range.'
            : 'Changes made in the dashboard will show up here in plain language.'
        }
        emptyAction={
          activeFilterCount > 0 ? (
            <button onClick={clearFilters} className="btn-secondary px-4 py-2 text-sm">
              Clear filters
            </button>
          ) : undefined
        }
        toolbar={
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`inline-flex items-center gap-1.5 border rounded-sm px-3 py-2 text-sm transition-colors ${
              activeFilterCount > 0
                ? 'border-gold bg-gold/10 text-gold-deep font-semibold'
                : 'border-border-gray text-charcoal hover:bg-cream'
            }`}
          >
            <Filter size={15} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-gold text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
        customActions={(row: any) => (
          <button
            onClick={() => setSelectedLog(row._raw)}
            className="p-2 text-burgundy hover:bg-burgundy/10 rounded transition-colors"
            title="Show full details"
          >
            <ChevronDown size={17} />
          </button>
        )}
      />

      {/* Server-side filters — these re-query the API, so they sit outside the table. */}
      {showFilters && (
        <div className="bg-white p-4 rounded-sm border border-border-gray space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-charcoal">Filter from the server</p>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1.5 text-charcoal/40 hover:text-charcoal rounded"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-charcoal/50 block mb-1">Person (user ID)</label>
              <input
                type="text"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                placeholder="Paste a user ID to narrow to one person"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-charcoal/50 block mb-1">Action</label>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={inputCls}>
                <option value="">All actions</option>
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-charcoal/50 block mb-1">Item type</label>
              <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className={inputCls}>
                <option value="">Everything</option>
                {ENTITY_OPTIONS.map((e) => (
                  <option key={e} value={e}>{humanizeEntity(e)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-charcoal/50 block mb-1">From date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-charcoal/50 block mb-1">To date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex items-end">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-rose-gold hover:underline py-1.5"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="What happened?"
        subtitle={selectedLog ? formatLogTime(selectedLog.createdAt || selectedLog.timestamp) : undefined}
        footer={
          <button onClick={() => setSelectedLog(null)} className="flex-1 btn-secondary py-2.5">
            Close
          </button>
        }
      >
        {selectedLog && renderLogDetails(selectedLog)}
      </Modal>
    </div>
  )
}
