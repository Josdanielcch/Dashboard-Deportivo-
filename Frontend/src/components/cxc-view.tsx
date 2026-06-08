'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Search, Filter, CreditCard, CheckCircle } from 'lucide-react'
import { cxcService } from '@/services/cxcService'
import { Modal } from '@/components/ui/modal'

export default function CxcView() {
  const [cxcList, setCxcList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Activas')

  // Modal State for Payment
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCxc, setSelectedCxc] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: '',
    payment_method_id: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCxc()
  }, [])

  const fetchCxc = async () => {
    try {
      setLoading(true)
      const res = await cxcService.getAll()
      if (res.success) {
        setCxcList(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching CxC:', error)
      // Fallback
      setCxcList([
        { id: 1, customer_name: 'Juan García', billing_id: 101, total_amount: 500, balance: 250, status: 'Parcial', created_at: '2024-06-15T00:00:00.000Z' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPayment = (cxc: any) => {
    setSelectedCxc(cxc)
    setFormData({
      amount: cxc.balance,
      payment_method_id: '1'
    })
    setIsModalOpen(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        account_receivable_id: selectedCxc.id,
        amount: parseFloat(formData.amount),
        payment_method_id: parseInt(formData.payment_method_id)
      }
      const res = await cxcService.createPayment(payload.account_receivable_id, payload.amount, payload.payment_method_id)
      if (res.success) {
        setIsModalOpen(false)
        fetchCxc()
      }
    } catch (error: any) {
      console.error('Error creando abono:', error)
      alert(error.message || 'Hubo un error al registrar el abono.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrado
  const filteredCxc = cxcList.filter((cxc) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      cxc.customer_name?.toLowerCase().includes(term) ||
      cxc.id?.toString().includes(term)

    const matchesStatus = statusFilter === 'Todos' || 
                          cxc.status === statusFilter || 
                          (statusFilter === 'Activas' && (cxc.status === 'Pendiente' || cxc.status === 'Parcial'))

    return matchesSearch && matchesStatus
  })

  // Estadísticas
  const totalBalance = filteredCxc.reduce((acc, cxc) => acc + Number(cxc.balance || 0), 0)
  const totalCxC = `$${totalBalance.toFixed(2)}`

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const dateObj = new Date(dateStr)
    return new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Gestión de deudas y abonos de clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Deuda Total Pendiente</p>
              <p className="text-3xl font-bold text-red-500">{totalCxC}</p>
            </div>
            <DollarSign className="text-red-500 opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Registros</p>
              <p className="text-3xl font-bold text-accent">{filteredCxc.length}</p>
            </div>
            <CreditCard className="text-accent opacity-80" size={32} />
          </div>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
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
            <option value="Activas">Activas (Pendientes y Parciales)</option>
            <option value="Todos">Todos los Estados</option>
            <option value="Pendiente">Solo Pendiente</option>
            <option value="Parcial">Solo Parcial</option>
            <option value="Pagado">Solo Pagado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cliente</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha Emisión</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Monto Original</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Balance Pendiente</th>
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
              ) : filteredCxc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No se encontraron cuentas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredCxc.map((cxc) => (
                  <React.Fragment key={cxc.id}>
                    <tr className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="py-4 px-6 text-foreground font-mono">#{cxc.id}</td>
                      <td className="py-4 px-6 text-foreground font-medium">{cxc.customer_name}</td>
                      <td className="py-4 px-6 text-muted-foreground">{formatDate(cxc.created_at)}</td>
                      <td className="py-4 px-6 text-foreground font-semibold">${Number(cxc.total_amount || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 text-red-500 font-bold">${Number(cxc.balance || 0).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cxc.status === 'Pagado' ? 'bg-green-500/20 text-green-300' :
                          cxc.status === 'Parcial' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {cxc.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {cxc.status !== 'Pagado' ? (
                          <button 
                            onClick={() => handleOpenPayment(cxc)}
                            className="text-primary hover:text-primary/80 transition-colors text-xs underline font-semibold flex items-center gap-1"
                          >
                            <DollarSign size={14} />
                            Abonar
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                            <CheckCircle size={14} /> Listo
                          </span>
                        )}
                      </td>
                    </tr>
                    {cxc.payments && cxc.payments.length > 0 && (
                      <tr className="bg-secondary/30">
                        <td colSpan={7} className="py-3 px-8">
                          <div className="pl-4 border-l-2 border-primary/40">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Historial de Abonos</p>
                            <div className="flex flex-col gap-2">
                              {cxc.payments.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-4 text-sm">
                                  <span className="text-muted-foreground">{formatDate(payment.payment_date)}</span>
                                  <span className="text-foreground font-medium">Abono: <span className="text-green-500">${Number(payment.amount).toFixed(2)}</span></span>
                                  <span className="text-xs bg-card px-2 py-1 rounded-md border border-border">{payment.method_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Abonar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Abono o Pago"
      >
        {selectedCxc && (
          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
            <div className="bg-secondary/50 p-4 rounded-lg mb-2">
              <p className="text-sm text-muted-foreground">Cliente: <span className="text-foreground font-semibold">{selectedCxc.customer_name}</span></p>
              <p className="text-sm text-muted-foreground">Deuda Actual: <span className="text-red-500 font-bold">${Number(selectedCxc.balance).toFixed(2)}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Monto a Abonar *
              </label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                max={selectedCxc.balance}
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Método de Pago *
              </label>
              <select 
                required
                value={formData.payment_method_id}
                onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="1">Efectivo</option>
                <option value="2">Pago Móvil</option>
                <option value="3">Transferencia</option>
                <option value="5">Zelle</option>
              </select>
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
                {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
