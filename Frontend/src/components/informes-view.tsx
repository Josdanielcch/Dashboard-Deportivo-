'use client'

import { FileText, Calendar, DollarSign, Package, Clock, RefreshCw, Filter, Activity, LayoutGrid, Printer, Users } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { reportService } from '@/services/reportService'
import StackedAreaChart from '@/components/stacked-area-chart'

const CHART_COLORS = ['#ccff00', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#f43f5e', '#8b5cf6']

type ReportTab = 'sales' | 'products' | 'courts' | 'bookings' | 'customers' | 'utilization'

const TABS: { key: ReportTab; label: string; icon: any }[] = [
  { key: 'sales', label: 'Ventas', icon: DollarSign },
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'courts', label: 'Canchas', icon: LayoutGrid },
  { key: 'bookings', label: 'Reservas', icon: Calendar },
  { key: 'customers', label: 'Clientes', icon: Users },
  { key: 'utilization', label: 'Ocupacion', icon: Activity },
]

const DATE_PRESETS = [
  { label: 'Hoy', getRange: () => { const d = new Date(); return { start: new Date(d.getFullYear(), d.getMonth(), d.getDate()), end: new Date(d.getFullYear(), d.getMonth(), d.getDate()) } } },
  { label: '7 dias', getRange: () => { const end = new Date(); const start = new Date(end.getFullYear(), end.getMonth(), end.getDate()); start.setDate(start.getDate() - 6); return { start, end } } },
  { label: '30 dias', getRange: () => { const end = new Date(); const start = new Date(end.getFullYear(), end.getMonth(), end.getDate()); start.setDate(start.getDate() - 29); return { start, end } } },
  { label: 'Este mes', getRange: () => { const end = new Date(); const start = new Date(end.getFullYear(), end.getMonth(), 1); return { start, end } } },
  { label: 'Mes pasado', getRange: () => { const d = new Date(); const start = new Date(d.getFullYear(), d.getMonth() - 1, 1); const lastDay = new Date(d.getFullYear(), d.getMonth(), 0); return { start, end: lastDay } } },
]

function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (value === 0) { setCount(0); return }
    let current = 0
    const increment = value / 60
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setCount(value); clearInterval(timer) } else { setCount(Math.floor(current)) }
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{prefix}{count.toLocaleString('es-DO', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</>
}

function MiniBar({ height, color = '#ccff00', label, value, showValue = true }: { height: number; color?: string; label?: string; value?: number; showValue?: boolean }) {
  const [h, setH] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setH(height), 200)
    return () => clearTimeout(t)
  }, [height])

  return (
    <div className="flex-1 flex flex-col items-center justify-end h-full relative">
      {showValue && value !== undefined && (
        <span className="text-[10px] font-bold text-zinc-400 mb-1 whitespace-nowrap">
          {'$'}{value.toLocaleString()}
        </span>
      )}
      <div
        className="w-full max-w-[32px] rounded-t-lg transition-all duration-1000 ease-out relative"
        style={{
          height: h + '%',
          minHeight: '4px',
          background: 'linear-gradient(to top, ' + color + ', ' + color + '80)',
          boxShadow: '0 0 12px ' + color + '30'
        }}
      >
        <div className="absolute inset-0 rounded-t-lg" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }} />
      </div>
      {label && (
        <span className="text-[10px] text-zinc-500 mt-2 font-medium text-center leading-tight">{label}</span>
      )}
    </div>
  )
}

interface DonutSegment { label: string; value: number; color: string }

