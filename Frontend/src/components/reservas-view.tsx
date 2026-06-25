'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Clock, User, Search, Filter, CalendarDays, MapPin, ChevronDown, ChevronUp, Edit2, ChevronLeft, ChevronRight, Zap, XCircle, CheckCircle, AlertCircle, BarChart3, Calendar } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import { customerService } from '@/services/customerService'
import { courtService } from '@/services/courtService'
import { Modal } from '@/components/ui/modal'
import { useSocket } from '@/contexts/socket-context'

function LiveToast({ notification }: { notification: any }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [notification.id])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#ccff00]/20 rounded-2xl p-4 shadow-2xl shadow-black/50 max-w-sm backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[#ccff00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#ccff00] uppercase tracking-wider mb-1">Nueva Reserva en Tiempo Real</p>
            <p className="text-white font-bold text-sm truncate">{notification.customer_name}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{notification.court_name} • {notification.start_time?.slice(0,5)} - {notification.end_time?.slice(0,5)}</p>
          </div>
          <button onClick={() => setVisible(false)} className="text-zinc-500 hover:text-white transition-colors p-0.5">
            <XCircle size={14} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ccff00]/40 to-transparent rounded-full" />
      </div>
    </div>
  )
}

export default function ReservasView() {
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { notifications: socketNotifications, clearNotification } = useSocket()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const [clientes, setClientes] = useState<any[]>([])
  const [canchas, setCanchas] = useState<any[]>([])

  const [showAllProximas, setShowAllProximas] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    court_id: '',
    booking_date: '',
    start_time: '08:00',
    duration: '1'
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [actionError, setActionError] = useState('')

  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)

  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchDataSilent = useCallback(async () => {
    try {
      const res = await bookingService.getAll()
      if (res.success) setReservas(res.data || [])
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])

  const [lastNotifId, setLastNotifId] = useState<any>(null)

  useEffect(() => {
    if (socketNotifications.length > 0) {
      const latest = socketNotifications[0]
      if (latest.id !== lastNotifId) {
        setLastNotifId(latest.id)
        fetchDataSilent()
      }
    }
  }, [socketNotifications, lastNotifId, fetchDataSilent])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resReservas, resClientes, resCanchas] = await Promise.all([
        bookingService.getAll().catch(() => ({ success: false })),
        customerService.getAll().catch(() => ({ success: false })),
        courtService.getAll().catch(() => ({ success: false }))
      ])

      if (resReservas.success) setReservas(resReservas.data || [])
      if (resClientes.success) setClientes(resClientes.data || [])
      if (resCanchas.success) setCanchas(resCanchas.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const [h, m] = formData.start_time.split(':').map(Number)
      const durationHours = parseFloat(formData.duration)
      const totalMinutes = h * 60 + m + durationHours * 60
      const endH = Math.floor(totalMinutes / 60)
      const endM = totalMinutes % 60
      const computed_end_time = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`
      const computed_start_time = `${formData.start_time.length === 5 ? formData.start_time + ':00' : formData.start_time}`

      const payload = {
        customer_id: parseInt(formData.customer_id),
        court_id: parseInt(formData.court_id),
        booking_date: formData.booking_date,
        start_time: computed_start_time,
        end_time: computed_end_time
      }

      let res;
      if (editingId) {
        res = await bookingService.update(editingId, payload)
      } else {
        res = await bookingService.create(payload)
      }

      if (res.success) {
        setIsModalOpen(false)
        setFormData({ customer_id: '', court_id: '', booking_date: '', start_time: '08:00', duration: '1' })
        setEditingId(null)
        fetchData()
      }
    } catch (error: any) {
      console.error('Error guardando reserva:', error)
      setSubmitError(error.message || 'Hubo un error al guardar la reserva. Verifica disponibilidad o si ya fue cobrada.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionError('')
    try {
      const res = await bookingService.updateStatus(id, newStatus)
      if (res.success) {
        fetchData()
      }
    } catch (error: any) {
      console.error('Error changing status:', error)
      setActionError(error.message || 'Error al cambiar el estado de la reserva')
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ customer_id: '', court_id: '', booking_date: '', start_time: '08:00', duration: '1' })
    setSubmitError('')
    setCustomerSearchTerm('')
    setIsModalOpen(true)
  }

  const openEditModal = (reserva: any) => {
    const t1 = new Date(`1970-01-01T${reserva.start_time}`).getTime()
    const t2 = new Date(`1970-01-01T${reserva.end_time}`).getTime()
    const diffHours = (t2 - t1) / (1000 * 60 * 60)

    const d = new Date(reserva.booking_date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formattedDate = `${yyyy}-${mm}-${dd}`

    const customerIdStr = reserva.customer_id ? reserva.customer_id.toString() : ''
    const customerObj = clientes.find(c => c.id.toString() === customerIdStr)

    setEditingId(reserva.id)
    setFormData({
      customer_id: customerIdStr,
      court_id: reserva.court_id ? reserva.court_id.toString() : '',
      booking_date: formattedDate,
      start_time: reserva.start_time?.slice(0, 5) || '08:00',
      duration: diffHours.toString()
    })
    setSubmitError('')
    setCustomerSearchTerm(customerObj ? `${customerObj.full_name} (${customerObj.identification_number || customerObj.email || 'Sin doc'})` : '')
    setIsModalOpen(true)
  }

  const getDuracion = (start: string, end: string) => {
    if (!start || !end) return '-'
    const t1 = new Date(`1970-01-01T${start}`).getTime()
    const t2 = new Date(`1970-01-01T${end}`).getTime()
    const diffHours = (t2 - t1) / (1000 * 60 * 60)
    return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const dateObj = new Date(dateStr)
    return new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
  }

  const formatAMPM = (timeStr?: string) => {
    if (!timeStr) return ''
    const [hStr, mStr] = timeStr.split(':')
    let h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    h = h ? h : 12
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const totalMins = 8 * 60 + i * 30
    const h = (Math.floor(totalMins / 60) % 24).toString().padStart(2, '0')
    const m = (totalMins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  })

  const prevDay = () => {
    const d = new Date(scheduleDate)
    d.setDate(d.getDate() - 1)
    setScheduleDate(d)
  }
  const nextDay = () => {
    const d = new Date(scheduleDate)
    d.setDate(d.getDate() + 1)
    setScheduleDate(d)
  }
  const goToToday = () => setScheduleDate(new Date())

  const formatDateForSchedule = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return d.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
  }

  const handleCellClick = (timeSlot: string, courtId: string) => {
    const yyyy = scheduleDate.getFullYear()
    const mm = String(scheduleDate.getMonth() + 1).padStart(2, '0')
    const dd = String(scheduleDate.getDate()).padStart(2, '0')
    const formattedDate = `${yyyy}-${mm}-${dd}`

    setEditingId(null)
    setFormData({
      customer_id: '',
      court_id: courtId,
      booking_date: formattedDate,
      start_time: timeSlot,
      duration: '1'
    })
    setSubmitError('')
    setCustomerSearchTerm('')
    setIsModalOpen(true)
  }

  const scheduleReservas = reservas.filter(r => {
    if (!r.booking_date) return false

    const yyyy = scheduleDate.getFullYear()
    const mm = String(scheduleDate.getMonth() + 1).padStart(2, '0')
    const dd = String(scheduleDate.getDate()).padStart(2, '0')
    const targetDateStr = `${yyyy}-${mm}-${dd}`

    const rDateStr = typeof r.booking_date === 'string' ? r.booking_date.split('T')[0] : new Date(r.booking_date).toISOString().split('T')[0]

    return rDateStr === targetDateStr
  })

  const buildGrid = () => {
    const grid: Record<string, Record<string, any>> = {}
    timeSlots.forEach(time => {
      grid[time] = {}
      canchas.forEach(c => {
        grid[time][c.id] = { type: 'empty' }
      })
    })

    scheduleReservas.forEach(r => {
      const start = r.start_time?.slice(0, 5)
      const end = r.end_time?.slice(0, 5)
      if (!start || !end) return

      let courtId = r.court_id
      if (!courtId && r.court_name) {
        const found = canchas.find(c => c.court_name === r.court_name)
        if (found) courtId = found.id
      }
      if (!courtId) return

      const startIndex = timeSlots.indexOf(start)
      const endIndex = timeSlots.indexOf(end)
      const span = (endIndex !== -1 ? endIndex : timeSlots.length) - startIndex

      if (startIndex !== -1 && grid[start]) {
        grid[start][courtId] = { type: 'booking', reserva: r, rowSpan: span > 0 ? span : 1 }
        for (let i = 1; i < span; i++) {
          const skipTime = timeSlots[startIndex + i]
          if (skipTime && grid[skipTime]) {
            grid[skipTime][courtId] = { type: 'skip' }
          }
        }
      }
    })
    return grid
  }
  const scheduleGrid = buildGrid()

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const proximasReservas = reservas.filter(r => {
    if (r.status !== 'Pending') return false
    const rDate = new Date(r.booking_date)
    rDate.setHours(0,0,0,0)
    return rDate >= hoy
  }).sort((a, b) => {
    const dateA = new Date(a.booking_date).getTime()
    const dateB = new Date(b.booking_date).getTime()
    if (dateA === dateB) {
      return a.start_time.localeCompare(b.start_time)
    }
    return dateA - dateB
  })

  const proximasMostradas = showAllProximas ? proximasReservas : proximasReservas.slice(0, 3)

  const filteredReservas = reservas.filter((reserva) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      reserva.customer_name?.toLowerCase().includes(term) ||
      reserva.court_name?.toLowerCase().includes(term)

    let estadoEspanol = 'Pendiente'
    if (reserva.status === 'Confirmed') estadoEspanol = 'Confirmada'
    if (reserva.status === 'Cancelled') estadoEspanol = 'Cancelada'
    if (reserva.status === 'Completed') estadoEspanol = 'Completada'
    if (reserva.status === 'No_show') estadoEspanol = 'No asiste'

    const matchesStatus = statusFilter === 'Todos' || estadoEspanol === statusFilter

    return matchesSearch && matchesStatus
  })

  const hoyStr = new Date().toISOString().split('T')[0]
  const reservasHoy = reservas.filter(r => {
    const rDate = typeof r.booking_date === 'string' ? r.booking_date.split('T')[0] : new Date(r.booking_date).toISOString().split('T')[0]
    return rDate === hoyStr
  })
  const pendientesHoy = reservasHoy.filter(r => r.status === 'Pending').length
  const confirmadasHoy = reservasHoy.filter(r => r.status === 'Confirmed').length
  const completadasHoy = reservasHoy.filter(r => r.status === 'Completed').length
  const historialTotal = reservas.length

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Real-time notification toast */}
      {socketNotifications.length > 0 && (
        <LiveToast notification={socketNotifications[0]} />
      )}

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3.5 md:px-5 md:py-4 relative overflow-hidden group hover:border-[#ccff00]/20 transition-all duration-300">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#8b94b5] text-[11px] md:text-xs font-medium uppercase tracking-wider">Reservas Hoy</p>
              <p className="text-white text-xl md:text-2xl font-bold mt-0.5">{reservasHoy.length}</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-[#ccff00]/8 border border-[#ccff00]/15 flex items-center justify-center">
              <CalendarDays size={18} className="text-[#ccff00]" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent" />
        </div>
        <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3.5 md:px-5 md:py-4 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#8b94b5] text-[11px] md:text-xs font-medium uppercase tracking-wider">Pendientes</p>
              <p className="text-amber-300 text-xl md:text-2xl font-bold mt-0.5">{pendientesHoy}</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-amber-500/8 border border-amber-500/15 flex items-center justify-center">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        </div>
        <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3.5 md:px-5 md:py-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#8b94b5] text-[11px] md:text-xs font-medium uppercase tracking-wider">Confirmadas</p>
              <p className="text-emerald-300 text-xl md:text-2xl font-bold mt-0.5">{confirmadasHoy}</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
        <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3.5 md:px-5 md:py-4 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#8b94b5] text-[11px] md:text-xs font-medium uppercase tracking-wider">Historial</p>
              <p className="text-blue-300 text-xl md:text-2xl font-bold mt-0.5">{historialTotal}</p>
            </div>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-blue-500/8 border border-blue-500/15 flex items-center justify-center">
              <BarChart3 size={18} className="text-blue-400" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1.5">Reservas</h1>
          <p className="text-[#8b94b5] text-sm md:text-base">Gestiona la agenda y ocupación de tu complejo deportivo</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="group relative inline-flex items-center justify-center gap-2.5 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#b8e600] transition-all duration-200 shadow-lg shadow-[#ccff00]/20 hover:shadow-[#ccff00]/30 active:scale-[0.97] w-full md:w-auto"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Nueva Reserva
        </button>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 px-5 py-3.5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-300 text-sm font-medium">{actionError}</span>
            </div>
            <button onClick={() => setActionError('')} className="text-red-400/60 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded">
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: PRÓXIMAS RESERVAS PENDIENTES */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
            <span className="h-6 w-1 rounded-full bg-amber-400" />
            Próximas Reservas
            <span className="text-[11px] font-medium text-[#8b94b5] bg-[#1a1f3a] px-2.5 py-0.5 rounded-full border border-[#1a1f3a]">
              {proximasReservas.length} pendientes
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-2 border-[#1a1f3a] border-t-[#ccff00] animate-spin" />
          </div>
        ) : proximasReservas.length === 0 ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-dashed border-[#1a1f3a] px-8 py-12 text-center group hover:border-[#ccff00]/10 transition-colors duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.015),transparent_70%)]" />
            <div className="relative z-10">
              <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-[#ccff00]/5 border border-[#ccff00]/10 flex items-center justify-center">
                <CheckCircle size={28} className="text-[#ccff00]/40" />
              </div>
              <p className="text-[#8b94b5] text-sm">No tienes reservas pendientes para hoy o los próximos días.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proximasMostradas.map((reserva, index) => {
                const rDate = new Date(reserva.booking_date)
                rDate.setHours(0,0,0,0)
                const diffDays = Math.ceil((rDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                const isToday = diffDays === 0

                return (
                  <div 
                    key={reserva.id} 
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600/40" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <User size={16} className="text-amber-300" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">{reserva.customer_name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isToday ? (
                                <span className="text-[10px] font-semibold text-[#ccff00] uppercase tracking-wider">Hoy</span>
                              ) : (
                                <span className="text-[10px] text-[#8b94b5]">{diffDays === 1 ? 'Mañana' : `En ${diffDays} días`}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/12 text-amber-300 border border-amber-500/20">
                          Pendiente
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm">
                          <div className="h-6 w-6 rounded-md bg-[#1a1f3a] flex items-center justify-center">
                            <Calendar size={12} className="text-[#8b94b5]" />
                          </div>
                          <span className="text-[#c8cce5]">{formatDate(reserva.booking_date)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                          <div className="h-6 w-6 rounded-md bg-[#1a1f3a] flex items-center justify-center">
                            <Clock size={12} className="text-[#8b94b5]" />
                          </div>
                          <span className="text-[#c8cce5]">{formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)}</span>
                          <span className="text-[11px] text-[#8b94b5]">({getDuracion(reserva.start_time, reserva.end_time)})</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm pt-2.5 border-t border-[#1a1f3a]">
                          <div className="h-6 w-6 rounded-md bg-[#ccff00]/8 flex items-center justify-center">
                            <MapPin size={12} className="text-[#ccff00]" />
                          </div>
                          <span className="font-semibold text-[#ccff00]">{reserva.court_name}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-[#1a1f3a]">
                        <button 
                          onClick={() => handleStatusChange(reserva.id, 'Confirmed')}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 py-2 rounded-lg text-xs font-bold transition-all duration-200 border border-emerald-500/10 hover:border-emerald-500/25 active:scale-[0.98]"
                        >
                          <CheckCircle size={13} />
                          Aprobar
                        </button>
                        <button 
                          onClick={() => handleStatusChange(reserva.id, 'Cancelled')}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 py-2 rounded-lg text-xs font-bold transition-all duration-200 border border-red-500/10 hover:border-red-500/25 active:scale-[0.98]"
                        >
                          <XCircle size={13} />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {proximasReservas.length > 3 && (
              <div className="mt-5 flex justify-center">
                <button 
                  onClick={() => setShowAllProximas(!showAllProximas)}
                  className="group flex items-center gap-2 text-sm font-bold text-[#8b94b5] hover:text-[#ccff00] transition-colors duration-200 px-5 py-2.5 rounded-xl bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#1a1f3a] hover:border-[#ccff00]/20"
                >
                  {showAllProximas ? (
                    <><ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Ver menos</>
                  ) : (
                    <><ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" /> Ver todas ({proximasReservas.length})</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1a1f3a]" />
        </div>
        <div className="relative flex justify-center">
          <div className="h-3 w-3 rotate-45 border-t border-l border-[#1a1f3a] bg-[#060a1a] -mt-[6.5px]" />
        </div>
      </div>

      {/* SECCIÓN 2: AGENDA DIARIA */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
            <span className="h-6 w-1 rounded-full bg-blue-400" />
            Agenda Diaria
            <span className="text-[11px] font-medium text-[#8b94b5] bg-[#1a1f3a] px-2.5 py-0.5 rounded-full border border-[#1a1f3a]">
              {scheduleReservas.length} reservas
            </span>
          </h2>

          <div className="flex items-center bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-1 shadow-sm">
            <button onClick={prevDay} className="p-2 hover:bg-[#1a1f3a] rounded-lg transition-colors text-[#8b94b5] hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <div 
              onClick={goToToday}
              className="text-sm font-bold min-w-[180px] md:min-w-[220px] text-center text-white cursor-pointer hover:text-[#ccff00] transition-colors select-none px-2"
            >
              {formatDateForSchedule(scheduleDate)}
            </div>
            <button onClick={nextDay} className="p-2 hover:bg-[#1a1f3a] rounded-lg transition-colors text-[#8b94b5] hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-[#1a1f3a] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="bg-[#0a0e27] border-b border-r border-[#1a1f3a] p-3 w-24 text-center text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider sticky left-0 z-20">Hora</th>
                  {canchas.map(c => (
                    <th key={c.id} className="bg-[#0a0e27] border-b border-r border-[#1a1f3a] p-3 text-center min-w-[170px] max-w-[220px]">
                      <div className="font-bold text-white text-sm truncate">{c.court_name}</div>
                      <div className="text-[10px] text-[#8b94b5] font-medium mt-0.5">
                        {c.sport || 'Cancha'} 
                        {c.status !== 'Available' ? <span className="text-red-400 ml-1">(Inactiva)</span> : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="group/row">
                    <td className="bg-[#0a0e27]/80 border-b border-r border-[#1a1f3a] p-2 text-center text-[11px] text-[#8b94b5] font-semibold sticky left-0 z-10">
                      {formatAMPM(time)}
                    </td>
                    {canchas.map(c => {
                      const cell = scheduleGrid[time]?.[c.id]
                      if (!cell || cell.type === 'skip') return null

                      if (cell.type === 'empty') {
                        return (
                          <td 
                            key={`${time}-${c.id}`} 
                            className={`border-b border-r border-[#1a1f3a] p-0 transition-colors ${
                              c.status !== 'Available' 
                                ? 'bg-[#0f1533]/30' 
                                : 'cursor-pointer hover:bg-[#ccff00]/3 group/cell'
                            }`}
                            onClick={() => c.status === 'Available' && handleCellClick(time, c.id.toString())}
                          >
                            {c.status === 'Available' && (
                              <div className="h-full min-h-[38px] flex items-center justify-center">
                                <div className="h-7 w-7 rounded-md border border-dashed border-[#1a1f3a] flex items-center justify-center opacity-0 group-hover/cell:opacity-100 group-hover/cell:border-[#ccff00]/30 group-hover/cell:bg-[#ccff00]/5 transition-all duration-200">
                                  <Plus size={14} className="text-[#ccff00]/50" />
                                </div>
                              </div>
                            )}
                          </td>
                        )
                      }

                      if (cell.type === 'booking') {
                        const { reserva, rowSpan } = cell
                        let bgColor = 'bg-amber-500/8 border-amber-500/25 text-amber-300'
                        let dotColor = 'bg-amber-400'
                        if (reserva.status === 'Confirmed') {
                          bgColor = 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300'
                          dotColor = 'bg-emerald-400'
                        }
                        if (reserva.status === 'Completed') {
                          bgColor = 'bg-blue-500/8 border-blue-500/25 text-blue-300'
                          dotColor = 'bg-blue-400'
                        }
                        if (reserva.status === 'Cancelled' || reserva.status === 'No_show') {
                          bgColor = 'bg-zinc-500/8 border-zinc-500/25 text-zinc-300 opacity-70'
                          dotColor = 'bg-zinc-400'
                        }

                        return (
                          <td 
                            key={`${time}-${c.id}`} 
                            rowSpan={rowSpan}
                            className="border-b border-r border-[#1a1f3a] p-1 align-top"
                          >
                            <div 
                              onClick={() => openEditModal(reserva)}
                              className={`h-full w-full rounded-lg border-l-[3px] p-2.5 cursor-pointer transition-all duration-200 relative overflow-hidden group/card hover:brightness-110 ${bgColor}`}
                              style={{ minHeight: `${(rowSpan * 40) - 8}px` }}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                <span className={`font-bold text-xs truncate`}>{reserva.customer_name}</span>
                              </div>
                              {rowSpan > 1 && (
                                <div className="text-[10px] opacity-70 flex items-center gap-1 ml-3">
                                  <Clock size={9} />
                                  {formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)}
                                </div>
                              )}
                              <div className="absolute top-2 right-2 opacity-30 group-hover/card:opacity-50 transition-opacity">
                                <User size={11} />
                              </div>
                            </div>
                          </td>
                        )
                      }
                      return null
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1a1f3a]" />
        </div>
        <div className="relative flex justify-center">
          <div className="h-3 w-3 rotate-45 border-t border-l border-[#1a1f3a] bg-[#060a1a] -mt-[6.5px]" />
        </div>
      </div>

      {/* SECCIÓN 3: HISTORIAL */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
            <span className="h-6 w-1 rounded-full bg-purple-400" />
            Historial de Reservas
            <span className="text-[11px] font-medium text-[#8b94b5] bg-[#1a1f3a] px-2.5 py-0.5 rounded-full border border-[#1a1f3a]">
              {filteredReservas.length} registros
            </span>
          </h2>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b94b5]" size={17} />
            <input
              type="text"
              placeholder="Buscar por cliente o cancha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1533] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-[#8b94b5] focus:outline-none focus:border-[#ccff00]/40 transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-2.5">
            <Filter size={17} className="text-[#8b94b5]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-sm font-medium"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="No asiste">No asiste</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="relative rounded-xl overflow-hidden border border-[#1a1f3a] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0a0e27] border-b border-[#1a1f3a]">
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Cancha</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Hora</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Duración</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Estado</th>
                  <th className="text-left py-4 px-5 text-[#8b94b5] text-[11px] font-bold uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full border-2 border-[#1a1f3a] border-t-[#ccff00] animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#8b94b5] text-sm">
                      No se encontraron reservas en el historial.
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva) => {
                    let estadoEspanol = 'Pendiente'
                    let colorClass = 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    let dotColor = 'bg-amber-400'

                    if (reserva.status === 'Confirmed') {
                      estadoEspanol = 'Confirmada'
                      colorClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      dotColor = 'bg-emerald-400'
                    } else if (reserva.status === 'Completed') {
                      estadoEspanol = 'Completada'
                      colorClass = 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      dotColor = 'bg-blue-400'
                    } else if (reserva.status === 'Cancelled') {
                      estadoEspanol = 'Cancelada'
                      colorClass = 'bg-red-500/10 text-red-300 border-red-500/20'
                      dotColor = 'bg-red-400'
                    } else if (reserva.status === 'No_show') {
                      estadoEspanol = 'No asiste'
                      colorClass = 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                      dotColor = 'bg-zinc-400'
                    }

                    return (
                      <tr key={reserva.id} className="border-b border-[#1a1f3a] hover:bg-white/[0.015] transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 flex items-center justify-center">
                              <User size={14} className="text-[#ccff00]" />
                            </div>
                            <span className="text-white font-medium text-sm">{reserva.customer_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#c8cce5] text-sm">{reserva.court_name}</td>
                        <td className="py-4 px-5 text-[#c8cce5] text-sm">{formatDate(reserva.booking_date)}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-[#c8cce5] text-sm">
                            <Clock size={12} className="text-[#8b94b5]" />
                            {formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#8b94b5] text-sm">{getDuracion(reserva.start_time, reserva.end_time)}</td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${colorClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                            {estadoEspanol}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(reserva)}
                              className="flex items-center gap-1.5 text-[#8b94b5] hover:text-[#ccff00] transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-[#ccff00]/5"
                            >
                              <Edit2 size={13} /> Editar
                            </button>
                            <select 
                              value={reserva.status}
                              onChange={(e) => handleStatusChange(reserva.id, e.target.value)}
                              className="bg-[#1a1f3a] text-xs text-white border border-[#1a1f3a] rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:border-[#ccff00]/20 transition-colors font-medium"
                            >
                              <option value="Pending">Pendiente</option>
                              <option value="Confirmed">Confirmar</option>
                              <option value="Completed">Completar</option>
                              <option value="Cancelled">Cancelar</option>
                              <option value="No_show">No Asistió</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Reserva" : "Registrar Nueva Reserva"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 text-red-300 text-sm font-medium flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              {submitError}
            </div>
          )}
          <div className="relative">
            <label className="block text-sm font-medium text-[#8b94b5] mb-1.5">
              Cliente <span className="text-red-400">*</span>
            </label>
            <input 
              type="text"
              required={!formData.customer_id}
              value={customerSearchTerm}
              onFocus={() => setIsCustomerDropdownOpen(true)}
              onChange={(e) => {
                setCustomerSearchTerm(e.target.value)
                setFormData({...formData, customer_id: ''})
                setIsCustomerDropdownOpen(true)
              }}
              onBlur={() => setIsCustomerDropdownOpen(false)}
              placeholder="Buscar por nombre, correo o documento..."
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder:text-[#8b94b5] focus:outline-none focus:border-[#ccff00]/40 transition-colors text-sm"
            />
            {isCustomerDropdownOpen && (
              <ul className="absolute z-50 w-full mt-1.5 max-h-48 overflow-y-auto bg-[#0f1533] border border-[#1a1f3a] rounded-xl shadow-xl shadow-black/40">
                {clientes
                  .filter(c => {
                    const term = customerSearchTerm.toLowerCase()
                    return c.full_name?.toLowerCase().includes(term) || 
                           c.email?.toLowerCase().includes(term) || 
                           c.identification_number?.toLowerCase().includes(term)
                  })
                  .slice(0, 50)
                  .map(c => (
                    <li 
                      key={c.id} 
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setFormData({...formData, customer_id: c.id.toString()})
                        setCustomerSearchTerm(`${c.full_name} (${c.identification_number || c.email || 'Sin doc'})`)
                        setIsCustomerDropdownOpen(false)
                      }}
                      className="px-4 py-2.5 hover:bg-[#1a1f3a] cursor-pointer text-sm text-white transition-colors border-b border-[#1a1f3a] last:border-0"
                    >
                      <div className="font-semibold">{c.full_name}</div>
                      <div className="text-xs text-[#8b94b5] flex gap-1 mt-0.5">
                        {c.email} {c.identification_number ? `• Doc: ${c.identification_number}` : ''}
                      </div>
                    </li>
                ))}
                {clientes.filter(c => {
                    const term = customerSearchTerm.toLowerCase()
                    return c.full_name?.toLowerCase().includes(term) || 
                           c.email?.toLowerCase().includes(term) || 
                           c.identification_number?.toLowerCase().includes(term)
                  }).length === 0 && (
                  <li className="px-4 py-3 text-sm text-[#8b94b5] text-center">No se encontraron clientes</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b94b5] mb-1.5">
              Cancha <span className="text-red-400">*</span>
            </label>
            <select 
              required
              value={formData.court_id}
              onChange={(e) => setFormData({...formData, court_id: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/40 cursor-pointer text-sm"
            >
              <option value="" disabled>Selecciona una cancha</option>
              {canchas
                .filter(c => c.status === 'Available' || c.id.toString() === formData.court_id)
                .map(c => (
                <option key={c.id} value={c.id}>
                  {c.court_name} {c.status !== 'Available' ? '(Inhabilitada)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b94b5] mb-1.5">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input 
              type="date" 
              required
              value={formData.booking_date}
              onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/40 text-sm dark:[color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b94b5] mb-1.5">
                Hora de Inicio <span className="text-red-400">*</span>
              </label>
              <select 
                required
                value={formData.start_time.slice(0, 5)}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/40 cursor-pointer text-sm"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{formatAMPM(time)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b94b5] mb-1.5">
                Duración <span className="text-red-400">*</span>
              </label>
              <select 
                required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/40 cursor-pointer text-sm"
              >
                <option value="0.5">30 Minutos</option>
                <option value="1">1 Hora</option>
                <option value="1.5">1 Hora y Media</option>
                <option value="2">2 Horas</option>
                <option value="2.5">2 Horas y Media</option>
                <option value="3">3 Horas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[#1a1f3a]">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-white rounded-xl hover:bg-[#1a1f3a]/80 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-colors disabled:opacity-50 text-sm shadow-lg shadow-[#ccff00]/15"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-[#0a0e27]/30 border-t-[#0a0e27] animate-spin" />
                  Guardando...
                </span>
              ) : 'Guardar Reserva'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
