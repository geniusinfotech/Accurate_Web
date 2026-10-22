'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { apiRequest } from '@/lib/api-client'
import { PageHeader } from '@/components/admin/AdminShell'
import { captionCls, inputCls, inr as num, tableHeadCls } from '@/lib/admin-ui'

// Sales report built from the orders API (the old ERP report endpoints no longer exist).
interface Order {
  _id: string
  orderNumber?: string
  createdAt: string
  customerName?: string
  items?: { quantity?: number }[]
  totalAmount?: number
  orderStatus: string
  paymentStatus: string
}

const inr = (n: number) => `₹${num(n)}`
const day = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const today = () => day(new Date())
const monthStart = () => day(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const yearStart = () => day(new Date(new Date().getFullYear(), 0, 1))

// Prepaid counts once paid; COD once delivered (same rule as the dashboard).
const isRevenue = (o: Order) =>
  o.orderStatus !== 'cancelled' && (o.paymentStatus === 'paid' || o.orderStatus === 'delivered')

const ref = (o: Order) => o.orderNumber || `#${o._id.slice(-6).toUpperCase()}`

export default function ReportsPage() {
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (from) qs.set('from', from)
      if (to) qs.set('to', to)
      const res: any = await apiRequest(`/orders?${qs}`)
      setOrders(Array.isArray(res) ? res : res?.items || [])
    } catch (e: any) {
      setOrders([])
      setError(e?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.orderStatus !== 'cancelled')
    const paid = live.filter(isRevenue)
    const revenue = paid.reduce((s, o) => s + (o.totalAmount || 0), 0)
    const pending = live.filter((o) => !isRevenue(o)).reduce((s, o) => s + (o.totalAmount || 0), 0)
    return {
      count: live.length,
      cancelled: orders.length - live.length,
      revenue,
      pending,
      avg: paid.length ? revenue / paid.length : 0,
    }
  }, [orders])

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['Order', 'Date', 'Customer', 'Items', 'Total', 'Order status', 'Payment status'],
      ...orders.map((o) => [
        ref(o),
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.customerName || 'Guest',
        (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
        o.totalAmount || 0,
        o.orderStatus,
        o.paymentStatus,
      ]),
    ]
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }),
    )
    const a = Object.assign(document.createElement('a'), { href: url, download: `sales-${from}-to-${to}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const range = (f: string, t: string) => () => {
    setFrom(f)
    setTo(t)
  }
  const chip =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Sales from website orders for the chosen period"
        actions={
          <>
            <button type="button" onClick={exportCsv} disabled={!orders.length} className={`${chip} inline-flex items-center gap-2 disabled:opacity-50`}>
              <Download size={14} /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className={`${chip} inline-flex items-center gap-2`}>
              <Printer size={14} /> Print
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className={`${captionCls} mb-1 block`}>From</label>
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={`${captionCls} mb-1 block`}>To</label>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
        <button type="button" className={chip} onClick={range(today(), today())}>Today</button>
        <button type="button" className={chip} onClick={range(monthStart(), today())}>This month</button>
        <button type="button" className={chip} onClick={range(yearStart(), today())}>This year</button>
        <button type="button" className={chip} onClick={range('', '')}>All time</button>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Orders', String(stats.count)],
          ['Revenue', inr(stats.revenue)],
          ['Awaiting payment', inr(stats.pending)],
          ['Avg order value', inr(stats.avg)],
          ['Cancelled', String(stats.cancelled)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className={tableHeadCls}>
            <tr>
              {['Order', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Payment'].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{ref(o)}</td>
                <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">{o.customerName || 'Guest'}</td>
                <td className="px-4 py-3">{(o.items || []).reduce((s, i) => s + (i.quantity || 0), 0)}</td>
                <td className="px-4 py-3 font-semibold">{inr(o.totalAmount || 0)}</td>
                <td className="px-4 py-3 capitalize">{o.orderStatus}</td>
                <td className="px-4 py-3 capitalize">{o.paymentStatus}</td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">No orders in this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
