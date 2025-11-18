import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

interface ElectronicBillingConfig {
  enableElectronicBilling: boolean;
  factusClientId: string;
  factusClientSecret: string;
  factusUsername: string;
  factusPassword: string;
  factusApiUrl: string;
  factusTestMode: boolean;
  factusNumberingRangeId?: number;
}

const ElectronicBillingConfig: React.FC = () => {
  const [config, setConfig] = useState<ElectronicBillingConfig>({
    enableElectronicBilling: false,
    factusClientId: '',
    factusClientSecret: '',
    factusUsername: '',
    factusPassword: '',
    factusApiUrl: 'https://api-sandbox.factus.com.co',
    factusTestMode: true,
    factusNumberingRangeId: undefined,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/config/store-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo configuración');
      }

      const data = await response.json();
      
      if (data) {
        setConfig({
          enableElectronicBilling: data.enableElectronicBilling || false,
          factusClientId: data.factusClientId || '',
          factusClientSecret: data.factusClientSecret || '',
          factusUsername: data.factusUsername || '',
          factusPassword: data.factusPassword || '',
          factusApiUrl: data.factusApiUrl || 'https://api-sandbox.factus.com.co',
          factusTestMode: data.factusTestMode !== false, // Default true
          factusNumberingRangeId: data.factusNumberingRangeId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/config/store-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Error guardando configuración');
      }

      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/electronic-billing/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Error probando conexión');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Conexión exitosa con FACTUS');
      } else {
        throw new Error(data.message || 'Error en la conexión');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error probando conexión');
    } finally {
      setSaving(false);
    }
  };

  const loadSandboxConfig = () => {
    setConfig({
      ...config,
      factusClientId: '9e4ec14c-81fd-4b7d-86e7-ae9fdce3871e',
      factusClientSecret: 'wPc5Fjv8iFmzgIguJVsi6MNt03xiX6zlXcFbFUKz',
      factusUsername: 'sandbox@factus.com.co',
      factusPassword: 'sandbox2024%',
      factusApiUrl: 'https://api-sandbox.factus.com.co',
      factusTestMode: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Facturación Electrónica</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Habilitar/Deshabilitar */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableElectronicBilling"
              checked={config.enableElectronicBilling}
              onChange={(e) => setConfig({ ...config, enableElectronicBilling: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableElectronicBilling" className="text-lg font-medium text-gray-900">
              Habilitar Facturación Electrónica
            </label>
          </div>

          {config.enableElectronicBilling && (
            <>
              {/* Configuración rápida para sandbox */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Configuración rápida - Sandbox</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Carga automáticamente las credenciales del ambiente de pruebas de FACTUS
                </p>
                <Button
                  onClick={loadSandboxConfig}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300"
                >
                  📋 Cargar configuración Sandbox
                </Button>
              </div>

              {/* Credenciales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <Input
                    type="text"
                    value={config.factusClientId}
                    onChange={(e) => setConfig({ ...config, factusClientId: e.target.value })}
                    placeholder="Client ID de FACTUS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret
                  </label>
                  <Input
                    type="password"
                    value={config.factusClientSecret}
                    onChange={(e) => setConfig({ ...config, factusClientSecret: e.target.value })}
                    placeholder="Client Secret de FACTUS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={config.factusUsername}
                    onChange={(e) => setConfig({ ...config, factusUsername: e.target.value })}
                    placeholder="Usuario de FACTUS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={config.factusPassword}
                    onChange={(e) => setConfig({ ...config, factusPassword: e.target.value })}
                    placeholder="Contraseña de FACTUS"
                  />
                </div>
              </div>

              {/* URL API */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la API
                </label>
                <Input
                  type="url"
                  value={config.factusApiUrl}
                  onChange={(e) => setConfig({ ...config, factusApiUrl: e.target.value })}
                  placeholder="https://api-sandbox.factus.com.co"
                />
              </div>

              {/* Modo de prueba */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="factusTestMode"
                  checked={config.factusTestMode}
                  onChange={(e) => setConfig({ ...config, factusTestMode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="factusTestMode" className="text-sm font-medium text-gray-700">
                  Modo de prueba (Sandbox)
                </label>
              </div>

              {/* Rango de numeración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Rango de Numeración (Opcional)
                </label>
                <Input
                  type="number"
                  value={config.factusNumberingRangeId || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    factusNumberingRangeId: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Dejar vacío para usar el primer rango disponible"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si tienes múltiples rangos de numeración, especifica cuál usar. Si no, se usará el primero disponible.
                </p>
              </div>
            </>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={saveConfig}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Guardando...' : '💾 Guardar Configuración'}
            </Button>

            {config.enableElectronicBilling && (
              <Button
                onClick={testConnection}
                disabled={saving}
                variant="outline"
              >
                {saving ? 'Probando...' : '🔌 Probar Conexión'}
              </Button>
            )}
          </div>

          {/* Información adicional */}
          {config.enableElectronicBilling && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información importante</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Las facturas electrónicas se generan automáticamente cuando se confirman los pagos.</li>
                <li>• Usa el ambiente Sandbox para pruebas antes de configurar producción.</li>
                <li>• En producción, cambia la URL y credenciales por las reales de FACTUS.</li>
                <li>• Los tokens de acceso de FACTUS caducan cada hora y se renuevan automáticamente.</li>
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ElectronicBillingConfig;