import { useState } from 'react';
import type { TimeRemaining } from '../../../types/cart';

interface CartTimerProps {
  timeRemaining: TimeRemaining | null;
  onExtendTime: (days: number) => Promise<void>;
  onProcessNow: () => Promise<void>;
}

export default function CartTimer({ timeRemaining, onExtendTime, onProcessNow }: CartTimerProps) {
  const [extending, setExtending] = useState(false);

  if (!timeRemaining) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="animate-pulse">Calculando tiempo restante...</div>
      </div>
    );
  }

  if (timeRemaining.expired) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-2">⏰ ¡Tiempo Agotado!</h3>
        <p className="text-red-700 mb-4">
          Tu baúl ha expirado. Los productos serán procesados automáticamente o liberados según la disponibilidad.
        </p>
        <button
          onClick={onProcessNow}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Procesar Ahora
        </button>
      </div>
    );
  }

  const getTimerColor = () => {
    const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
    
    if (totalHours <= 4) return 'text-red-600 bg-red-50 border-red-200'; // Menos de 4 horas
    if (totalHours <= 24) return 'text-orange-600 bg-orange-50 border-orange-200'; // Menos de 1 día
    return 'text-green-600 bg-green-50 border-green-200'; // Más de 1 día
  };

  const getUrgencyMessage = () => {
    const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
    
    if (totalHours <= 1) return '🚨 ¡Última hora!';
    if (totalHours <= 4) return '⚠️ ¡Menos de 4 horas restantes!';
    if (totalHours <= 24) return '⏰ Menos de 1 día restante';
    return '✅ Tiempo suficiente';
  };

  const handleExtendTime = async (hours: number) => {
    setExtending(true);
    try {
      await onExtendTime(hours);
    } finally {
      setExtending(false);
    }
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${getTimerColor()}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold mb-1">{getUrgencyMessage()}</h3>
          <div className="text-2xl font-mono font-bold">
            {timeRemaining.days > 0 && (
              <span>{timeRemaining.days}d </span>
            )}
            {String(timeRemaining.hours).padStart(2, '0')}:
            {String(timeRemaining.minutes).padStart(2, '0')}:
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-1 opacity-80">
  Se enviará el link de pago cuando expire
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleExtendTime(1)}
            disabled={extending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {extending ? 'Extendiendo...' : '+1 día'}
          </button>
          
          <button
            onClick={onProcessNow}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Pagar Ahora
          </button>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${Math.max(0, Math.min(100, ((timeRemaining.days * 24 + timeRemaining.hours) / (2 * 24)) * 100))}%`,
              backgroundColor: (timeRemaining.days * 24 + timeRemaining.hours) <= 4 ? '#dc2626' : 
                             (timeRemaining.days * 24 + timeRemaining.hours) <= 24 ? '#ea580c' : '#16a34a'
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 opacity-70">
          <span>Expirado</span>
          <span>2 días</span>
        </div>
      </div>
    </div>
  );
}