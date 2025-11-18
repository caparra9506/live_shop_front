// components/react/admin/comments/TiktokLive.tsx
import { useEffect, useState, useRef } from 'react'
import { Button } from '../../../ui/button'
import { Card, CardContent } from '../../../ui/card'
import { Input } from '../../../ui/input'
import { API_BASE_URL } from '@config/api'
import ChatwootModal from '../../ChatwootModal'

interface Comment {
  id: number
  username: string
  comment: string
  createdAt: string
  user: {
    name: string
    email: string
    phone: string
  } | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface CommentsResponse {
  data: Comment[]
  pagination: PaginationInfo
}

interface ChatwootModal {
  isOpen: boolean
  phone: string
  username: string
}

export default function TikTokLive() {
  const [comments, setComments] = useState<Comment[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'comment' | 'username'>('all')
  const [autoRefreshPaused, setAutoRefreshPaused] = useState(false)
  const [chatwootModal, setChatwootModal] = useState<ChatwootModal>({
    isOpen: false,
    phone: '',
    username: ''
  })
  const commentsContainerRef = useRef<HTMLDivElement>(null)
  const previousCommentsLength = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const currentPaginationRef = useRef(pagination)
  const currentSearchRef = useRef({ searchTerm, searchType })
  const currentAutoRefreshPausedRef = useRef(autoRefreshPaused)

  const openChatwootModal = (phone: string, username: string) => {
    setChatwootModal({
      isOpen: true,
      phone,
      username
    })
  }

  const closeChatwootModal = () => {
    setChatwootModal({
      isOpen: false,
      phone: '',
      username: ''
    })
  }

  const isNearBottom = () => {
    if (!commentsContainerRef.current) return false
    const container = commentsContainerRef.current
    const threshold = 150 // píxeles desde el fondo
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }

  const scrollToBottom = () => {
    if (commentsContainerRef.current && isNearBottom()) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight
    }
  }

  const fetchComments = async (page: number = 1, isAutoRefresh: boolean = false, customLimit?: number, customSearchTerm?: string, customSearchType?: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No hay token de autenticación")
        return
      }

      // Usar los valores actuales o los pasados como parámetro
      const currentSearch = customSearchTerm !== undefined ? customSearchTerm : searchTerm
      const currentSearchTypeValue = customSearchType !== undefined ? customSearchType : searchType
      
      // Limpiar el término de búsqueda - remover @ si existe al inicio
      const cleanSearchTerm = currentSearch.startsWith('@') ? currentSearch.slice(1) : currentSearch

      const params = new URLSearchParams({
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        ...(cleanSearchTerm && { search: cleanSearchTerm }),
        ...(currentSearchTypeValue !== 'all' && { searchType: currentSearchTypeValue })
      })

      console.log('🔍 Buscando:', { 
        searchTerm, 
        cleanSearchTerm, 
        searchType, 
        page, 
        limit: customLimit || pagination.limit,
        params: params.toString(),
        isAutoRefresh,
        url: `${API_BASE_URL}/api/tiktok-comments/comments?${params}`
      })

      // Agregar timestamp para evitar caché en página 1
      if (page === 1 && !isAutoRefresh) {
        params.append('_t', Date.now().toString())
      }

      const url = `${API_BASE_URL}/api/tiktok-comments/comments?${params}`
      console.log('🌐 Realizando petición a:', url)
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })

      console.log('📡 Respuesta HTTP:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Error en petición:', errorText)
        throw new Error(`Error fetching comments: ${res.status} ${errorText}`)
      }

      const data = await res.json()
      console.log('📄 Datos recibidos completos:', data)
      
      console.log('📥 Respuesta del backend:', { 
        isArray: Array.isArray(data),
        hasData: data && 'data' in data,
        totalResults: Array.isArray(data) ? data.length : data?.pagination?.total || 0,
        page: page,
        commentsCount: Array.isArray(data) ? data.length : data?.data?.length || 0,
        firstCommentDate: Array.isArray(data) ? data[0]?.createdAt : data?.data?.[0]?.createdAt,
        lastCommentDate: Array.isArray(data) ? data[data.length-1]?.createdAt : data?.data?.[data?.data?.length-1]?.createdAt,
        pagination: data?.pagination
      })
      
      // Manejar respuesta con paginación o array directo
      if (Array.isArray(data)) {
        setComments(data)
        setPagination({
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        })
      } else if (data && typeof data === 'object' && 'data' in data) {
        const response: CommentsResponse = data
        const currentIds = comments.map(comment => comment.id)
        const newComments = response.data.filter((comment: Comment) => !currentIds.includes(comment.id))
        const hasNewComments = newComments.length > 0
        
        setComments(response.data)
        setPagination(response.pagination)
        
        if (hasNewComments && isLive && !isAutoRefresh) {
          setTimeout(scrollToBottom, 100)
        }
      }
      
      previousCommentsLength.current = comments.length
    } catch (err) {
      console.error('❌ Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const startListening = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No hay token de autenticación")
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/tiktok-comments/store`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Error al iniciar la escucha de comentarios')
      }

      setIsLive(true)
      fetchComments(1)
      
    } catch (err) {
      console.error('❌ Error al iniciar live:', err)
      setIsLive(false)
    }
  }

  const stopListening = () => {
    setIsLive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const toggleLiveComments = () => {
    if (!isLive) {
      startListening()
    } else {
      stopListening()
    }
  }

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    currentPaginationRef.current = pagination
  }, [pagination])

  useEffect(() => {
    currentSearchRef.current = { searchTerm, searchType }
  }, [searchTerm, searchType])

  useEffect(() => {
    currentAutoRefreshPausedRef.current = autoRefreshPaused
  }, [autoRefreshPaused])

  // Cargar comentarios iniciales al montar el componente
  useEffect(() => {
    console.log('🚀 Componente montado, cargando comentarios página 1...')
    fetchComments(1, false, 100, '', 'all')
    const interval = setInterval(() => {
      const currentPagination = currentPaginationRef.current
      const currentSearch = currentSearchRef.current
      
      // Solo auto-refresh si NO hay búsquedas activas Y no está pausado manualmente
      const hasActiveSearch = currentSearch.searchTerm.trim() !== ''
      const isOnFirstPage = currentPagination.page === 1
      const hasCustomLimit = currentPagination.limit !== 100
      const isPausedManually = currentAutoRefreshPausedRef.current
      
      if (!hasActiveSearch && !isPausedManually) {
        console.log('🔄 Auto-refresh: Sin búsquedas, actualizando...')
        // No cambiar el estado de pausa aquí para mantener pausa manual
        
        // Si está en página 1, actualiza normalmente
        // Si está en otras páginas o tiene límite personalizado, solo actualiza si está en página 1
        if (isOnFirstPage) {
          fetchComments(1, true, currentPagination.limit, '', 'all')
        } else {
          console.log('⏸️ Auto-refresh pausado: Navegando en páginas históricas')
        }
      } else if (hasActiveSearch) {
        console.log('⏸️ Auto-refresh pausado: Búsqueda activa', {
          searchTerm: currentSearch.searchTerm,
          page: currentPagination.page,
          limit: currentPagination.limit
        })
      } else if (isPausedManually) {
        console.log('⏸️ Auto-refresh pausado: Pausado manualmente por usuario')
      }
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComments(1)
      // Scroll al primer resultado cuando se realiza una búsqueda
      const cleanTerm = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm
      if (cleanTerm) {
        setTimeout(() => {
          scrollToFirstResult()
        }, 300)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchType])

  const scrollToFirstResult = () => {
    if (commentsContainerRef.current && searchTerm) {
      const firstHighlight = commentsContainerRef.current.querySelector('[data-highlight="true"]')
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchComments(newPage)
    // Scroll al primer resultado después de cambiar página en búsquedas
    if (searchTerm) {
      setTimeout(() => {
        scrollToFirstResult()
      }, 300)
    }
  }

  const handlePageSizeChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
    fetchComments(1, false, newLimit)
  }

  const goToLastPage = () => {
    if (pagination.totalPages > 0) {
      fetchComments(pagination.totalPages)
    }
  }

  const goToFirstPage = () => {
    fetchComments(1)
  }

  const refreshNow = () => {
    const currentPagination = currentPaginationRef.current
    const currentSearch = currentSearchRef.current
    fetchComments(
      currentPagination.page,
      false,
      currentPagination.limit,
      currentSearch.searchTerm,
      currentSearch.searchType
    )
  }

  const clearFiltersAndRefresh = () => {
    setSearchTerm('')
    setSearchType('all')
    setPagination(prev => ({ ...prev, page: 1, limit: 100 }))
    setTimeout(() => {
      fetchComments(1, false, 100, '', 'all')
    }, 100)
  }

  const goToLatestComments = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setTimeout(() => {
      fetchComments(1, false, pagination.limit, searchTerm, searchType)
    }, 100)
  }

  // Los comentarios ya están filtrados por el backend
  const displayComments = comments
  
  // Término de búsqueda limpio para highlight
  const cleanSearchTerm = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm

  // Función para obtener el color de avatar basado en el nombre de usuario
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-slate-500', 'bg-gray-600', 'bg-zinc-500', 
      'bg-stone-500', 'bg-neutral-600', 'bg-gray-500',
      'bg-slate-600', 'bg-zinc-600'
    ]
    
    // Uso la primera letra del nombre para seleccionar un color
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
  }
  
  // Función para obtener la inicial del nombre de usuario
  const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  // Función para obtener tiempo transcurrido desde el comentario
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const commentDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'ahora'
    if (diffInMinutes < 60) return `hace ${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `hace ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays}d`
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.2-4.64V6.69a7.72 7.72 0 006.59 0z"/>
              </svg>
              {isLive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                TikTok Live Monitor
              </h1>
              <p className="text-blue-100/80 text-sm">
                {isLive ? `🔴 En vivo - ${displayComments.length} comentarios` : 'Desconectado'}
              </p>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {autoRefreshPaused && (
              <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-500/30">
                ⏸️ Pausado
              </span>
            )}
            
            <button
              onClick={() => setAutoRefreshPaused(!autoRefreshPaused)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefreshPaused 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {autoRefreshPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
            </button>
            
            <button
              onClick={() => fetchComments(1, false, pagination.limit, '', 'all')}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Actualizar
            </button>
            
            <button
              onClick={toggleLiveComments}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isLive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLive ? 'Detener Live' : 'Iniciar Live'}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de tipo de búsqueda */}
            <div className="w-full sm:w-48">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'all' | 'comment' | 'username')}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="all">Todo</option>
                <option value="comment">Solo comentarios</option>
                <option value="username">Solo usuarios (@)</option>
              </select>
            </div>
            
            {/* Campo de búsqueda */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchType === 'username' ? 'Buscar @usuario...' : searchType === 'comment' ? 'Buscar en comentarios...' : 'Buscar comentarios o usuarios...'}
                className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">{pagination.total}</span> resultados encontrados
                {pagination.totalPages > 1 && (
                  <span className="text-gray-500">
                    (Página {pagination.page} de {pagination.totalPages})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Por página:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Container */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={commentsContainerRef}
          className="h-[calc(100vh-200px)] overflow-y-auto bg-gray-900"
        >
          {displayComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              {comments.length === 0 && !loading ? (
                <div className="text-center space-y-4">
                  <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">No hay comentarios aún</h3>
                    <p className="text-gray-400">
                      Presiona "Iniciar Live" para comenzar a escuchar comentarios
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Sin resultados</h3>
                    <p className="text-gray-400">
                      No se encontraron comentarios con esos términos de búsqueda
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {displayComments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`group relative flex items-start p-3 rounded-lg transition-all duration-150 hover:bg-gray-800/50 ${
                    comment.user 
                      ? 'bg-green-900/5 border-l-2 border-green-600/30' 
                      : 'hover:bg-gray-800/30'
                  } ${
                    cleanSearchTerm && (
                      comment.comment.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
                      comment.username.toLowerCase().includes(cleanSearchTerm.toLowerCase())
                    ) ? 'ring-1 ring-yellow-400/20 bg-yellow-900/5' : ''
                  }`}
                  data-highlight={cleanSearchTerm && (
                    comment.comment.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
                    comment.username.toLowerCase().includes(cleanSearchTerm.toLowerCase())
                  ) ? 'true' : undefined}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3 relative">
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(comment.username)} flex items-center justify-center text-white text-sm font-medium select-none shadow-sm`}>
                      {getInitial(comment.username)}
                    </div>
                    {comment.user && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3 h-3 border-2 border-gray-900 flex items-center justify-center">
                        <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${comment.user ? 'text-green-400' : 'text-gray-200'}`}>
                        @{cleanSearchTerm && comment.username.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ? (
                          highlightText(comment.username, cleanSearchTerm)
                        ) : (
                          comment.username
                        )}
                      </span>
                      {comment.user && (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                          ✓
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {getTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-100 text-sm leading-relaxed">
                      {cleanSearchTerm ? (
                        highlightText(comment.comment, cleanSearchTerm)
                      ) : (
                        comment.comment
                      )}
                    </p>
                  </div>

                  {/* User Actions */}
                  {comment.user && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openChatwootModal(comment.user!.phone, comment.username)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Abrir Chatwoot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Paginación - Siempre visible cuando hay comentarios */}
        {!loading && displayComments.length > 0 && (
          <div className="bg-gray-900/50 border-t border-gray-700/50 p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
              <div className="text-gray-400">
                {pagination.total} comentarios · Página {pagination.page} de {pagination.totalPages}
              </div>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>
                  
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded font-medium">
                    {pagination.page}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
              
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="text-sm bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-white focus:ring-1 focus:ring-purple-500/50"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Chatwoot Modal */}
      <ChatwootModal
        isOpen={chatwootModal.isOpen}
        onClose={closeChatwootModal}
        username={chatwootModal.username}
        phone={chatwootModal.phone}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-gray-700">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          <span className="text-sm">Actualizando...</span>
        </div>
      )}
    </div>
  )
}

// Función para resaltar el texto buscado
function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-yellow-400 text-black font-bold px-1 rounded shadow-lg animate-pulse">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}