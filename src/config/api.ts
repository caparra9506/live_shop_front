// Detectar automáticamente el entorno
const isProduction = typeof window !== 'undefined' && window.location.hostname === 'comprepues.com.co';

export const API_BASE_URL = isProduction ? 'https://comprepues.com.co' : 'http://localhost:3002';

// Chatwoot URL configurable
export const CHATWOOT_URL = import.meta.env.PUBLIC_CHATWOOT_URL || 'https://n8n-chatwoot.shblkb.easypanel.host/app/accounts/1/dashboard';

// Chatwoot base URL para búsquedas
export const CHATWOOT_BASE_URL = import.meta.env.PUBLIC_CHATWOOT_BASE_URL || 'https://n8n-chatwoot.shblkb.easypanel.host/app/accounts/1';