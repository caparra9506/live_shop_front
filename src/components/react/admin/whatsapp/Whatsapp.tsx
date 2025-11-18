import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, CHATWOOT_URL } from '@config/api';

interface ChatwootConfig {
  chatwootUrl: string;
}

export default function Whatsapp() {
  const [config, setConfig] = useState<ChatwootConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatwootConfig();
  }, []);

  const fetchChatwootConfig = async () => {
    try {
      // Usar directamente la constante del .env
      setConfig({
        chatwootUrl: CHATWOOT_URL
      });
    } catch (error) {
      console.error("❌ Error obteniendo configuración de Chatwoot:", error);
      setError("Error al cargar la configuración de Chatwoot");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (config?.chatwootUrl) {
      window.open(config.chatwootUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando Chatwoot...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchChatwootConfig}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center">
          {/* Chatwoot Icon */}
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">💬 Chatwoot Dashboard</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-semibold">Centro de Conversaciones</span>
            </div>
            <p className="text-blue-700 text-sm">Gestiona todas tus conversaciones con clientes desde Chatwoot</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-left p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Conversaciones Unificadas</h3>
                <p className="text-gray-600 text-sm">Gestiona WhatsApp, email y chat web desde un solo lugar</p>
              </div>
            </div>

            <div className="flex items-center text-left p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Respuestas Inteligentes</h3>
                <p className="text-gray-600 text-sm">Automatiza respuestas y mejora el tiempo de atención</p>
              </div>
            </div>

            <div className="flex items-center text-left p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Analytics y Reportes</h3>
                <p className="text-gray-600 text-sm">Métricas detalladas de conversaciones y satisfacción</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleRedirect}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              💬 Abrir Chatwoot Dashboard
            </div>
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Se abrirá en una nueva ventana del navegador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}