function DonutChart({ segments, size = 180, strokeWidth = 24, centerLabel, centerValue }: { segments: DonutSegment[]; size?: number; strokeWidth?: number; centerLabel?: string; centerValue?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  let accumulated = 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {total === 0 && (
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          )}
          {segments.map((seg, i) => {
            const pct = total > 0 ? seg.value / total : 0
            const dashLen = circumference * pct
            const dashOffset = circumference * accumulated
            accumulated += pct
            return (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={seg.color} strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={animated ? (dashLen + ' ' + (circumference - dashLen)) : ('0 ' + circumference)}
                strokeDashoffset={-dashOffset}
                className="transition-all duration-1000 ease-out"
                style={{ opacity: animated ? 1 : 0 }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-xl font-black text-white">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{centerLabel}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-zinc-400 font-medium">{seg.label}</span>
            <span className="text-[11px] text-zinc-300 font-bold">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ColumnDef<T> { key: string; label: string; render?: (row: T, index: number) => React.ReactNode; align?: 'left' | 'center' | 'right' }

function DataTable<T extends Record<string, any>>({ columns, rows, emptyMessage = 'No hay datos disponibles' }: { columns: ColumnDef<T>[]; rows: T[]; emptyMessage?: string }) {
  return (
    <div className="overflow-x-auto -mx-5 md:-mx-6">
      <table className="w-full text-sm px-5 md:px-6">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((col) => (
              <th key={col.key} className="py-3.5 px-4 md:px-6 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.15em] first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6" style={{ textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-8 text-center text-zinc-500 text-sm">{emptyMessage}</td></tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-200">
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 px-4 md:px-6 first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6" style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface SummaryData { totalRevenue: number; totalBookings: number; averageTicket: number; activeCustomers: number }
interface SalesRow { date: string; bookings: number; revenue: number; bookingRevenue: number; productRevenue: number }
interface ProductRow { name: string; quantity: number; revenue: number; cost: number; profit: number; margin: number }
interface CourtRevenueRow { court: string; revenue: number; bookings: number }
interface BookingStatusRow { status: string; count: number }
interface HourlyRow { hour: string; count: number }
interface CustomerRow { name: string; bookings: number; totalSpent: number }
interface UtilizationRow { court: string; totalHours: number; bookedHours: number; utilizationPct: number }

export default function InformesView() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReportTab>('sales')
  const [activePreset, setActivePreset] = useState(1)
  const [startDate, setStartDate] = useState(() => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()); s.setDate(s.getDate() - 6); return fmt(s) })
  const [endDate, setEndDate] = useState(() => { const d = new Date(); return fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate())) })

  const [summary, setSummary] = useState<SummaryData>({ totalRevenue: 0, totalBookings: 0, averageTicket: 0, activeCustomers: 0 })
  const [salesData, setSalesData] = useState<SalesRow[]>([])
  const [productsData, setProductsData] = useState<ProductRow[]>([])
  const [courtsData, setCourtsData] = useState<CourtRevenueRow[]>([])
  const [bookingStatusData, setBookingStatusData] = useState<BookingStatusRow[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyRow[]>([])
  const [customersData, setCustomersData] = useState<CustomerRow[]>([])
  const [utilizationData, setUtilizationData] = useState<UtilizationRow[]>([])

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [startDate, endDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const salesGroupBy = 'day'
      const [summaryRes, salesRes, productsRes, courtsRes, bookingsRes, customersRes, utilRes] = await Promise.all([
        reportService.getSummary(startDate, endDate),
        reportService.getSalesByDate(startDate, endDate, salesGroupBy),
        reportService.getTopProducts(startDate, endDate, 10),
        reportService.getRevenueByCourt(startDate, endDate),
        reportService.getBookingReport(startDate, endDate),
        reportService.getTopCustomers(startDate, endDate, 10),
        reportService.getCourtUtilization(startDate, endDate),
      ])
      if (summaryRes.success && summaryRes.data) {
        const d = summaryRes.data
        setSummary({
          totalRevenue: parseFloat(d.sales?.total_revenue) || 0,
          totalBookings: parseInt(d.bookings?.total_bookings) || 0,
          averageTicket: parseFloat(d.sales?.avg_sale) || 0,
          activeCustomers: parseInt(d.customers?.active_customers) || 0,
        })
      }
      if (salesRes.success && salesRes.data) {
        const raw = salesRes.data.series || []
        setSalesData(raw.map((s: any) => {
          const period = (s.period || '').split('T')[0] || s.period || ''
          const parts = period.split('-')
          const label = parts.length === 3 ? parts[1] + '-' + parts[2] : period
          return { date: label, bookings: parseInt(s.count) || 0, revenue: parseFloat(s.total) || 0, bookingRevenue: parseFloat(s.booking_revenue) || 0, productRevenue: parseFloat(s.product_revenue) || 0 }
        }))
      }
      if (productsRes.success && productsRes.data) {
        const raw = productsRes.data.products || []
        setProductsData(raw.map((p: any) => ({ 
          name: p.product_name, 
          quantity: parseInt(p.total_sold) || 0, 
          revenue: parseFloat(p.total_revenue) || 0,
          cost: parseFloat(p.total_cost) || 0,
          profit: parseFloat(p.gross_profit) || 0,
          margin: parseFloat(p.profit_margin_percent) || 0,
        })))
      }
      if (courtsRes.success && courtsRes.data) {
        const raw = courtsRes.data.courts || []
        setCourtsData(raw.map((c: any) => ({ court: c.court_name, revenue: parseFloat(c.total_revenue) || 0, bookings: parseInt(c.total_bookings) || 0 })))
      }
      if (bookingsRes.success && bookingsRes.data) {
        const rawStatus = bookingsRes.data.statusCounts || bookingsRes.data.statusDistribution || []
        const rawHourly = bookingsRes.data.hourlyDistribution || []
        setBookingStatusData(rawStatus.map((s: any) => ({ status: s.status, count: parseInt(s.count) || 0 })))
        setHourlyData(rawHourly.map((h: any) => ({ hour: String(h.hour), count: parseInt(h.count) || 0 })))
      }
      if (customersRes.success && customersRes.data) {
        const raw = customersRes.data.customers || []
        setCustomersData(raw.map((c: any) => ({ name: c.customer_name, bookings: parseInt(c.total_bookings) || 0, totalSpent: parseFloat(c.total_spent) || 0 })))
      }
      if (utilRes.success && utilRes.data) {
        const raw = utilRes.data.courts || []
        setUtilizationData(raw.map((c: any) => {
          const hours = parseFloat(c.total_hours_booked) || 0
          const maxPossible = 12 * 30
          return { court: c.court_name, totalHours: hours, bookedHours: hours, utilizationPct: maxPossible > 0 ? Math.round((hours / maxPossible) * 100) : 0 }
        }))
      }
    } catch (error) { console.error('Error loading report data:', error) } finally { setLoading(false) }
  }

  const applyPreset = (index: number) => {
    setActivePreset(index)
    const range = DATE_PRESETS[index].getRange()
    setStartDate(fmt(range.start))
    setEndDate(fmt(range.end))
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    const salesMax = Math.max(...salesData.map(s => s.revenue), 1)
    const productsMax = Math.max(...productsData.map(p => p.quantity), 1)
    const thStyle = 'padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#71717a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;'

    let salesRows = salesData.map(s => {
      const pct = salesMax > 0 ? (s.revenue / salesMax) * 100 : 0
      const bookingPct = s.revenue > 0 ? (s.bookingRevenue / s.revenue) * 100 : 0
      const productPct = 100 - bookingPct
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#a1a1aa;font-size:13px;">' + s.date + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#fff;font-weight:700;text-align:right;">' + s.bookings + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#6366f1;font-weight:600;text-align:right;">$' + s.bookingRevenue.toLocaleString() + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#ccff00;font-weight:600;text-align:right;">$' + s.productRevenue.toLocaleString() + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;text-align:right;"><div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;"><span style="color:#fff;font-weight:700;font-size:13px;">$' + s.revenue.toLocaleString() + '</span><div style="width:80px;height:8px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;display:flex;"><div style="width:' + bookingPct + '%;height:100%;background:#6366f1;"></div><div style="width:' + productPct + '%;height:100%;background:#ccff00;"></div></div></div></td></tr>'
    }).join('')

    let productRows = productsData.map((p, i) => {
      const pct = productsMax > 0 ? (p.quantity / productsMax) * 100 : 0
      const color = CHART_COLORS[i % CHART_COLORS.length]
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#fff;font-size:13px;font-weight:600;"><span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:6px;background:' + color + '20;color:' + color + ';display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">' + (i + 1) + '</span>' + p.name + '</span></td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;"><div style="display:flex;align-items:center;gap:8px;"><div style="width:100px;height:6px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:3px;"></div></div><span style="color:#a1a1aa;font-size:13px;">' + p.quantity + '</span></div></td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#ccff00;font-weight:700;text-align:right;">$' + p.revenue.toLocaleString() + '</td></tr>'
    }).join('')

    const courtsTotal = courtsData.reduce((a, c) => a + c.revenue, 0)
    let courtsLegend = courtsData.map((c, i) => {
      const pct = courtsTotal > 0 ? ((c.revenue / courtsTotal) * 100).toFixed(1) : '0'
      const color = CHART_COLORS[i % CHART_COLORS.length]
      return '<div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;border-radius:50%;background:' + color + ';"></div><span style="color:#a1a1aa;font-size:12px;">' + c.court + '</span><span style="color:#fff;font-size:12px;font-weight:700;">$' + c.revenue.toLocaleString() + ' (' + pct + '%)</span></div>'
    }).join('')

    let customerRows = customersData.map((c) => {
      const initials = c.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#fff;font-size:13px;font-weight:600;"><span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:28px;height:28px;border-radius:50%;background:rgba(204,255,0,0.1);color:#ccff00;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:1px solid rgba(204,255,0,0.2);">' + initials + '</span>' + c.name + '</span></td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#a1a1aa;font-size:13px;text-align:center;">' + c.bookings + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#ccff00;font-weight:700;text-align:right;">$' + c.totalSpent.toLocaleString() + '</td></tr>'
    }).join('')

    let utilRows = utilizationData.map((u) => {
      const barColor = u.utilizationPct >= 80 ? '#10b981' : u.utilizationPct >= 50 ? '#f59e0b' : '#f43f5e'
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#fff;font-size:13px;font-weight:600;">' + u.court + '</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#a1a1aa;font-size:13px;text-align:center;">' + u.totalHours + 'h</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;color:#a1a1aa;font-size:13px;text-align:center;">' + u.bookedHours + 'h</td><td style="padding:8px 12px;border-bottom:1px solid #1a1f3a;"><div style="display:flex;align-items:center;gap:8px;"><div style="width:100px;height:6px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden;"><div style="width:' + Math.min(u.utilizationPct, 100) + '%;height:100%;background:' + barColor + ';border-radius:3px;"></div></div><span style="color:' + barColor + ';font-size:13px;font-weight:700;">' + u.utilizationPct + '%</span></div></td></tr>'
    }).join('')

    let bookingStatusLegend = bookingStatusData.map((b, i) => {
      const color = CHART_COLORS[i % CHART_COLORS.length]
      return '<div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;border-radius:50%;background:' + color + ';"></div><span style="color:#a1a1aa;font-size:12px;">' + b.status + '</span><span style="color:#fff;font-size:12px;font-weight:700;">' + b.count + '</span></div>'
    }).join('')

    let hourlyRows = hourlyData.map((h) => {
      const maxH = Math.max(...hourlyData.map(x => x.count), 1)
      const pct = maxH > 0 ? (h.count / maxH) * 100 : 0
      return '<tr><td style="padding:6px 12px;border-bottom:1px solid #1a1f3a;color:#a1a1aa;font-size:13px;">' + h.hour + '</td><td style="padding:6px 12px;border-bottom:1px solid #1a1f3a;text-align:right;"><div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;"><span style="color:#fff;font-weight:700;font-size:13px;">' + h.count + '</span><div style="width:80px;height:6px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:#6366f1;border-radius:3px;"></div></div></div></td></tr>'
    }).join('')

    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe</title><style>body{margin:0;padding:20px 32px;background:#060a1a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;}h1{font-size:22px;margin:0 0 4px;font-weight:900;}h2{font-size:16px;margin:24px 0 12px;color:#ccff00;font-weight:800;}.sub{font-size:12px;color:#71717a;margin-bottom:20px;}.kg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}.k{background:#0f1533;border:1px solid #1a1f3a;border-radius:12px;padding:16px;}.kl{font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;}.kv{font-size:24px;font-weight:900;margin-top:4px;}.kv.a{color:#ccff00;}table{width:100%;border-collapse:collapse;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body>'
    html += '<h1>Informe de Reportes</h1>'
    html += '<div class="sub">Periodo: ' + startDate + ' al ' + endDate + ' | Generado: ' + new Date().toLocaleString('es-DO') + '</div>'
    html += '<div class="kg"><div class="k"><div class="kl">Ingresos Totales</div><div class="kv a">$' + summary.totalRevenue.toLocaleString() + '</div></div><div class="k"><div class="kl">Total Reservas</div><div class="kv">' + summary.totalBookings.toLocaleString() + '</div></div><div class="k"><div class="kl">Ticket Promedio</div><div class="kv">$' + summary.averageTicket.toLocaleString() + '</div></div><div class="k"><div class="kl">Clientes Activos</div><div class="kv">' + summary.activeCustomers.toLocaleString() + '</div></div></div>'

    if (activeTab === 'sales') {
      html += '<h2>Ventas Diarias</h2><div style="display:flex;gap:16px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:3px;background:#6366f1;"></div><span style="color:#a1a1aa;font-size:12px;">Reservas de Cancha</span></div><div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:3px;background:#ccff00;"></div><span style="color:#a1a1aa;font-size:12px;">Productos Vendidos</span></div></div><table><thead><tr><th style="' + thStyle + 'text-align:left;">Fecha</th><th style="' + thStyle + 'text-align:right;">Reservas</th><th style="' + thStyle + 'text-align:right;">Ingresos Reservas</th><th style="' + thStyle + 'text-align:right;">Ingresos Productos</th><th style="' + thStyle + 'text-align:right;">Total Ingresos</th></tr></thead><tbody>' + salesRows + '</tbody></table>'
    } else if (activeTab === 'products') {
      html += '<h2>Top Productos</h2><table><thead><tr><th style="' + thStyle + 'text-align:left;">Producto</th><th style="' + thStyle + 'text-align:left;">Vendidos</th><th style="' + thStyle + 'text-align:right;">Ingresos</th></tr></thead><tbody>' + productRows + '</tbody></table>'
    } else if (activeTab === 'courts') {
      html += '<h2>Ingresos por Cancha</h2><div style="margin:16px 0;display:flex;flex-wrap:wrap;gap:12px;">' + courtsLegend + '</div>'
    } else if (activeTab === 'bookings') {
      html += '<h2>Estado de Reservas</h2><div style="margin:16px 0;display:flex;flex-wrap:wrap;gap:12px;">' + bookingStatusLegend + '</div>'
      html += '<h2>Distribucion Horaria</h2><table><thead><tr><th style="' + thStyle + 'text-align:left;">Hora</th><th style="' + thStyle + 'text-align:right;">Reservas</th></tr></thead><tbody>' + hourlyRows + '</tbody></table>'
    } else if (activeTab === 'customers') {
      html += '<h2>Top Clientes</h2><table><thead><tr><th style="' + thStyle + 'text-align:left;">Cliente</th><th style="' + thStyle + 'text-align:center;">Reservas</th><th style="' + thStyle + 'text-align:right;">Total Gastado</th></tr></thead><tbody>' + customerRows + '</tbody></table>'
    } else if (activeTab === 'utilization') {
      html += '<h2>Ocupacion por Cancha</h2><table><thead><tr><th style="' + thStyle + 'text-align:left;">Cancha</th><th style="' + thStyle + 'text-align:center;">Horas Totales</th><th style="' + thStyle + 'text-align:center;">Horas Reservadas</th><th style="' + thStyle + 'text-align:left;">Ocupacion</th></tr></thead><tbody>' + utilRows + '</tbody></table>'
    }

    html += '</body></html>'
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const kpis = [
    { label: 'Ingresos Totales', value: summary.totalRevenue, prefix: '$', icon: DollarSign, color: 'text-[#ccff00]', bgIcon: 'bg-[#ccff00]/10 border-[#ccff00]/20', gradient: 'from-[#ccff00]/10 to-[#ccff00]/5' },
    { label: 'Total Reservas', value: summary.totalBookings, icon: Calendar, color: 'text-blue-400', bgIcon: 'bg-blue-500/10 border-blue-500/20', gradient: 'from-blue-500/10 to-blue-600/5' },
    { label: 'Ticket Promedio', value: summary.averageTicket, prefix: '$', icon: DollarSign, color: 'text-emerald-400', bgIcon: 'bg-emerald-500/10 border-emerald-500/20', gradient: 'from-emerald-500/10 to-emerald-600/5' },
    { label: 'Clientes Activos', value: summary.activeCustomers, icon: Users, color: 'text-purple-400', bgIcon: 'bg-purple-500/10 border-purple-500/20', gradient: 'from-purple-500/10 to-purple-600/5' },
  ]

  if (loading && !mounted) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ccff00]"></div>
      </div>
    )
  }

  return (
    <div className={'p-4 md:p-8 transition-all duration-700 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}>  
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
              <FileText size={14} className="text-[#ccff00]" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Reportes</span>
            <div className="h-3 w-px bg-zinc-700/50" />
            <span className="text-[10px] text-zinc-600 font-medium">Informes</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tight leading-none">
            Informes y <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">Consultas</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Analisis detallado del rendimiento del complejo</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-bold hover:bg-[#ccff00]/20 transition-all duration-300"
        >
          <Printer size={15} />
          Imprimir Informe
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className={'group relative bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/20 transition-all duration-500 overflow-hidden'}
              style={{ animationDelay: (i * 80) + 'ms' }}
            >
              <div className={'absolute inset-0 bg-gradient-to-br ' + kpi.gradient + ' opacity-0 group-hover:opacity-100 transition-opacity duration-500'} />
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/[0.02] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] group-hover:text-zinc-400 transition-colors">{kpi.label}</p>
                  <div className={'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl ' + kpi.bgIcon + ' group-hover:scale-110 group-hover:rotate-3 transition-all duration-300'}>
                    <Icon className={kpi.color} size={20} />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white group-hover:scale-105 origin-left transition-transform">
                    <AnimatedCounter value={kpi.value} prefix={kpi.prefix || ''} decimals={0} />
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Date Filter */}
      <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-4 md:p-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-zinc-500" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filtros</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(i)}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ' + (activePreset === i ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30' : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300')}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-zinc-700/50 hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
              <Calendar size={13} className="text-zinc-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setActivePreset(-1) }}
                className="bg-transparent text-zinc-300 text-xs font-medium outline-none [color-scheme:dark] w-[110px]"
              />
            </div>
            <span className="text-zinc-600 text-xs">a</span>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setActivePreset(-1) }}
                className="bg-transparent text-zinc-300 text-xs font-medium outline-none [color-scheme:dark] w-[110px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ' + (activeTab === tab.key ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.08)]' : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300')}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ccff00]"></div>
        </div>
      )}

      {!loading && (
        <div className="transition-all duration-500">

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
                      <DollarSign size={17} className="text-[#ccff00]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">Ventas Diarias</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Ingresos por dia en el periodo seleccionado</p>
                    </div>
                  </div>
                  <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-[#ccff00] hover:border-[#ccff00]/20 transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <StackedAreaChart data={salesData} />
                <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(to top, #6366f1, #6366f180)' }} />
                    <span className="text-[11px] text-zinc-400 font-medium">Reservas de Cancha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(to top, #ccff00, #ccff0080)' }} />
                    <span className="text-[11px] text-zinc-400 font-medium">Productos Vendidos</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                <h3 className="text-base font-bold text-white mb-4">Detalle de Ventas Diarias</h3>
                <DataTable<SalesRow>
                  columns={[
                    { key: 'date', label: 'Fecha' },
                    { key: 'bookings', label: 'Reservas', align: 'center' },
                    { key: 'bookingRevenue', label: 'Ingresos Reservas', align: 'right', render: (row) => (
                      <span className="text-blue-400 font-semibold">{'$'}{row.bookingRevenue.toLocaleString()}</span>
                    )},
                    { key: 'productRevenue', label: 'Ingresos Productos', align: 'right', render: (row) => (
                      <span className="text-[#ccff00] font-semibold">{'$'}{row.productRevenue.toLocaleString()}</span>
                    )},
                    { key: 'revenue', label: 'Total Ingresos', align: 'right', render: (row) => (
                      <span className="text-white font-bold">{'$'}{row.revenue.toLocaleString()}</span>
                    )},
                  ]}
                  rows={salesData}
                />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20">
                    <Package size={17} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Top Productos</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Productos mas vendidos en el periodo</p>
                  </div>
                </div>
                <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-[#ccff00] hover:border-[#ccff00]/20 transition-all">
                  <RefreshCw size={14} />
                </button>
              </div>
              <DataTable<ProductRow>
                columns={[
                  { key: 'name', label: 'Producto', render: (row, idx) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] + '15',
                          color: CHART_COLORS[idx % CHART_COLORS.length],
                          border: '1px solid ' + CHART_COLORS[idx % CHART_COLORS.length] + '30'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-white font-semibold text-sm">{row.name}</span>
                    </div>
                  )},
                  { key: 'quantity', label: 'Vendidos', render: (row) => {
                    const max = Math.max(...productsData.map(p => p.quantity), 1)
                    const pct = max > 0 ? (row.quantity / max) * 100 : 0
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/[0.04] rounded-full h-2 overflow-hidden border border-white/[0.06]">
                          <div className="h-full rounded-full bg-[#6366f1] transition-all duration-1000" style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-zinc-300 text-sm font-medium">{row.quantity}</span>
                      </div>
                    )
                  }},
                  { key: 'revenue', label: 'Ingresos', align: 'right', render: (row) => (
                    <span className="text-[#ccff00] font-bold">{'$'}{row.revenue.toLocaleString()}</span>
                  )},
                  { key: 'cost', label: 'Costo Total', align: 'right', render: (row) => (
                    <span className="text-zinc-400 font-medium">{'$'}{(row.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )},
                  { key: 'profit', label: 'Ganancia Neta', align: 'right', render: (row) => (
                    <span className={`font-bold ${row.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.profit >= 0 ? '+' : ''}{'$'}{(row.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )},
                  { key: 'margin', label: 'Margen', align: 'right', render: (row) => (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.margin >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {row.margin >= 0 ? '+' : ''}{(row.margin || 0).toFixed(1)}%
                    </span>
                  )},
                ]}
                rows={productsData}
              />
            </div>
          )}

          {activeTab === 'courts' && (
            <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
                    <LayoutGrid size={17} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Ingresos por Cancha</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Distribucion de ingresos por cancha</p>
                  </div>
                </div>
                <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-[#ccff00] hover:border-[#ccff00]/20 transition-all">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="shrink-0">
                  <DonutChart
                    segments={courtsData.map((c, i) => ({
                      label: c.court,
                      value: c.revenue,
                      color: CHART_COLORS[i % CHART_COLORS.length],
                    }))}
                    centerLabel="Total"
                    centerValue={'$' + courtsData.reduce((a, c) => a + c.revenue, 0).toLocaleString()}
                  />
                </div>
                <div className="flex-1 w-full">
                  <DataTable<CourtRevenueRow>
                    columns={[
                      { key: 'court', label: 'Cancha', render: (row, idx) => (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-white font-semibold text-sm">{row.court}</span>
                        </div>
                      )},
                      { key: 'bookings', label: 'Reservas', align: 'center' },
                      { key: 'revenue', label: 'Ingresos', align: 'right', render: (row) => (
                        <span className="text-[#ccff00] font-bold">{'$'}{row.revenue.toLocaleString()}</span>
                      )},
                    ]}
                    rows={courtsData}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
                      <Calendar size={17} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">Estado de Reservas</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Distribucion por estado</p>
                    </div>
                  </div>
                  <DonutChart
                    segments={bookingStatusData.map((b, i) => ({
                      label: b.status,
                      value: b.count,
                      color: CHART_COLORS[i % CHART_COLORS.length],
                    }))}
                    centerLabel="Total"
                    centerValue={bookingStatusData.reduce((a, b) => a + b.count, 0).toString()}
                  />
                </div>

                <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20">
                      <Clock size={17} className="text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">Distribucion Horaria</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Reservas por hora del dia</p>
                    </div>
                  </div>
                  <div className="flex items-end h-44 gap-1 pt-4">
                    {hourlyData.length === 0 ? (
                      <p className="text-zinc-500 text-sm py-4 w-full text-center">No hay datos horarios.</p>
                    ) : (
                      hourlyData.map((item, i) => {
                        const max = Math.max(...hourlyData.map(h => h.count), 1)
                        const h = max > 0 ? (item.count / max) * 100 : 0
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <MiniBar height={h} color="#6366f1" value={item.count} label={item.hour.slice(0, 5)} showValue={item.count > 0} />
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20">
                    <Users size={17} className="text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Top Clientes</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Clientes con mas actividad en el periodo</p>
                  </div>
                </div>
                <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-[#ccff00] hover:border-[#ccff00]/20 transition-all">
                  <RefreshCw size={14} />
                </button>
              </div>
              <DataTable<CustomerRow>
                columns={[
                  { key: 'name', label: 'Cliente', render: (row) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00] text-xs font-bold border border-[#ccff00]/20 shrink-0 uppercase">
                        {row.name.split(' ').map((w) => w[0]).join('').slice(0, 2) || 'CL'}
                      </div>
                      <span className="text-white font-semibold text-sm">{row.name}</span>
                    </div>
                  )},
                  { key: 'bookings', label: 'Reservas', align: 'center' },
                  { key: 'totalSpent', label: 'Total Gastado', align: 'right', render: (row) => (
                    <span className="text-[#ccff00] font-bold">{'$'}{row.totalSpent.toLocaleString()}</span>
                  )},
                ]}
                rows={customersData}
              />
            </div>
          )}

          {activeTab === 'utilization' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                      <Activity size={17} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">Horas Reservadas por Cancha</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Volumen de reservas por cancha</p>
                    </div>
                  </div>
                  <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-[#ccff00] hover:border-[#ccff00]/20 transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex items-end h-48 gap-2 md:gap-3 pt-4">
                  {utilizationData.length === 0 ? (
                    <p className="text-zinc-500 text-sm py-4 w-full text-center">No hay datos de ocupacion.</p>
                  ) : (
                    utilizationData.map((item, i) => {
                      const max = Math.max(...utilizationData.map(u => u.bookedHours), 1)
                      const h = max > 0 ? (item.bookedHours / max) * 100 : 0
                      const shortName = item.court.length > 10 ? item.court.slice(0, 10) + '...' : item.court
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <MiniBar height={h} color={CHART_COLORS[i % CHART_COLORS.length]} value={item.bookedHours} label={shortName} />
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6">
                <h3 className="text-base font-bold text-white mb-4">Detalle de Ocupacion</h3>
                <DataTable<UtilizationRow>
                  columns={[
                    { key: 'court', label: 'Cancha', render: (row) => (
                      <span className="text-white font-semibold text-sm">{row.court}</span>
                    )},
                    { key: 'totalHours', label: 'Horas Totales', align: 'center' },
                    { key: 'bookedHours', label: 'Horas Reservadas', align: 'center' },
                    { key: 'utilizationPct', label: 'Ocupacion', render: (row) => {
                      const barColor = row.utilizationPct >= 80 ? '#10b981' : row.utilizationPct >= 50 ? '#f59e0b' : '#f43f5e'
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-white/[0.04] rounded-full h-2 overflow-hidden border border-white/[0.06]">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: Math.min(row.utilizationPct, 100) + '%', backgroundColor: barColor }} />
                          </div>
                          <span className="font-bold text-sm" style={{ color: barColor }}>{row.utilizationPct}%</span>
                        </div>
                      )
                    }},
                  ]}
                  rows={utilizationData}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
