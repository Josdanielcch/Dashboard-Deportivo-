'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Search, Filter, CreditCard, CheckCircle, X, Printer } from 'lucide-react'
import { cxcService } from '@/services/cxcService'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/contexts/toast-context'

export default function CxcView() {
  const { showToast } = useToast()
  const [cxcList, setCxcList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Activas')

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
      showToast(error.message || 'Hubo un error al registrar el abono.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const totalBalance = filteredCxc.reduce((acc, cxc) => acc + Number(cxc.balance || 0), 0)
  const totalOriginal = filteredCxc.reduce((acc, cxc) => acc + Number(cxc.total_amount || 0), 0)
  const totalCxC = `$${totalBalance.toFixed(2)}`

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    const thStyle = 'padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;background:#f9fafb;'

    const groups: Record<string, any[]> = {}
    filteredCxc.forEach(c => {
      const name = c.customer_name || 'Sin cliente'
      if (!groups[name]) groups[name] = []
      groups[name].push(c)
    })

    let sections = ''
    Object.keys(groups).sort().forEach(name => {
      const items = groups[name]
      const groupBalance = items.reduce((a, c) => a + Number(c.balance || 0), 0)
      const groupOriginal = items.reduce((a, c) => a + Number(c.total_amount || 0), 0)
      const rows = items.map(c => {
        const statusColor = c.status === 'Pagado' ? '#059669' : c.status === 'Parcial' ? '#d97706' : '#dc2626'
        const statusBg = c.status === 'Pagado' ? '#ecfdf5' : c.status === 'Parcial' ? '#fffbeb' : '#fef2f2'
        return '<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:600;">#' + c.id + '</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">' + formatDate(c.created_at) + '</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:700;text-align:right;">$' + Number(c.total_amount || 0).toFixed(2) + '</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#dc2626;font-weight:700;text-align:right;">$' + Number(c.balance || 0).toFixed(2) + '</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;"><span style="background:' + statusBg + ';color:' + statusColor + ';padding:2px 8px;border-radius:12px;font-weight:600;font-size:12px;">' + c.status + '</span></td></tr>'
      }).join('')

      sections += '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px;page-break-inside:avoid;">'
      sections += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
      sections += '<div style="display:flex;align-items:center;gap:10px;">'
      sections += '<div style="width:36px;height:36px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">' + name.charAt(0).toUpperCase() + '</div>'
      sections += '<div><p style="margin:0;font-size:15px;font-weight:700;color:#111827;">' + name + '</p>'
      sections += '<p style="margin:0;font-size:11px;color:#6b7280;">' + items.length + ' cuenta(s)</p></div>'
      sections += '</div>'
      sections += '<div style="text-align:right;">'
      sections += '<p style="margin:0;font-size:11px;color:#6b7280;">Original: <span style="font-weight:700;color:#111827;">$' + groupOriginal.toFixed(2) + '</span></p>'
      sections += '<p style="margin:0;font-size:13px;font-weight:800;color:#dc2626;">Pendiente: $' + groupBalance.toFixed(2) + '</p>'
      sections += '</div></div>'
      sections += '<table style="width:100%;border-collapse:collapse;">'
      sections += '<thead><tr><th style="' + thStyle + 'text-align:left;">ID</th><th style="' + thStyle + 'text-align:left;">Fecha</th><th style="' + thStyle + 'text-align:right;">Monto Original</th><th style="' + thStyle + 'text-align:right;">Balance Pendiente</th><th style="' + thStyle + 'text-align:center;">Estado</th></tr></thead>'
      sections += '<tbody>' + rows + '</tbody></table></div>'
    })

    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe CxC</title><style>'
    html += 'body{margin:0;padding:24px 32px;background:#ffffff;color:#111827;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;}'
    html += 'h1{font-size:22px;margin:0 0 4px;font-weight:900;color:#111827;}'
    html += '.sub{font-size:12px;color:#6b7280;margin-bottom:20px;}'
    html += '.kg{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;}'
    html += '.k{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;}'
    html += '.kl{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;}'
    html += '.kv{font-size:24px;font-weight:900;margin-top:4px;color:#111827;}'
    html += '.kv.a{color:#dc2626;}'
    html += '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}'
    html += '</style></head><body>'
    html += '<h1>Informe de Cuentas por Cobrar</h1>'
    html += '<div class="sub">Generado: ' + new Date().toLocaleString('es-DO') + ' | Filtro: ' + statusFilter + '</div>'
    html += '<div class="kg"><div class="k"><div class="kl">Deuda Total Pendiente</div><div class="kv a">$' + totalBalance.toFixed(2) + '</div></div><div class="k"><div class="kl">Total Registros</div><div class="kv">' + filteredCxc.length + '</div></div></div>'
    html += sections
    html += '</body></html>'

    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const dateObj = new Date(dateStr)
    return new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0e27] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cuentas por Cobrar</h1>
          <p className="text-zinc-400">Gestion de deudas y abonos de clientes</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-bold hover:bg-[#ccff00]/20 transition-all duration-300"
        >
          <Printer size={15} />
          Imprimir Informe
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Deuda Total Pendiente</p>
              <p className="text-3xl font-bold text-rose-400">{totalCxC}</p>
            </div>
            <div className="bg-rose-500/10 p-3 rounded-lg">
              <DollarSign className="text-rose-400" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Registros</p>
              <p className="text-3xl font-bold text-[#ccff00]">{filteredCxc.length}</p>
            </div>
            <div className="bg-[#ccff00]/10 p-3 rounded-lg">
              <CreditCard className="text-[#ccff00]" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-lg px-4 py-2">
          <Filter size={20} className="text-zinc-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
          >
            <option value="Activas" className="bg-[#0f1533]">Activas (Pendientes y Parciales)</option>
            <option value="Todos" className="bg-[#0f1533]">Todos los Estados</option>
            <option value="Pendiente" className="bg-[#0f1533]">Solo Pendiente</option>
            <option value="Parcial" className="bg-[#0f1533]">Solo Parcial</option>
            <option value="Pagado" className="bg-[#0f1533]">Solo Pagado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]/50">
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">ID</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Fecha Emision</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Monto Original</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Balance Pendiente</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Estado</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
                    </div>
                    <p className="text-zinc-400 mt-3 text-sm">Cargando cuentas...</p>
                  </td>
                </tr>
              ) : filteredCxc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="text-zinc-500" size={24} />
                      <p className="text-zinc-400">No se encontraron cuentas que coincidan con los filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCxc.map((cxc) => (
                  <React.Fragment key={cxc.id}>
                    <tr className="border-b border-[#1a1f3a] hover:bg-[#0a0e27]/40 transition-colors group">
                      <td className="py-4 px-6 text-white font-mono">#{cxc.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] text-xs font-bold">
                            {cxc.customer_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-white font-medium">{cxc.customer_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">{formatDate(cxc.created_at)}</td>
                      <td className="py-4 px-6 text-white font-semibold">${Number(cxc.total_amount || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 text-rose-400 font-bold">${Number(cxc.balance || 0).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          cxc.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          cxc.status === 'Parcial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            cxc.status === 'Pagado' ? 'bg-emerald-400' :
                            cxc.status === 'Parcial' ? 'bg-amber-400' :
                            'bg-rose-400'
                          }`} />
                          {cxc.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {cxc.status !== 'Pagado' ? (
                          <button 
                            onClick={() => handleOpenPayment(cxc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ccff00] text-[#0a0e27] text-xs font-bold rounded-lg hover:bg-[#ccff00]/90 transition-all hover:shadow-lg hover:shadow-[#ccff00]/20"
                          >
                            <DollarSign size={14} />
                            Abonar
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                            <CheckCircle size={14} /> Pagado
                          </span>
                        )}
                      </td>
                    </tr>
                    {cxc.payments && cxc.payments.length > 0 && (
                      <tr className="bg-[#0a0e27]/30">
                        <td colSpan={7} className="py-3 px-8">
                          <div className="pl-4 border-l-2 border-[#ccff00]/30">
                            <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Historial de Abonos</p>
                            <div className="flex flex-col gap-2">
                              {cxc.payments.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-4 text-sm">
                                  <span className="text-zinc-400">{formatDate(payment.payment_date)}</span>
                                  <span className="text-white font-medium">Abono: <span className="text-emerald-400">${Number(payment.amount).toFixed(2)}</span></span>
                                  <span className="text-xs bg-[#0f1533] text-zinc-300 px-2 py-1 rounded-md border border-[#1a1f3a]">{payment.method_name}</span>
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
            <div className="bg-[#0a0e27] border border-[#1a1f3a] p-4 rounded-lg mb-2">
              <p className="text-sm text-zinc-400">Cliente: <span className="text-white font-semibold">{selectedCxc.customer_name}</span></p>
              <p className="text-sm text-zinc-400">Deuda Actual: <span className="text-rose-400 font-bold">${Number(selectedCxc.balance).toFixed(2)}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Metodo de Pago *
              </label>
              <select 
                required
                value={formData.payment_method_id}
                onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer"
              >
                <option value="1" className="bg-[#0f1533]">Efectivo</option>
                <option value="2" className="bg-[#0f1533]">Pago Movil</option>
                <option value="3" className="bg-[#0f1533]">Transferencia</option>
                <option value="5" className="bg-[#0f1533]">Zelle</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-[#0a0e27] text-white border border-[#1a1f3a] rounded-lg hover:bg-[#1a1f3a] transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-lg hover:bg-[#ccff00]/90 transition-all hover:shadow-lg hover:shadow-[#ccff00]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0a0e27] border-t-transparent"></div>
                    Procesando...
                  </span>
                ) : 'Confirmar Pago'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
