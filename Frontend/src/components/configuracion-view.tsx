'use client'

import React, { useState, useEffect } from 'react'
import { Save, Building2, Phone, Mail, MapPin, FileText, CheckCircle } from 'lucide-react'
import { settingsService } from '@/services/settingsService'

export default function ConfiguracionView() {
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

  useEffect(() => {
    fetchSettings()
  }, [])

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
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      alert(res.error || 'Error al guardar la configuración')
    }
    setSaving(false)
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0e27] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-zinc-400">Administra los datos de tu empresa y el formato de tus facturas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-[#1a1f3a] pb-4">
              <Building2 className="text-[#ccff00]" />
              Datos de la Empresa
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
                  <h3 className="text-lg font-bold text-white mb-4">Formato de Factura</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-400">Mensaje de Pie de Página</label>
                    <textarea 
                      name="invoice_footer_message"
                      value={formData.invoice_footer_message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ej: ¡Gracias por su preferencia! No se aceptan devoluciones después de 15 días."
                      className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg p-4 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors resize-none"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Este mensaje aparecerá centrado en la parte inferior de todas tus facturas impresas.</p>
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
                    className="px-6 py-3 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#ccff00]/90 transition-all shadow-lg shadow-[#ccff00]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Columna Derecha: Vista Previa Ticket */}
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
                {/* Zigzag top/bottom to simulate receipt paper */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#0f1533]" style={{ maskImage: 'radial-gradient(circle at 4px 0, transparent 4px, black 5px)', maskSize: '8px 8px', maskRepeat: 'repeat-x' }}></div>
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0f1533]" style={{ maskImage: 'radial-gradient(circle at 4px 8px, transparent 4px, black 5px)', maskSize: '8px 8px', maskRepeat: 'repeat-x' }}></div>

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
                      <td className="py-1">2</td>
                      <td className="py-1 truncate max-w-[100px]">Agua Mineral</td>
                      <td className="text-right py-1">$4.00</td>
                    </tr>
                    <tr>
                      <td className="py-1">1</td>
                      <td className="py-1 truncate max-w-[100px]">Reserva</td>
                      <td className="text-right py-1">$20.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-right font-bold text-[13px] border-t border-dashed border-zinc-400 pt-2 mb-4">
                  TOTAL: $24.00
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
                    {formData.phone && <p className="m-0 text-zinc-600">Tel: {formData.phone}</p>}
                    {formData.address && <p className="m-0 text-zinc-600 max-w-[150px]">{formData.address}</p>}
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-zinc-300 m-0">FACTURA</h2>
                    <p className="m-0 font-bold mt-1 text-zinc-800">#000001</p>
                    <p className="m-0 text-zinc-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 p-2 rounded mb-4 border border-zinc-200">
                  <p className="m-0 font-bold text-zinc-800">Facturar a:</p>
                  <p className="m-0 text-zinc-600">Juan Pérez</p>
                </div>

                <table className="w-full mb-4 border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="text-left font-bold p-1">Cant</th>
                      <th className="text-left font-bold p-1">Descripción</th>
                      <th className="text-right font-bold p-1">Precio</th>
                      <th className="text-right font-bold p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-200">
                      <td className="p-1">2</td>
                      <td className="p-1">Agua Mineral</td>
                      <td className="text-right p-1">$2.00</td>
                      <td className="text-right p-1 font-medium">$4.00</td>
                    </tr>
                    <tr className="border-b border-zinc-200">
                      <td className="p-1">1</td>
                      <td className="p-1">Reserva Cancha 1</td>
                      <td className="text-right p-1">$20.00</td>
                      <td className="text-right p-1 font-medium">$20.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end mb-6">
                  <div className="w-[120px]">
                    <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-1">
                      <span>TOTAL:</span>
                      <span>$24.00</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[9px] text-zinc-500 mt-8 pt-4 border-t border-zinc-200">
                  <p>{formData.invoice_footer_message || '¡Gracias por su compra!'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
