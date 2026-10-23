import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, AlertCircle, Scale, ChevronRight, CheckCircle2 } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c0ff00]/10 border border-[#c0ff00]/30 flex items-center justify-center text-[#c0ff00]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-white tracking-wide uppercase">
                Marco Legal y Condiciones
              </h2>
              <p className="text-xs text-zinc-400">SportSpaces OS & CourtConnect</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-zinc-900/40 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#c0ff00] text-[#c0ff00]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Términos de Servicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#c0ff00] text-[#c0ff00]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacidad y Datos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-[#c0ff00] text-[#c0ff00]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Exoneración y Responsabilidad</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm leading-relaxed text-zinc-300">
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="bg-[#c0ff00]/5 border border-[#c0ff00]/20 rounded-xl p-4 text-xs text-zinc-300">
                <span className="font-bold text-[#c0ff00]">Última actualización:</span> Septiembre 2026. Al reservar una cancha o crear una cuenta en esta plataforma, aceptas vincularte formalmente a estos Términos y Condiciones.
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">1.</span> Rol de la Plataforma
                </h3>
                <p>
                  CourtConnect (parte del ecosistema de software SportSpaces OS) actúa como un sistema tecnológico intermediario para la difusión, consulta de disponibilidad y reserva de espacios deportivos. La titularidad, mantenimiento físico, operatividad de las instalaciones y prestación presencial del servicio deportivo corresponden exclusivamente a cada complejo o club deportivo aliado.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">2.</span> Reservas, Pagos y Validación de Fondos
                </h3>
                <p>
                  Toda reserva queda en estado pre-confirmado hasta que el club deportivo o el sistema automatizado valide la efectividad del método de pago consignado (Pago Móvil, Zelle, Transferencia en COP o Pago en Taquilla).
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
                  <li>El usuario es responsable de registrar el número de referencia y comprobante bancario auténtico.</li>
                  <li>El intento de registro de transacciones falsas, duplicadas o fraudulentas conllevará la anulación inmediata de la reserva y la inhabilitación permanente de la cuenta de usuario.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">3.</span> Política de Cancelaciones y Reembolsos
                </h3>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#c0ff00] shrink-0 mt-0.5" />
                    <p className="text-xs">
                      <strong className="text-white">Cancelación con más de 24 horas de antelación:</strong> Reembolso del 100% del monto pagado o crédito a favor para una futura reserva en el mismo complejo.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs">
                      <strong className="text-white">Cancelación con menos de 24 horas o Inasistencia (No-Show):</strong> No aplicará reembolso en dinero, ya que el espacio ha sido bloqueado impidiendo su alquiler a otros usuarios.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs">
                      <strong className="text-white">Condiciones Climáticas y Fuerza Mayor:</strong> En canchas al aire libre afectadas por lluvia torrencial o fallas eléctricas imprevistas, se reprogramará el horario sin penalidad.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">4.</span> Normas de Convivencia y Uso de Instalaciones
                </h3>
                <p>
                  Los usuarios deben respetar las normativas de indumentaria (calzado apto para pádel, arcilla o duela), horarios de inicio y fin estrictos, y mantener un comportamiento cívico y deportivo con el personal y demás deportistas.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-[#c0ff00]/5 border border-[#c0ff00]/20 rounded-xl p-4 text-xs text-zinc-300">
                <span className="font-bold text-[#c0ff00]">Compromiso de Privacidad:</span> Tu información personal se encuentra protegida bajo principios de confidencialidad y el estándar de Habeas Data (Art. 28 de la Constitución de la República Bolivariana de Venezuela y regulaciones internacionales).
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">1.</span> Datos Recopilados
                </h3>
                <p>
                  Recopilamos únicamente los datos necesarios para brindar el servicio: nombres y apellidos, número de teléfono (para confirmaciones vía WhatsApp o llamada), dirección de correo electrónico, documento de identidad (para control de facturación y taquilla) y referencias de pago bancario.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">2.</span> Finalidad y Destino de los Datos
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
                  <li>Gestionar la disponibilidad y control de aforo de las canchas en tiempo real.</li>
                  <li>Enviar confirmaciones de reserva, recordatorios y comprobantes de pago.</li>
                  <li>Proporcionar al complejo deportivo la lista oficial de jugadores acreditados en el turno.</li>
                  <li>Garantizar la seguridad de la plataforma y prevenir suplantaciones de identidad.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">3.</span> Seguridad y No Comercialización
                </h3>
                <p>
                  <strong className="text-white">Bajo ninguna circunstancia vendemos, alquilamos ni transferimos</strong> tus datos a terceros con fines de publicidad o telemarketing. Las contraseñas se almacenan mediante algoritmos de cifrado unidireccional (bcrypt) y las conexiones viajan bajo certificados cifrados SSL/TLS.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">4.</span> Derechos del Usuario (Acceso, Modificación y Supresión)
                </h3>
                <p>
                  El titular de la cuenta puede solicitar la corrección, actualización o eliminación definitiva de sus datos personales de nuestros servidores escribiendo al canal oficial de soporte técnico o desde su perfil de usuario.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-200">
                <span className="font-bold text-amber-400">Aviso Legal Importante:</span> La práctica de disciplinas deportivas (pádel, fútbol, tenis, baloncesto, etc.) implica exigencia física y riesgos intrínsecos a la actividad.
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">1.</span> Exoneración de Responsabilidad Médica y Física
                </h3>
                <p>
                  El usuario manifiesta encontrarse en óptimas condiciones físicas y de salud para participar en actividades deportivas. CourtConnect, SportSpaces OS, sus desarrolladores y operadores tecnológicos quedan expresamente exonerados de cualquier responsabilidad civil, médica, penal o indemnizatoria derivada de:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
                  <li>Lesiones musculares, fracturas, esguinces, golpes o problemas cardiovasculares ocurridos antes, durante o después de la práctica deportiva en las canchas.</li>
                  <li>Incidentes o accidentes causados por imprudencia de otros jugadores o por situaciones fortuitas en el recinto deportivo.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">2.</span> Custodia de Objetos y Pertenencias Personales
                </h3>
                <p>
                  La plataforma no asume responsabilidad alguna por el extravío, hurto o deterioro de indumentaria, bolsos, palas, raquetas, dispositivos móviles o cualquier otro objeto de valor dentro de las instalaciones o estacionamientos de los clubes asociados.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#c0ff00]">3.</span> Propiedad Intelectual
                </h3>
                <p>
                  El software, código fuente, logotipos y arquitectura de SportSpaces OS son propiedad exclusiva de sus creadores y están protegidos por la Ley sobre el Derecho de Autor. Las imágenes y fotografías utilizadas son de uso libre (Unsplash License) o provistas con fines de exhibición deportiva.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-mono">
            SportSpaces OS · CourtConnect v1.0
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#c0ff00] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d4ff33] active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
}
