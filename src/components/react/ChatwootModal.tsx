import { useEffect, useState } from 'react'
import { API_BASE_URL, CHATWOOT_URL, CHATWOOT_BASE_URL } from '@config/api'

interface ChatwootModalProps {
  isOpen: boolean
  onClose: () => void
  username?: string
  phone?: string
}

export default function ChatwootModal({ isOpen, onClose, username, phone }: ChatwootModalProps) {
  const [chatwootUrl, setChatwootUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [useIframe, setUseIframe] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchChatwootUrl()
    }
  }, [isOpen, phone]) // También ejecutar cuando cambie el teléfono

  const fetchChatwootUrl = async () => {
    try {
      // Si tenemos teléfono, buscar contacto directamente en Chatwoot
      if (phone && phone.trim()) {
        // Limpiar el teléfono (remover espacios, guiones, etc.)
        const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '')
        const searchUrl = `${CHATWOOT_BASE_URL}/contacts?page=1&search=${cleanPhone}`
        console.log('🔍 Chatwoot: Buscando contacto con teléfono:', {
          originalPhone: phone,
          cleanPhone: cleanPhone,
          searchUrl: searchUrl,
          baseUrl: CHATWOOT_BASE_URL
        })
        setChatwootUrl(searchUrl)
      } else {
        // URL base del dashboard si no hay teléfono
        console.log('📋 Chatwoot: Abriendo dashboard general (sin teléfono)')
        setChatwootUrl(CHATWOOT_URL)
      }
    } catch (error) {
      console.error('Error fetching Chatwoot URL:', error)
      // Fallback URL from config
      setChatwootUrl(CHATWOOT_URL)
    } finally {
      setLoading(false)
    }
  }

  const openInNewTab = () => {
    if (chatwootUrl) {
      window.open(chatwootUrl, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl w-full h-full max-w-7xl max-h-[90vh] mx-4 my-4 shadow-xl border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                💬 Chatwoot Dashboard
              </h3>
              {username && phone ? (
                <p className="text-sm text-gray-400">
                  🔍 Buscando contacto: @{username} ({phone})
                </p>
              ) : username ? (
                <p className="text-sm text-gray-400">
                  Contactar: @{username}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  Dashboard general
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle View Mode */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setUseIframe(!useIframe)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                {useIframe ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Abrir en nueva pestaña
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Vista integrada
                  </>
                )}
              </button>
              
              {useIframe && (
                <button
                  onClick={openInNewTab}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  🔗 Nueva pestaña
                </button>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="text-gray-400">Cargando Chatwoot...</span>
              </div>
            </div>
          ) : useIframe ? (
            <iframe
              src={chatwootUrl}
              className="w-full h-full rounded-b-xl"
              title="Chatwoot Dashboard"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <h3 className="text-xl font-bold text-gray-200 mb-2">
                  Abrir Chatwoot en nueva pestaña
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Para una mejor experiencia, te recomendamos abrir Chatwoot en una nueva pestaña del navegador.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir Chatwoot Dashboard
                </button>
                
                <button
                  onClick={() => setUseIframe(true)}
                  className="block mx-auto px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  O mostrar aquí dentro
                </button>
              </div>
              
              {username && (
                <div className="mt-8 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 max-w-sm">
                  <h4 className="font-medium text-white mb-2">👤 Información del contacto</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><span className="text-gray-400">Usuario TikTok:</span> @{username}</p>
                    {phone && (
                      <p><span className="text-gray-400">Teléfono:</span> {phone}</p>
                    )}
                    {phone && (
                      <p className="text-xs text-green-400 mt-2">
                        🔍 Chatwoot está mostrando los resultados para este número
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}