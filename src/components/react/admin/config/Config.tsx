import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaKey, FaShieldAlt } from "react-icons/fa";
import { API_BASE_URL } from '@config/api';

export default function ConfiguracionPasarela() {

  const [config, setConfig] = useState({
    merchantId: "",
    testMode: "false",
    cartTimeoutDays: 2,
    cartEnabled: true,
    // Facturación electrónica
    enableElectronicBilling: false,
    factusClientId: "",
    factusClientSecret: "",
    factusUsername: "",
    factusPassword: "",
    factusApiUrl: "https://api-sandbox.factus.com.co",
    factusTestMode: true,
    factusNumberingRangeId: "",
    // 99 Envíos
    enableSeguro99: false,
    enableSeguro99Plus: false,
    enableContrapago: false,
    shippingOriginCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/store-config`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data) {
          setConfig({
            merchantId: res.data.merchantId || "",
            testMode: res.data.testMode || "false",
            cartTimeoutDays: res.data.cartTimeoutDays || 2,
            cartEnabled: res.data.cartEnabled ?? true,
            // Facturación electrónica
            enableElectronicBilling: res.data.enableElectronicBilling || false,
            factusClientId: res.data.factusClientId || "",
            factusClientSecret: res.data.factusClientSecret || "",
            factusUsername: res.data.factusUsername || "",
            factusPassword: res.data.factusPassword || "",
            factusApiUrl: res.data.factusApiUrl || "https://api-sandbox.factus.com.co",
            factusTestMode: res.data.factusTestMode ?? true,
            factusNumberingRangeId: res.data.factusNumberingRangeId || "",
            // 99 Envíos
            enableSeguro99: res.data.enableSeguro99 ?? false,
            enableSeguro99Plus: res.data.enableSeguro99Plus ?? false,
            enableContrapago: res.data.enableContrapago ?? false,
            shippingOriginCode: res.data.shippingOriginCode || "",
          });
        }
      } catch (error) {
        toast.error("Error al cargar la configuración.");
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${API_BASE_URL}/api/store-config`,
        {
          ...config,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      const modeText = config.testMode === "true" || config.testMode === true 
        ? "Modo Prueba 🧪" 
        : "Modo Producción 🔴";
      
      toast.success(`✅ Configuración actualizada - ${modeText}`);
    } catch (error) {
      toast.error("Error al guardar la configuración ❌");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <div className="bg-white rounded-lg shadow-md max-w-4xl">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💳 Pasarela de Pago
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cart'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🛒 Baúl de Compras
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Facturación Electrónica
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shipping'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚚 Envíos 99
            </button>
          </nav>
        </div>

        <form className="p-6" onSubmit={handleSubmit}>
          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">🔑 Configuración ePayco</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.testMode === "true" || config.testMode === true
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {config.testMode === "true" || config.testMode === true 
                    ? '🧪 Modo Prueba' 
                    : '🔴 Modo Producción'
                  }
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">💳</span>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Configuración de Pagos</h4>
                    <p className="text-sm text-blue-700">
                      Para recibir pagos solo necesitas configurar tu <strong>Merchant ID de ePayco</strong>. 
                      Las credenciales de la plataforma ya están configuradas por seguridad.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  🏪 Merchant ID de la Tienda
                </label>
                <input
                  type="text"
                  name="merchantId"
                  value={config.merchantId}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-md outline-none"
                  placeholder="Ej: 1553366"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  ID del merchant de ePayco donde llegará el dinero de la tienda
                </p>
              </div>

              <div className={`border rounded-lg p-4 ${
                config.testMode === "true" || config.testMode === true
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="testMode"
                    checked={config.testMode === "true" || config.testMode === true}
                    onChange={(e) => {
                      // Si está desactivando el modo test (yendo a producción), pedir confirmación
                      if (!e.target.checked) {
                        const confirmed = window.confirm(
                          "⚠️ ADVERTENCIA: Estás a punto de activar el modo PRODUCCIÓN.\n\n" +
                          "Esto significa que los pagos serán REALES y se cobrarán a tus clientes.\n\n" +
                          "¿Estás seguro de que quieres continuar?"
                        );
                        if (!confirmed) {
                          return; // No cambiar el estado si no confirma
                        }
                      }
                      
                      setConfig(prev => ({
                        ...prev,
                        testMode: e.target.checked ? "true" : "false"
                      }));
                    }}
                    className={`h-5 w-5 rounded mt-1 ${
                      config.testMode === "true" || config.testMode === true
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  />
                  <div>
                    <span className={`font-medium ${
                      config.testMode === "true" || config.testMode === true
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {config.testMode === "true" || config.testMode === true 
                        ? '🧪 Modo Prueba (Test)' 
                        : '🔴 Modo Producción'
                      }
                    </span>
                    <p className={`text-sm mt-1 ${
                      config.testMode === "true" || config.testMode === true
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {config.testMode === "true" || config.testMode === true
                        ? 'Los pagos se procesan en el entorno de pruebas de ePayco. Desactívalo cuando vayas a recibir pagos reales.'
                        : '⚠️ ATENCIÓN: Los pagos se procesarán como REALES. Solo usa este modo cuando tengas las credenciales de producción correctas.'
                      }
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">🛒 Configuración del Baúl</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      name="cartEnabled"
                      checked={config.cartEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="font-medium">Habilitar Baúl de Compras</span>
                  </label>
                  <p className="text-sm text-gray-600">
                    Permite a los clientes agregar productos al baúl antes de pagar
                  </p>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    ⏰ Tiempo de expiración (días)
                  </label>
                  <input
                    type="number"
                    name="cartTimeoutDays"
                    value={config.cartTimeoutDays}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    className="w-full p-3 bg-gray-100 rounded-md outline-none"
                    disabled={!config.cartEnabled}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Días antes de que expire el baúl y se envíe el link de pago
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Electronic Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">📄 Facturación Electrónica</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.enableElectronicBilling
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {config.enableElectronicBilling ? '✅ Habilitada' : '❌ Deshabilitada'}
                </div>
              </div>

              {/* Habilitar/Deshabilitar */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="enableElectronicBilling"
                    checked={config.enableElectronicBilling}
                    onChange={handleChange}
                    className="h-5 w-5 rounded mt-1 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-blue-900">
                      Habilitar Facturación Electrónica
                    </span>
                    <p className="text-sm text-blue-700 mt-1">
                      Genera automáticamente facturas electrónicas válidas ante la DIAN cuando se confirmen los pagos.
                    </p>
                  </div>
                </label>
              </div>

              {config.enableElectronicBilling && (
                <>
                  {/* Configuración rápida para sandbox */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">🚀 Configuración rápida - Sandbox</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Carga automáticamente las credenciales del ambiente de pruebas de FACTUS
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          factusClientId: '9e4ec14c-81fd-4b7d-86e7-ae9fdce3871e',
                          factusClientSecret: 'wPc5Fjv8iFmzgIguJVsi6MNt03xiX6zlXcFbFUKz',
                          factusUsername: 'sandbox@factus.com.co',
                          factusPassword: 'sandbox2024%',
                          factusApiUrl: 'https://api-sandbox.factus.com.co',
                          factusTestMode: true,
                        }));
                        toast.success('Configuración sandbox cargada');
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
                    >
                      📋 Cargar configuración Sandbox
                    </button>
                  </div>

                  {/* Credenciales FACTUS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Client ID</label>
                      <input
                        type="text"
                        name="factusClientId"
                        value={config.factusClientId}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-100 rounded-md outline-none"
                        placeholder="Client ID de FACTUS"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Client Secret</label>
                      <input
                        type="password"
                        name="factusClientSecret"
                        value={config.factusClientSecret}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-100 rounded-md outline-none"
                        placeholder="Client Secret de FACTUS"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Username</label>
                      <input
                        type="text"
                        name="factusUsername"
                        value={config.factusUsername}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-100 rounded-md outline-none"
                        placeholder="Usuario de FACTUS"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Password</label>
                      <input
                        type="password"
                        name="factusPassword"
                        value={config.factusPassword}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-100 rounded-md outline-none"
                        placeholder="Contraseña de FACTUS"
                      />
                    </div>
                  </div>

                  {/* URL API */}
                  <div>
                    <label className="block font-medium mb-1">URL de la API</label>
                    <input
                      type="url"
                      name="factusApiUrl"
                      value={config.factusApiUrl}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 rounded-md outline-none"
                      placeholder="https://api-sandbox.factus.com.co"
                    />
                  </div>

                  {/* Modo de prueba */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="factusTestMode"
                        checked={config.factusTestMode}
                        onChange={handleChange}
                        className="h-5 w-5 rounded mt-1 text-blue-600"
                      />
                      <div>
                        <span className="font-medium text-gray-900">
                          Modo de prueba (Sandbox)
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Usar ambiente de pruebas de FACTUS. Desactivar solo cuando tengas credenciales de producción.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Rango de numeración */}
                  <div>
                    <label className="block font-medium mb-1">ID Rango de Numeración (Opcional)</label>
                    <input
                      type="number"
                      name="factusNumberingRangeId"
                      value={config.factusNumberingRangeId}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 rounded-md outline-none"
                      placeholder="Dejar vacío para usar el primer rango disponible"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si tienes múltiples rangos de numeración, especifica cuál usar. Si no, se usará el primero disponible.
                    </p>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">ℹ️ Información importante</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Las facturas electrónicas se generan automáticamente cuando se confirman los pagos.</li>
                      <li>• Usa el ambiente Sandbox para pruebas antes de configurar producción.</li>
                      <li>• En producción, cambia la URL y credenciales por las reales de FACTUS.</li>
                      <li>• Los tokens de acceso de FACTUS caducan cada hora y se renuevan automáticamente.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Shipping Tab - 99 Envíos */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">🚚 Configuración de 99 Envíos</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Configura las opciones de envío que se aplicarán automáticamente al cotizar envíos con 99 Envíos.
              </p>

              {/* Toggle Seguro 99 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="enableSeguro99"
                    checked={config.enableSeguro99}
                    onChange={handleChange}
                    className="h-5 w-5 rounded mt-1 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-blue-900">
                      Habilitar Seguro 99 (Básico)
                    </span>
                    <p className="text-sm text-blue-700 mt-1">
                      Protección básica para envíos. Se incluirá automáticamente en las cotizaciones.
                    </p>
                  </div>
                </label>
              </div>

              {/* Toggle Seguro 99 Plus */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="enableSeguro99Plus"
                    checked={config.enableSeguro99Plus}
                    onChange={handleChange}
                    className="h-5 w-5 rounded mt-1 text-purple-600"
                  />
                  <div>
                    <span className="font-medium text-purple-900">
                      Habilitar Seguro 99 Plus (Premium)
                    </span>
                    <p className="text-sm text-purple-700 mt-1">
                      Protección premium para envíos de alto valor. Se incluirá automáticamente en las cotizaciones.
                    </p>
                  </div>
                </label>
              </div>

              {/* Toggle Contrapago */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="enableContrapago"
                    checked={config.enableContrapago}
                    onChange={handleChange}
                    className="h-5 w-5 rounded mt-1 text-green-600"
                  />
                  <div>
                    <span className="font-medium text-green-900">
                      Habilitar Pago Contra Entrega
                    </span>
                    <p className="text-sm text-green-700 mt-1">
                      El cliente paga al recibir el pedido. Se incluirá automáticamente en las cotizaciones.
                    </p>
                  </div>
                </label>
              </div>

              {/* Código Postal de Origen */}
              <div>
                <label className="block font-medium mb-2">
                  📍 Código Postal de Origen (Opcional)
                </label>
                <input
                  type="text"
                  name="shippingOriginCode"
                  value={config.shippingOriginCode}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-md outline-none"
                  placeholder="Ej: 11001000"
                  maxLength={8}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Código postal desde donde se enviarán los pedidos. Si lo dejas vacío, se usará el código de la ciudad configurada en tu tienda.
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">ℹ️ Información importante</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Estas configuraciones se aplicarán automáticamente al cotizar envíos.</li>
                  <li>• El seguro básico (Seguro 99) y premium (Seguro 99 Plus) son opcionales.</li>
                  <li>• El pago contra entrega permite que el cliente pague al recibir el pedido.</li>
                  <li>• El código postal debe tener 8 dígitos (formato colombiano).</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}