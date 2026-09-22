'use client'

import React, { useState, useEffect } from 'react'
import { 
  Save, Building2, Phone, Mail, MapPin, FileText, CheckCircle, 
  Coins, CreditCard, Plus, Edit2, Trash2, Check, X, ArrowRightLeft,
  Smartphone, Landmark, DollarSign, Wallet, RefreshCw, AlertCircle
} from 'lucide-react'
import { settingsService } from '@/services/settingsService'
import { paymentService } from '@/services/paymentService'
import { useToast } from '@/contexts/toast-context'
import { Modal } from '@/components/ui/modal'

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  symbol: string
  rate_to_usd: string | number
  is_active: boolean
  updated_at?: string
}

interface PaymentAccount {
  id?: number
  name: string
  type: string
  currency_code: string
  bank_name?: string
  account_number?: string
  account_holder?: string
  id_document?: string
  phone?: string
  email?: string
  instructions?: string
  is_active: boolean
  display_order?: number
}

export default function ConfiguracionView() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'empresa' | 'multimoneda' | 'pagos'>('empresa')

  // --- Estado de Empresa ---
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [previewFormat, setPreviewFormat] = useState<'ticket' | 'a4'>('ticket')
  const [formData, setFormData] = useState({
    business_name: '',
    legal_id: '',
    address: '',
    phone: '',
    email: '',
    invoice_footer_message: ''
  })

  // --- Estado de Multimoneda y Tasas ---
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [savingRates, setSavingRates] = useState(false)
  const [calcUsdAmount, setCalcUsdAmount] = useState<string>('20')

  // --- Estado de Métodos de Pago ---
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null)
  const [accountFormData, setAccountFormData] = useState<PaymentAccount>({
    name: '',
    type: 'pago_movil',
    currency_code: 'VES',
    bank_name: '',
    account_number: '',
    account_holder: '',
    id_document: '',
    phone: '',
    email: '',
    instructions: '',
    is_active: true,
    display_order: 0
  })

  // Cargar datos al montar
  useEffect(() => {
    fetchSettings()
    fetchRates()
    fetchPaymentAccounts()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const res = await settingsService.getSettings()
    if (res.success && res.data) {
      setFormData({
        business_name: res.data.business_name || '',
        legal_id: res.data.legal_id || '',
        address: res.data.address || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        invoice_footer_message: res.data.invoice_footer_message || ''
      })
    }
    setLoading(false)
  }

  const fetchRates = async () => {
    setLoadingRates(true)
    try {
      const res = await paymentService.getExchangeRates()
      if (res?.data) {
        setExchangeRates(res.data)
      }
    } catch (err: any) {
      console.error('Error al cargar tasas:', err)
    } finally {
      setLoadingRates(false)
    }
  }

  const fetchPaymentAccounts = async () => {
    setLoadingAccounts(true)
    try {
      const res = await paymentService.getPaymentAccounts()
      if (res?.data) {
        setPaymentAccounts(res.data)
      }
    } catch (err: any) {
      console.error('Error al cargar cuentas de pago:', err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    const res = await settingsService.updateSettings(formData)
    if (res.success) {
      setSuccessMsg('¡Configuración guardada exitosamente!')
      showToast('Configuración general guardada', 'success')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      showToast(res.error || 'Error al guardar la configuración', 'error')
    }
    setSaving(false)
  }

  // --- Handlers de Multimoneda ---
  const handleRateChange = (index: number, value: string) => {
    setExchangeRates(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], rate_to_usd: value }
      return copy
    })
  }

  const handleSaveRates = async () => {
    setSavingRates(true)
    try {
      const ratesToUpdate = exchangeRates.map(r => ({
        currency_code: r.currency_code,
        rate_to_usd: parseFloat(String(r.rate_to_usd)),
        is_active: r.is_active
      }))
      const res = await paymentService.bulkUpdateExchangeRates(ratesToUpdate)
      if (res?.success) {
        showToast('¡Tasas de cambio actualizadas correctamente!', 'success')
        fetchRates()
      } else {
        showToast(res?.error || 'Error al actualizar tasas', 'error')
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar tasas', 'error')
    } finally {
      setSavingRates(false)
    }
  }

  // --- Handlers de Cuentas de Pago ---
  const handleOpenCreateModal = () => {
    setEditingAccount(null)
    setAccountFormData({
      name: '',
      type: 'pago_movil',
      currency_code: 'VES',
      bank_name: '',
      account_number: '',
      account_holder: '',
      id_document: '',
      phone: '',
      email: '',
      instructions: '',
      is_active: true,
      display_order: paymentAccounts.length + 1
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (acc: PaymentAccount) => {
    setEditingAccount(acc)
    setAccountFormData({
      name: acc.name,
      type: acc.type,
      currency_code: acc.currency_code,
      bank_name: acc.bank_name || '',
      account_number: acc.account_number || '',
      account_holder: acc.account_holder || '',
      id_document: acc.id_document || '',
      phone: acc.phone || '',
      email: acc.email || '',
      instructions: acc.instructions || '',
      is_active: acc.is_active,
      display_order: acc.display_order || 0
    })
    setIsModalOpen(true)
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAccount?.id) {
        const res = await paymentService.updatePaymentAccount(editingAccount.id, accountFormData)
        if (res?.success) {
          showToast('Método de pago actualizado', 'success')
          setIsModalOpen(false)
          fetchPaymentAccounts()
        } else {
          showToast(res?.error || 'Error al actualizar', 'error')
        }
      } else {
        const res = await paymentService.createPaymentAccount(accountFormData)
        if (res?.success) {
          showToast('Método de pago agregado exitosamente', 'success')
          setIsModalOpen(false)
          fetchPaymentAccounts()
        } else {
          showToast(res?.error || 'Error al crear', 'error')
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al procesar método de pago', 'error')
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await paymentService.togglePaymentAccount(id)
      if (res?.success) {
        showToast(res.message, 'success')
        setPaymentAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a))
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al cambiar estado', 'error')
    }
  }

  const handleDeleteAccount = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este método de pago?')) return
    try {
      const res = await paymentService.deletePaymentAccount(id)
      if (res?.success) {
        showToast('Método de pago eliminado', 'success')
        setPaymentAccounts(prev => prev.filter(a => a.id !== id))
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0e27] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Configuración del Sistema</h1>
          <p className="text-zinc-400">Administra los datos de la empresa, tasas multimoneda y métodos de pago de la Web.</p>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-[#1a1f3a] mb-8 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'empresa'
              ? 'border-[#ccff00] text-[#ccff00] bg-[#0f1533]'
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 size={18} />
          Datos de la Empresa
        </button>

        <button
          onClick={() => setActiveTab('multimoneda')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'multimoneda'
              ? 'border-[#ccff00] text-[#ccff00] bg-[#0f1533]'
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coins size={18} />
          Tasas de Cambio (Multimoneda)
        </button>

        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'pagos'
              ? 'border-[#ccff00] text-[#ccff00] bg-[#0f1533]'
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard size={18} />
          Métodos de Pago Web
        </button>
      </div>

      {/* ==================== TAB 1: DATOS DE LA EMPRESA ==================== */}
      {activeTab === 'empresa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-[#1a1f3a] pb-4">
                <Building2 className="text-[#ccff00]" />
                Datos de la Empresa y Facturación
              </h2>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-400">Nombre del Negocio *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          required
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-400">RIF / NIT</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="text"
                          name="legal_id"
                          value={formData.legal_id}
                          onChange={handleChange}
                          className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold text-zinc-400">Dirección</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-4 text-zinc-500" size={18} />
                        <textarea 
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-400">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-400">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#1a1f3a]">
                    <h3 className="text-lg font-bold text-white mb-4">Pie de Página de Comprobantes</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-400">Mensaje de Factura</label>
                      <textarea 
                        name="invoice_footer_message"
                        value={formData.invoice_footer_message}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ej: ¡Gracias por su compra en CourtConnect!"
                        className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg p-4 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-4">
                    {successMsg && (
                      <span className="text-emerald-400 flex items-center gap-1.5 text-sm font-medium animate-pulse">
                        <CheckCircle size={16} />
                        {successMsg}
                      </span>
                    )}
                    <button 
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#ccff00]/90 transition-all shadow-lg shadow-[#ccff00]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Save size={18} />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista Previa */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20 sticky top-8">
              <div className="flex items-center justify-between border-b border-[#1a1f3a] mb-6 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-[#ccff00]" />
                  Vista Previa
                </h2>
                <div className="flex bg-[#0a0e27] rounded-lg p-1 border border-[#1a1f3a]">
                  <button
                    onClick={() => setPreviewFormat('ticket')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      previewFormat === 'ticket' ? 'bg-[#ccff00] text-[#0a0e27]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    TICKET
                  </button>
                  <button
                    onClick={() => setPreviewFormat('a4')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      previewFormat === 'a4' ? 'bg-[#ccff00] text-[#0a0e27]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    A4
                  </button>
                </div>
              </div>

              {previewFormat === 'ticket' ? (
                <div className="bg-white rounded-md p-4 w-[280px] mx-auto text-black font-mono text-[11px] shadow-2xl relative overflow-hidden">
                  <div className="text-center mb-4 mt-2">
                    <h3 className="font-bold text-sm uppercase m-0">{formData.business_name || 'Nombre del Negocio'}</h3>
                    {formData.legal_id && <p className="m-0 mt-1">RIF: {formData.legal_id}</p>}
                    {formData.phone && <p className="m-0">{formData.phone}</p>}
                    {formData.address && <p className="m-0 mt-1">{formData.address}</p>}
                  </div>

                  <div className="border-t border-dashed border-zinc-400 py-2 mb-2">
                    <p className="m-0">Factura: #000001</p>
                    <p className="m-0">Fecha: {new Date().toLocaleDateString()}</p>
                    <p className="m-0">Cliente: Juan Pérez</p>
                  </div>

                  <table className="w-full mb-2">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="text-left font-bold py-1">Cant</th>
                        <th className="text-left font-bold py-1">Desc</th>
                        <th className="text-right font-bold py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1">1</td>
                        <td className="py-1 truncate max-w-[100px]">Reserva Cancha 1</td>
                        <td className="text-right py-1">$20.00</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-right font-bold text-[13px] border-t border-dashed border-zinc-400 pt-2 mb-4">
                    TOTAL: $20.00
                  </div>

                  <div className="text-center text-[10px] text-zinc-600 mb-2">
                    <p>{formData.invoice_footer_message || '¡Gracias por su compra!'}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-md p-6 w-full max-w-[350px] mx-auto text-black font-sans text-[10px] shadow-2xl relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-base m-0 text-blue-900">{formData.business_name || 'Nombre del Negocio'}</h3>
                      {formData.legal_id && <p className="m-0 mt-1 text-zinc-600">RIF: {formData.legal_id}</p>}
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-zinc-300 m-0">FACTURA</h2>
                    </div>
                  </div>
                  <div className="text-center text-[9px] text-zinc-500 mt-8 pt-4 border-t border-zinc-200">
                    <p>{formData.invoice_footer_message || '¡Gracias por su preferencia!'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: MULTIMONEDA Y TASAS ==================== */}
      {activeTab === 'multimoneda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between border-b border-[#1a1f3a] pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="text-[#ccff00]" />
                    Configuración de Tasas de Cambio
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    La moneda base de referencia es el <strong>Dólar Estadounidense (USD)</strong>. Modifica las tasas equivalentes para cobrar en Bolívares o Pesos Colombianos.
                  </p>
                </div>
                <button
                  onClick={fetchRates}
                  disabled={loadingRates}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Recargar tasas"
                >
                  <RefreshCw size={18} className={loadingRates ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingRates ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Tarjeta de Moneda Base USD */}
                  <div className="p-4 rounded-xl border border-white/10 bg-[#0a0e27] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        $
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          Dólar Estadounidense (USD)
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                            Moneda Base
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">1.00 USD = 1.00 USD</div>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-zinc-400">Base Fija</div>
                  </div>

                  {/* Tarjetas de Monedas Secundarias Editables */}
                  {exchangeRates.map((rate, index) => (
                    <div 
                      key={rate.id}
                      className="p-4 rounded-xl border border-[#1a1f3a] bg-[#0a0e27] hover:border-[#ccff00]/30 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] font-black font-mono">
                            {rate.symbol}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {rate.currency_name}
                              <span className="text-xs text-zinc-400 font-mono">({rate.currency_code})</span>
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Última actualización: {rate.updated_at ? new Date(rate.updated_at).toLocaleString() : 'Reciente'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 font-mono">1 USD =</span>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.0001"
                              min="0.0001"
                              value={rate.rate_to_usd}
                              onChange={(e) => handleRateChange(index, e.target.value)}
                              className="w-36 bg-[#0f1533] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#ccff00] text-right"
                            />
                          </div>
                          <span className="text-xs font-bold text-[#ccff00] font-mono">{rate.symbol}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSaveRates}
                      disabled={savingRates}
                      className="px-6 py-3 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#ccff00]/90 transition-all shadow-lg shadow-[#ccff00]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={18} />
                      {savingRates ? 'Guardando Tasas...' : 'Guardar Tasas de Cambio'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Simulador de Conversión Interactivo */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20 sticky top-8 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1a1f3a] pb-3">
                <ArrowRightLeft className="text-[#ccff00]" size={18} />
                Simulador de Conversión
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Monto de Prueba (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="number"
                    value={calcUsdAmount}
                    onChange={(e) => setCalcUsdAmount(e.target.value)}
                    className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-9 pr-3 py-2 text-white font-mono font-bold focus:border-[#ccff00] outline-none"
                    placeholder="Ej. 20"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#0a0e27] border border-white/5 space-y-1">
                  <div className="text-[11px] text-zinc-400 font-mono">Equivalente en Bolívares (VES):</div>
                  <div className="text-xl font-black text-[#ccff00] font-mono">
                    {(() => {
                      const vesRate = exchangeRates.find(r => r.currency_code === 'VES');
                      const rateVal = vesRate ? parseFloat(String(vesRate.rate_to_usd)) : 70.5;
                      const usdVal = parseFloat(calcUsdAmount) || 0;
                      return (usdVal * rateVal).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';
                    })()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0a0e27] border border-white/5 space-y-1">
                  <div className="text-[11px] text-zinc-400 font-mono">Equivalente en Pesos (COP):</div>
                  <div className="text-xl font-black text-cyan-400 font-mono">
                    {(() => {
                      const copRate = exchangeRates.find(r => r.currency_code === 'COP');
                      const rateVal = copRate ? parseFloat(String(copRate.rate_to_usd)) : 4200;
                      const usdVal = parseFloat(calcUsdAmount) || 0;
                      return (usdVal * rateVal).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' $ COP';
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400 flex items-start gap-2">
                <AlertCircle size={16} className="text-[#ccff00] shrink-0 mt-0.5" />
                <span>
                  Estas conversiones son las que verán los usuarios en tiempo real en la página Web al agendar una cancha o adquirir la membresía PRO.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: MÉTODOS DE PAGO WEB ==================== */}
      {activeTab === 'pagos' && (
        <div className="space-y-6">
          <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1f3a] pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="text-[#ccff00]" />
                  Cuentas y Métodos de Cobro en la Web
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Gestiona las cuentas bancarias, Pago Móvil, Zelle o métodos en efectivo que se muestran a los clientes al cancelar reservas y licencias.
                </p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#ccff00]/90 transition-all shadow-md shadow-[#ccff00]/10 flex items-center gap-2 cursor-pointer text-sm"
              >
                <Plus size={18} />
                Agregar Método de Pago
              </button>
            </div>

            {loadingAccounts ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
              </div>
            ) : paymentAccounts.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                No hay métodos de pago registrados. Haz clic en "Agregar Método de Pago" para crear uno.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentAccounts.map((acc) => {
                  const getCurrencyBadge = (curr: string) => {
                    if (curr === 'VES') return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    if (curr === 'COP') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }

                  const getTypeIcon = (type: string) => {
                    if (type === 'pago_movil') return <Smartphone size={16} className="text-amber-400" />
                    if (type === 'zelle') return <DollarSign size={16} className="text-emerald-400" />
                    if (type === 'transfer_cop') return <Landmark size={16} className="text-cyan-400" />
                    return <CreditCard size={16} className="text-purple-400" />
                  }

                  return (
                    <div
                      key={acc.id}
                      className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        acc.is_active 
                          ? 'bg-[#0a0e27] border-[#1a1f3a] hover:border-[#ccff00]/40' 
                          : 'bg-[#0a0e27]/40 border-dashed border-white/10 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full border ${getCurrencyBadge(acc.currency_code)}`}>
                            {acc.currency_code}
                          </span>

                          <button
                            onClick={() => acc.id && handleToggleStatus(acc.id)}
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                              acc.is_active 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                          >
                            {acc.is_active ? 'Activo' : 'Inactivo'}
                          </button>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            {getTypeIcon(acc.type)}
                            {acc.name}
                          </h3>
                          {acc.bank_name && (
                            <p className="text-xs text-zinc-400 font-medium mt-0.5">{acc.bank_name}</p>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-zinc-300 font-sans border-t border-white/5 pt-2">
                          {acc.account_holder && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Titular:</span>
                              <span className="font-medium text-white">{acc.account_holder}</span>
                            </div>
                          )}
                          {acc.id_document && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Doc/RIF:</span>
                              <span className="font-mono text-white">{acc.id_document}</span>
                            </div>
                          )}
                          {acc.phone && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Teléfono:</span>
                              <span className="font-mono text-white">{acc.phone}</span>
                            </div>
                          )}
                          {acc.email && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Correo:</span>
                              <span className="text-white">{acc.email}</span>
                            </div>
                          )}
                          {acc.account_number && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Cuenta:</span>
                              <span className="font-mono text-white text-[11px]">{acc.account_number}</span>
                            </div>
                          )}
                          {acc.instructions && (
                            <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/5">
                              "{acc.instructions}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-[#1a1f3a]">
                        <button
                          onClick={() => handleOpenEditModal(acc)}
                          className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          title="Editar cuenta"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => acc.id && handleDeleteAccount(acc.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Eliminar cuenta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Cuenta de Pago */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
        size="lg"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Nombre Visible *</label>
              <input
                required
                type="text"
                placeholder="Ej. Pago Móvil Banco de Venezuela"
                value={accountFormData.name}
                onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Tipo de Método *</label>
              <select
                value={accountFormData.type}
                onChange={(e) => setAccountFormData({ ...accountFormData, type: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              >
                <option value="pago_movil">📲 Pago Móvil (Venezuela)</option>
                <option value="zelle">💵 Zelle (USD)</option>
                <option value="transfer_cop">🏦 Transferencia / Nequi (Colombia)</option>
                <option value="cash">🏢 Efectivo en Taquilla</option>
                <option value="card">💳 Tarjeta de Débito / Crédito</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Moneda de Cobro *</label>
              <select
                value={accountFormData.currency_code}
                onChange={(e) => setAccountFormData({ ...accountFormData, currency_code: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none font-bold"
              >
                <option value="VES">🇻🇪 VES - Bolívares</option>
                <option value="USD">🇺🇸 USD - Dólares Americanos</option>
                <option value="COP">🇨🇴 COP - Pesos Colombianos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Nombre del Banco</label>
              <input
                type="text"
                placeholder="Ej. Banco de Venezuela / Bancolombia"
                value={accountFormData.bank_name || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, bank_name: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Titular de la Cuenta</label>
              <input
                type="text"
                placeholder="Ej. CourtConnect Sports C.A."
                value={accountFormData.account_holder || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, account_holder: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Cédula / RIF / NIT</label>
              <input
                type="text"
                placeholder="Ej. J-50123456-9"
                value={accountFormData.id_document || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, id_document: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Teléfono (Pago Móvil / Soporte)</label>
              <input
                type="text"
                placeholder="Ej. 0412-3129425"
                value={accountFormData.phone || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Correo Electrónico (Zelle)</label>
              <input
                type="email"
                placeholder="Ej. pagos@courtconnect.com"
                value={accountFormData.email || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, email: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400">Número de Cuenta Bancaria</label>
              <input
                type="text"
                placeholder="Ej. 0102-0123-45-0000000000"
                value={accountFormData.account_number || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, account_number: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#ccff00] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400">Instrucciones para el Cliente</label>
              <textarea
                rows={2}
                placeholder="Ej. Colocar número de reserva en el concepto y guardar el comprobante."
                value={accountFormData.instructions || ''}
                onChange={(e) => setAccountFormData({ ...accountFormData, instructions: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg p-2.5 text-white text-sm focus:border-[#ccff00] outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2 pt-2">
              <input
                type="checkbox"
                id="is_active_toggle"
                checked={accountFormData.is_active}
                onChange={(e) => setAccountFormData({ ...accountFormData, is_active: e.target.checked })}
                className="w-4 h-4 accent-[#ccff00]"
              />
              <label htmlFor="is_active_toggle" className="text-sm font-semibold text-white cursor-pointer">
                Método de pago activo (visible en la página web)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1f3a]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 transition-all text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#ccff00]/90 transition-all text-sm shadow-md shadow-[#ccff00]/10 cursor-pointer"
            >
              {editingAccount ? 'Actualizar Método' : 'Guardar Método'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
