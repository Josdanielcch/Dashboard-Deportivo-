'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Clock, User, Search, Filter, CalendarDays, MapPin, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import { customerService } from '@/services/customerService'
import { courtService } from '@/services/courtService'
import { Modal } from '@/components/ui/modal'

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

    setEditingId(reserva.id)
    setFormData({
      customer_id: reserva.customer_id ? reserva.customer_id.toString() : '',
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

  // Generar bloques de tiempo (06:00 a 23:00)
  const timeSlots = Array.from({ length: 35 }, (_, i) => {
    const totalMins = 6 * 60 + i * 30
    const h = Math.floor(totalMins / 60).toString().padStart(2, '0')
    const m = (totalMins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  })

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
              {proximasMostradas.map((reserva) => (
                <div key={reserva.id} className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <User size={16} className="text-accent" />
                      {reserva.customer_name}
                    </h3>
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                      Pendiente
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {formatDate(reserva.booking_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {reserva.start_time?.slice(0, 5)} - {reserva.end_time?.slice(0, 5)} ({getDuracion(reserva.start_time, reserva.end_time)})
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium mt-2 pt-2 border-t border-border/50">
                      <MapPin size={14} className="text-primary" />
                      {reserva.court_name}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                      <button onClick={() => handleStatusChange(reserva.id, 'Confirmed')} className="flex-1 bg-green-500/20 text-green-300 py-1.5 rounded text-xs font-bold hover:bg-green-500/30 transition-colors">Aprobar</button>
                      <button onClick={() => handleStatusChange(reserva.id, 'Cancelled')} className="flex-1 bg-red-500/20 text-red-300 py-1.5 rounded text-xs font-bold hover:bg-red-500/30 transition-colors">Rechazar</button>
                    </div>
                  </div>
                </div>
              ))}
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

      {/* SECCIÓN 2: HISTORIAL Y BÚSQUEDA */}
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
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
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
                        <td className="py-4 px-6 text-foreground font-medium">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-accent opacity-70" />
                            {reserva.customer_name}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-foreground">{reserva.court_name}</td>
                        <td className="py-4 px-6 text-foreground">{formatDate(reserva.booking_date)}</td>
                        <td className="py-4 px-6 text-foreground">{reserva.start_time?.slice(0, 5)} - {reserva.end_time?.slice(0, 5)}</td>
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
            <select 
              required
              value={formData.customer_id}
              onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="" disabled>Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.identification_number || c.email || 'Sin doc'})</option>
              ))}
            </select>
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
              {canchas.map(c => (
                <option key={c.id} value={c.id}>{c.court_name}</option>
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
                  <option key={time} value={time}>{time}</option>
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
