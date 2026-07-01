'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Clock, User, Search, Filter, CalendarDays, MapPin, ChevronDown, ChevronUp, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import { customerService } from '@/services/customerService'
import { courtService } from '@/services/courtService'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'

export default function ReservasView() {
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros Historial
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  // Datos para los selectores
  const [clientes, setClientes] = useState<any[]>([])
  const [canchas, setCanchas] = useState<any[]>([])

  // Estado para Próximas Reservas
  const [showAllProximas, setShowAllProximas] = useState(false)

  // Modal State
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

  // Estado para la Agenda Diaria
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchData()
  }, [])

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
      // Calcular end_time
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
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        
        setFormData({ customer_id: '', court_id: '', booking_date: `${yyyy}-${mm}-${dd}`, start_time: '08:00', duration: '1' })
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
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')

    setEditingId(null)
    setFormData({ customer_id: '', court_id: '', booking_date: `${yyyy}-${mm}-${dd}`, start_time: '08:00', duration: '1' })
    setSubmitError('')
    setIsModalOpen(true)
  }

  const openEditModal = (reserva: any) => {
    // Calcular duración en horas para pre-seleccionar el dropdown
    const t1 = new Date(`1970-01-01T${reserva.start_time}`).getTime()
    const t2 = new Date(`1970-01-01T${reserva.end_time}`).getTime()
    const diffHours = (t2 - t1) / (1000 * 60 * 60)
    
    // Formatear fecha
    const d = new Date(reserva.booking_date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formattedDate = `${yyyy}-${mm}-${dd}`

    const customerIdStr = reserva.customer_id ? reserva.customer_id.toString() : ''

    setEditingId(reserva.id)
    setFormData({
      customer_id: customerIdStr,
      court_id: reserva.court_id ? reserva.court_id.toString() : '',
      booking_date: formattedDate,
      start_time: reserva.start_time?.slice(0, 5) || '08:00',
      duration: diffHours.toString()
    })
    setSubmitError('')
    setIsModalOpen(true)
  }

  // Helper para duración y fecha
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

  const getDateLabel = (dateStr: string) => {
    if (!dateStr) return { label: '', color: '' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const rDate = new Date(dateStr)
    rDate.setHours(0, 0, 0, 0)
    const diffDays = Math.round((rDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { label: 'Hoy', color: 'bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/30' }
    if (diffDays === 1) return { label: 'Mañana', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
    if (diffDays <= 7) return { label: `En ${diffDays} días`, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
    return { label: `${rDate.toLocaleDateString('es-ES', { weekday: 'short' })}`, color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' }
  }

  const formatAMPM = (timeStr?: string) => {
    if (!timeStr) return ''
    const [hStr, mStr] = timeStr.split(':')
    let h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    h = h ? h : 12 // la hora 0 debe ser 12
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  // Generar bloques de tiempo (08:00 a 00:00)
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const totalMins = 8 * 60 + i * 30
    const h = (Math.floor(totalMins / 60) % 24).toString().padStart(2, '0')
    const m = (totalMins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  })

  // ==========================================
  // LÓGICA DE AGENDA DIARIA (GRID)
  // ==========================================
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
    setIsModalOpen(true)
  }

  const scheduleReservas = reservas.filter(r => {
    if (!r.booking_date) return false
    
    // Extraer YYYY-MM-DD de scheduleDate (la fecha que el usuario seleccionó en la UI)
    const yyyy = scheduleDate.getFullYear()
    const mm = String(scheduleDate.getMonth() + 1).padStart(2, '0')
    const dd = String(scheduleDate.getDate()).padStart(2, '0')
    const targetDateStr = `${yyyy}-${mm}-${dd}`
    
    // Extraer YYYY-MM-DD de la base de datos de forma directa (ignorar T00:00:00.000Z)
    const rDateStr = typeof r.booking_date === 'string' ? r.booking_date.split('T')[0] : new Date(r.booking_date).toISOString().split('T')[0]
    
    // Ignorar reservas canceladas o no asiste para no bloquear la cuadrícula
    const isActive = r.status !== 'Cancelled' && r.status !== 'No_show'
    
    return rDateStr === targetDateStr && isActive
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
      
      // Fallback robusto por si el backend no envía el court_id pero sí el court_name
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

  // ==========================================
  // LÓGICA DE PRÓXIMAS RESERVAS (TOP SECTION)
  // ==========================================
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

  // ==========================================
  // LÓGICA DE HISTORIAL COMPLETO (BOTTOM SECTION)
  // ==========================================
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

  return (
    <div className="p-4 md:p-8">
      {/* Header General */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Reservas</h1>
          <p className="text-muted-foreground">Gestiona la agenda y ocupación de tu complejo</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold w-full md:w-auto shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-sm hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reservas Hoy</span>
            <div className="h-9 w-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center">
              <CalendarDays size={16} className="text-[#ccff00]" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{reservas.filter(r => { const d = new Date(r.booking_date); const today = new Date(); return d.toDateString() === today.toDateString() && r.status !== 'Cancelled' && r.status !== 'No_show'; }).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Reservas activas para hoy</p>
        </div>
        <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-sm hover:border-yellow-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pendientes</span>
            <div className="h-9 w-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Clock size={16} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{reservas.filter(r => r.status === 'Pending').length}</p>
          <p className="text-xs text-muted-foreground mt-1">Esperando aprobación</p>
        </div>
        <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-sm hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirmadas</span>
            <div className="h-9 w-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CalendarDays size={16} className="text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{reservas.filter(r => r.status === 'Confirmed').length}</p>
          <p className="text-xs text-muted-foreground mt-1">Reservas aprobadas</p>
        </div>
        <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historial</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Search size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{reservas.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total de registros</p>
        </div>
      </div>

      {/* SECCIÓN 1: PRÓXIMAS RESERVAS PENDIENTES */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="text-accent" />
          Próximas Reservas (Por Confirmar)
        </h2>
        
        {actionError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {actionError}
            </div>
            <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-300 text-lg leading-none">&times;</button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : proximasReservas.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No tienes reservas pendientes para hoy o los próximos días.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proximasMostradas.map((reserva) => {
                const dateLabel = getDateLabel(reserva.booking_date)
                return (
                <div key={reserva.id} className="group bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-5 hover:border-accent/30 transition-all relative overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <User size={16} className="text-accent" />
                        {reserva.customer_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dateLabel.color}`}>
                          {dateLabel.label}
                        </span>
                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                          Pendiente
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatDate(reserva.booking_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)} ({getDuracion(reserva.start_time, reserva.end_time)})
                      </div>
                      <div className="flex items-center gap-2 text-foreground font-medium mt-2 pt-2 border-t border-border/50">
                        <MapPin size={14} className="text-primary" />
                        {reserva.court_name}
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                        <button onClick={() => handleStatusChange(reserva.id, 'Confirmed')} className="flex-1 bg-green-500/20 text-green-300 py-1.5 rounded text-xs font-bold hover:bg-green-500/30 transition-colors backdrop-blur-sm">Aprobar</button>
                        <button onClick={() => handleStatusChange(reserva.id, 'Cancelled')} className="flex-1 bg-red-500/20 text-red-300 py-1.5 rounded text-xs font-bold hover:bg-red-500/30 transition-colors backdrop-blur-sm">Rechazar</button>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
            
            {proximasReservas.length > 3 && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setShowAllProximas(!showAllProximas)}
                  className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  {showAllProximas ? (
                    <><ChevronUp size={16} /> Ver menos</>
                  ) : (
                    <><ChevronDown size={16} /> Ver todas ({proximasReservas.length})</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-border my-8" />

      {/* SECCIÓN 2: AGENDA DIARIA (HORARIO) */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" />
            Agenda Diaria <span className="text-sm font-normal text-muted-foreground ml-2">({scheduleReservas.length} reservas)</span>
          </h2>

          <div className="flex items-center bg-card border border-border rounded-lg p-1 shadow-sm">
            <button onClick={prevDay} className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={20} />
            </button>
            <div 
              onClick={goToToday}
              className="text-sm font-bold min-w-[200px] text-center text-foreground cursor-pointer hover:text-primary transition-colors select-none"
            >
              {formatDateForSchedule(scheduleDate)}
            </div>
            <button onClick={nextDay} className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="border-b border-r border-border bg-secondary/80 p-3 w-28 text-center text-muted-foreground font-bold sticky left-0 z-20">Hora</th>
                {canchas.map(c => (
                  <th key={c.id} className="border-b border-r border-border bg-secondary/80 p-3 text-center text-foreground font-bold min-w-[160px] max-w-[200px]">
                    <div className="truncate">{c.court_name}</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{c.sport || 'Cancha'} {c.status !== 'Available' ? '(Inactiva)' : ''}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border-b border-r border-border bg-secondary/30 p-2 text-center text-muted-foreground font-semibold sticky left-0 z-10">
                    {formatAMPM(time)}
                  </td>
                  {canchas.map(c => {
                    const cell = scheduleGrid[time]?.[c.id]
                    if (!cell || cell.type === 'skip') return null;

                    if (cell.type === 'empty') {
                      return (
                        <td 
                          key={`${time}-${c.id}`} 
                          className={`border-b border-r border-border p-2 transition-colors cursor-pointer group ${c.status !== 'Available' ? 'bg-secondary/10' : 'hover:bg-secondary/40'}`}
                          onClick={() => c.status === 'Available' && handleCellClick(time, c.id.toString())}
                        >
                          {c.status === 'Available' && (
                            <div className="h-full w-full min-h-[36px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                              <Plus size={18} />
                            </div>
                          )}
                        </td>
                      )
                    }

                    if (cell.type === 'booking') {
                      const { reserva, rowSpan } = cell
                      let bgColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                      if (reserva.status === 'Confirmed') bgColor = 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
                      if (reserva.status === 'Completed') bgColor = 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20'
                      if (reserva.status === 'Cancelled' || reserva.status === 'No_show') bgColor = 'bg-gray-500/10 border-gray-500/30 text-gray-500 hover:bg-gray-500/20 opacity-70'

                      return (
                        <td 
                          key={`${time}-${c.id}`} 
                          rowSpan={rowSpan}
                          className="border-b border-r border-border p-1.5 align-top"
                        >
                          <div 
                            onClick={() => openEditModal(reserva)}
                            className={`h-full w-full rounded-md border-l-4 border-y border-r p-2 cursor-pointer transition-all flex flex-col justify-start relative overflow-hidden ${bgColor}`}
                            style={{ minHeight: `${(rowSpan * 53) - 12}px` }}
                          >
                            <div className="font-bold text-xs truncate pr-4">#{reserva.id} - {reserva.customer_name}</div>
                            {rowSpan > 1 && (
                              <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)}
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-50">
                              <User size={12} />
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

      <hr className="border-border my-8" />

      {/* SECCIÓN 3: HISTORIAL Y BÚSQUEDA */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Historial de Reservas</h2>
        
        {/* Toolbar (Search & Filters) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente o cancha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            <Filter size={20} className="text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
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

        {/* Table Historial */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Reserva #</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cliente</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cancha</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Hora</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Duración</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Estado</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No se encontraron reservas en el historial.
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva) => {
                    let estadoEspanol = 'Pendiente'
                    let colorClass = 'bg-yellow-500/20 text-yellow-300'
                    
                    if (reserva.status === 'Confirmed') {
                      estadoEspanol = 'Confirmada'
                      colorClass = 'bg-green-500/20 text-green-300'
                    }
                    if (reserva.status === 'Completed') {
                      estadoEspanol = 'Completada'
                      colorClass = 'bg-blue-500/20 text-blue-300'
                    }
                    if (reserva.status === 'Cancelled') {
                      estadoEspanol = 'Cancelada'
                      colorClass = 'bg-red-500/20 text-red-300'
                    }
                    if (reserva.status === 'No_show') {
                      estadoEspanol = 'No asiste'
                      colorClass = 'bg-gray-500/20 text-gray-300'
                    }

                    return (
                      <tr key={reserva.id} className="border-b border-border hover:bg-secondary transition-colors">
                        <td className="py-4 px-6 text-foreground font-bold text-primary">#{reserva.id}</td>
                        <td className="py-4 px-6 text-foreground font-medium">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-accent opacity-70" />
                            {reserva.customer_name}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-foreground">{reserva.court_name}</td>
                        <td className="py-4 px-6 text-foreground">{formatDate(reserva.booking_date)}</td>
                        <td className="py-4 px-6 text-sm text-foreground">{formatAMPM(reserva.start_time)} - {formatAMPM(reserva.end_time)}</td>
                        <td className="py-4 px-6 text-foreground">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} />
                            {getDuracion(reserva.start_time, reserva.end_time)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                            {estadoEspanol}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button 
                              onClick={() => openEditModal(reserva)}
                              className="text-accent hover:text-accent/80 transition-colors text-xs flex items-center gap-1 font-semibold shrink-0"
                            >
                              <Edit2 size={14} /> Editar
                            </button>
                            <select 
                              value={reserva.status}
                              onChange={(e) => handleStatusChange(reserva.id, e.target.value)}
                              className="bg-secondary text-xs text-foreground border border-border rounded px-2 py-1 focus:outline-none cursor-pointer"
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
      </div>

      {/* Modal Nueva/Editar Reserva */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Reserva" : "Registrar Nueva Reserva"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cliente *
            </label>
            <SearchableSelect
              required
              value={formData.customer_id}
              onChange={(val) => setFormData({...formData, customer_id: val.toString()})}
              placeholder="Buscar por nombre, correo o documento..."
              options={clientes.map(c => ({
                value: c.id,
                label: c.full_name,
                sublabel: `${c.email} ${c.identification_number ? `• Doc: ${c.identification_number}` : ''}`,
                searchString: `${c.full_name} ${c.email} ${c.identification_number}`
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cancha *
            </label>
            <select 
              required
              value={formData.court_id}
              onChange={(e) => setFormData({...formData, court_id: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
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
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Fecha *
            </label>
            <input 
              type="date" 
              required
              value={formData.booking_date}
              onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary dark:[color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Hora de Inicio *
              </label>
              <select 
                required
                value={formData.start_time.slice(0, 5)} // Asegurar formato HH:MM
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{formatAMPM(time)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Duración *
              </label>
              <select 
                required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
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
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Reserva'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
