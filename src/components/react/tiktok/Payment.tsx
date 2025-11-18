import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';
import PaymentMethodSelector from './PaymentMethodSelector';

export default function Payment() {
  // Estados de cupón
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [isValidCoupon, setIsValidCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValid, setCouponValid] = useState(false);

  // Estados de envío
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [isFetchingShipping, setIsFetchingShipping] = useState(false);

  // Otros estados
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [product, setProduct] = useState(null);
  const [loadingSale, setLoadingSale] = useState(false);
  const [saleMessage, setSaleMessage] = useState("");

  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [storeConfig, setStoreConfig] = useState({ cartTimeoutDays: 2, cartEnabled: true });

  // Estados para checkout desde carrito
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      const storeName = sessionStorage.getItem("storeName");
      if (!storeName) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/payment/banks/${storeName}`
        );
        setBanks(res.data.data || []);
      } catch (error) {
        console.error("Error al obtener bancos:", error);
      }
    };

    const fetchStoreConfig = async () => {
      const storeName = sessionStorage.getItem("storeName");
      if (!storeName) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/store-config/public/${storeName}`);
        if (res.data) {
          setStoreConfig({
            cartTimeoutDays: res.data.cartTimeoutDays || 2,
            cartEnabled: res.data.cartEnabled ?? true
          });
        }
      } catch (error) {
        console.error("Error al obtener configuración de tienda:", error);
      }
    };

    fetchBanks();
    fetchStoreConfig();
  }, []);

  // Cargar datos desde sessionStorage y la API de usuario
  useEffect(() => {
    const loadData = async () => {
      const userTikTokId = sessionStorage.getItem("userTikTokId");
      const isCart = sessionStorage.getItem("isCartCheckout") === "true";
      const cartId = sessionStorage.getItem("cartId");

      setIsCartCheckout(isCart);

      // Cargar datos del usuario
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tiktokuser/userId/${userTikTokId}`);
        if (res.data) {
          setUserData({
            name: res.data.name || "",
            phone: res.data.phone || "",
            email: res.data.email || "",
            address: res.data.address || "",
            city: res.data.city?.name || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }

      // Si es checkout desde carrito, cargar el carrito
      if (isCart && cartId) {
        setLoadingCart(true);
        try {
          const cartRes = await axios.get(`${API_BASE_URL}/api/cart/${cartId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (cartRes.data.success) {
            setCart(cartRes.data.data);
          }
        } catch (error) {
          console.error("Error al cargar carrito:", error);
        } finally {
          setLoadingCart(false);
        }
      } else {
        // Modo producto individual (lógica existente)
        if (typeof window !== "undefined") {
          const storedProduct = sessionStorage.getItem("product");
          const storedColor = sessionStorage.getItem("color");
          const storedSize = sessionStorage.getItem("size");
          const storedQuantity = sessionStorage.getItem("quantity");

          if (storedProduct) setProduct(JSON.parse(storedProduct));
          if (storedColor) setColor(storedColor);
          if (storedSize) setSize(storedSize);
          if (storedQuantity) setQuantity(parseInt(storedQuantity, 10));
        }
      }
    };

    loadData();
  }, []);

  // Cotizar envío
  const cotizarEnvio = async () => {
    setIsFetchingShipping(true);

    const productId = sessionStorage.getItem("productId");
    const cartId = sessionStorage.getItem("cartId");
    const isCart = sessionStorage.getItem("isCartCheckout") === "true";
    const userTikTokId = sessionStorage.getItem("userTikTokId");
    let store = sessionStorage.getItem("storeName");

    // Si no hay storeName en sessionStorage, extraerlo de la URL
    if (!store) {
      const pathParts = window.location.pathname.split('/');
      const storeIndex = pathParts.findIndex(part => part === 'tiktok') + 1;
      if (storeIndex > 0 && pathParts[storeIndex]) {
        store = pathParts[storeIndex];
        sessionStorage.setItem("storeName", store);
      }
    }

    console.log('🚚 Cotizar Envío - Mode:', isCart ? 'CART' : 'PRODUCT');
    console.log('cartId:', cartId, 'productId:', productId);

    try {
      const requestData: any = {
        userTikTokId: userTikTokId,
        storeName: store,
      };

      // Modo carrito o producto individual
      if (isCart && cartId) {
        requestData.cartId = cartId;
      } else if (productId) {
        requestData.productId = productId;
      }

      console.log('📦 Shipping quote request:', requestData);

      const res = await axios.post(
        `${API_BASE_URL}/api/shipments/shipment-quote`,
        requestData
      );

      if (res.data) {
        const options = Object.entries(res.data).map(([provider, details]) => ({
          provider,
          ...details,
        }));
        setShippingOptions(options);
        console.log('✅ Shipping options received:', options.length);
      }
    } catch (error) {
      console.error("❌ Error al cotizar el envío:", error);
      console.error("Response:", error.response?.data);
      setShippingOptions([]);
    } finally {
      setIsFetchingShipping(false);
    }
  };

  // Seleccionar método de envío
  const handleSelectShipping = (option) => {
    setSelectedShippingOption(option);
    setSelectedShippingCost(option.valor);
  };

  // Validar cupón
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);
    try {
      const userTikTokId = sessionStorage.getItem("userTikTokId");
      const productId = sessionStorage.getItem("productId");
      const storeName = sessionStorage.getItem("storeName");
      
      console.log('🎟️ FRONTEND - Datos para validar cupón:', {
        userTikTokId,
        productId,
        storeName,
        product: product?.name,
        productStoreId: product?.category?.store?.id || product?.storeId
      });
      
      if (!userTikTokId) {
        setCouponMessage("Error: No se pudo identificar el usuario.");
        setCouponValid(false);
        return;
      }
      
      if (!productId) {
        setCouponMessage("Error: No se pudo identificar el producto.");
        setCouponValid(false);
        return;
      }
      
      // Obtener storeId desde el producto o mediante consulta al storeName
      let storeIdToUse = product?.category?.store?.id || product?.storeId;
      
      // Si no tenemos storeId en el producto, obtenerlo mediante el storeName
      if (!storeIdToUse && storeName) {
        try {
          const storeRes = await axios.get(`${API_BASE_URL}/api/stores/name/${storeName}`);
          storeIdToUse = storeRes.data?.id;
        } catch (error) {
          console.error("Error obteniendo store por nombre:", error);
        }
      }
      
      if (!storeIdToUse) {
        setCouponMessage("Error: No se pudo identificar la tienda.");
        setCouponValid(false);
        return;
      }
      
      const res = await axios.post(
        `${API_BASE_URL}/api/coupons/validate`,
        {
          code: couponCode,
          storeId: storeIdToUse,
          userTikTokId: parseInt(userTikTokId),
          productId: parseInt(productId),
        }
      );

      if (res.data.valid) {
        setDiscountType(res.data.discountType);
        setDiscount(parseFloat(res.data.discountValue));
        setIsValidCoupon(true);
      } else {
        setIsValidCoupon(false);
        setDiscount(0);
      }
    } catch (error) {
      console.error("Error al validar el cupón:", error);
      console.error("Respuesta del backend:", error.response?.data);
      
      if (error.response?.data?.message) {
        setCouponMessage(error.response.data.message);
      } else {
        setCouponMessage("Error al validar el cupón.");
      }
      setCouponValid(false);
      setIsValidCoupon(false);
      setDiscount(0);
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Agregar al carrito
  const addToCart = async () => {
    // Para el baúl, el envío es opcional y se puede configurar después

    setLoadingSale(true);
    setSaleMessage("");

    const userTikTokId = sessionStorage.getItem("userTikTokId");
    const store = sessionStorage.getItem("storeName");

    try {
      // 1. Crear o obtener carrito activo
      const cartResponse = await axios.post(
        `${API_BASE_URL}/api/cart/create`,
        {
          userTikTokId: Number(userTikTokId),
          storeName: store,
          timeoutDays: storeConfig.cartTimeoutDays
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!cartResponse.data.success) {
        throw new Error('Error al crear carrito');
      }

      const cart = cartResponse.data.data;

      // 2. Obtener variante si existe
      let productVariantId = null;
      if (color || size) {
        try {
          const variantResponse = await axios.get(
            `${API_BASE_URL}/api/products/${product.id}/variants`,
            {
              params: { color, size }
            }
          );
          if (variantResponse.data && variantResponse.data.length > 0) {
            productVariantId = variantResponse.data[0].id;
          }
        } catch (error) {
          console.warn("No se encontró variante específica, usando producto base");
        }
      }

      // 3. Agregar producto al carrito
      const addItemResponse = await axios.post(
        `${API_BASE_URL}/api/cart/add-item`,
        {
          cartId: cart.id,
          productId: product.id,
          quantity: quantity,
          productVariantId: productVariantId
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (addItemResponse.data.success) {
        // 4. Actualizar costo de envío en el carrito si es necesario
        if (selectedShippingCost > 0 && selectedShippingOption) {
          await axios.put(
            `${API_BASE_URL}/api/cart/${cart.id}/shipping`,
            {
              shippingCost: selectedShippingCost,
              shippingProvider: selectedShippingOption.provider
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          ).catch(error => {
            console.warn("No se pudo actualizar el costo de envío:", error);
          });
        }

        setSaleMessage("✅ Producto agregado al baúl exitosamente");
        
        // Mostrar información detallada
        setTimeout(() => {
          const shippingInfo = selectedShippingOption ? 
            `📦 Envío: ${selectedShippingOption.provider.toUpperCase()}\n` : 
            `📦 Envío: GRATIS (sin costo de envío)\n`;
            
          const message = `🛒 ¡Producto agregado al baúl!\n\n` +
            `⏰ Tiempo límite: ${storeConfig.cartTimeoutDays} días\n` +
            `💰 Total producto: $${(product.price * quantity).toLocaleString()} COP\n` +
            shippingInfo + `\n` +
            `Se enviará un link de pago al vencer el tiempo.\n` +
            `También puedes pagar manualmente cuando gustes.`;
          
          alert(message);
          
          // Opcional: redirigir a una página del carrito
          // window.location.href = `/tiktok/${store}/cart`;
        }, 1000);
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      setSaleMessage("❌ Error al agregar al baúl");
    } finally {
      setLoadingSale(false);
    }
  };

  // Crear la venta (pago inmediato)
  const createSale = async () => {
    // Ya no es obligatorio seleccionar método de envío

    setLoadingSale(true);
    setSaleMessage("");

    const userTikTokId = sessionStorage.getItem("userTikTokId");
    let store = sessionStorage.getItem("storeName");

    // Si no hay storeName en sessionStorage, extraerlo de la URL
    if (!store) {
      const pathParts = window.location.pathname.split('/');
      const storeIndex = pathParts.findIndex(part => part === 'tiktok') + 1;
      if (storeIndex > 0 && pathParts[storeIndex]) {
        store = pathParts[storeIndex];
        // Guardar en sessionStorage para futuras referencias
        sessionStorage.setItem("storeName", store);
      }
    }

    if (!store) {
      alert("Error: No se pudo identificar la tienda. Por favor, regresa a la página principal de la tienda.");
      setLoadingSale(false);
      return;
    }

    if (!userTikTokId) {
      alert("Error: No se pudo identificar el usuario. Por favor, regresa a la página principal de la tienda.");
      setLoadingSale(false);
      return;
    }

    if (!selectedBank) {
      alert("Error: Debes seleccionar un banco para proceder con el pago.");
      setLoadingSale(false);
      return;
    }

    let saleData;

    // Si es checkout desde carrito
    if (isCartCheckout && cart) {
      const productsFromCart = cart.cartItems.map(item => ({
        productId: Number(item.product.id),
        quantity: Number(item.quantity),
        price: Number(item.unitPrice),
        productVariantId: item.productVariant ? Number(item.productVariant.id) : undefined
      }));

      saleData = {
        userTikTokId: Number(userTikTokId),
        storeName: store,
        products: productsFromCart,
        couponCode: couponCode || "",
        shippingCost: cart.shippingCost ? parseFloat(cart.shippingCost) : 0,
        transportadora: cart.shippingProvider || 'envio_gratis',
        bankCode: selectedBank,
      };
    } else {
      // Modo producto individual (lógica existente)
      if (!product) {
        alert("Error: No se pudo identificar el producto. Por favor, regresa a la página principal de la tienda.");
        setLoadingSale(false);
        return;
      }

      saleData = {
        userTikTokId: Number(userTikTokId),
        storeName: store,
        products: [
          {
            productId: Number(product.id),
            quantity: Number(quantity),
            price: Number(product.price),
          },
        ],
        couponCode: couponCode || "",
        shippingCost: selectedShippingOption ? selectedShippingCost : 0,
        transportadora: selectedShippingOption ? selectedShippingOption.provider : 'envio_gratis',
        bankCode: selectedBank,
      };
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sales`, saleData);
      console.log('🔍 Respuesta del backend:', res.data);
      
      if (res.status === 201) {
        setSaleMessage("✅ Venta registrada exitosamente");
        
        if (res.data.urlBanco && res.data.urlBanco !== 'undefined') {
          console.log('🔗 Redirigiendo a:', res.data.urlBanco);
          window.location.href = res.data.urlBanco;
        } else {
          console.error('❌ urlBanco no disponible:', res.data.urlBanco);
          setSaleMessage("❌ Error: No se pudo obtener la URL de pago de ePayco. Respuesta: " + JSON.stringify(res.data));
        }
      } else {
        throw new Error("No se pudo completar la venta");
      }
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      console.error("Respuesta del backend:", error.response?.data);
      
      // Usar el mensaje específico del backend o fallback a genérico
      const errorMessage = error.response?.data?.message || "Error al procesar la venta";
      setSaleMessage(`❌ ${errorMessage}`);
    } finally {
      setLoadingSale(false);
    }
  };

  // Cálculos
  let subtotal = 0;
  if (isCartCheckout && cart) {
    // Calcular subtotal desde el carrito
    console.log('🛒 Cart items:', cart.cartItems);
    subtotal = cart.cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQty = item.quantity || 0;
      console.log(`Item: ${item.product?.name}, Price: ${itemPrice}, Qty: ${itemQty}, Subtotal: ${itemPrice * itemQty}`);
      return sum + (itemPrice * itemQty);
    }, 0);
    console.log('💰 Total subtotal:', subtotal);
  } else if (product) {
    // Calcular subtotal desde producto individual
    subtotal = product.price * quantity;
  }

  let totalDiscount = 0;
  if (discountType === "PERCENTAGE") {
    totalDiscount = (subtotal * discount) / 100;
  } else if (discountType === "FIXED") {
    totalDiscount = discount;
  }
  totalDiscount = Math.min(totalDiscount, subtotal); // Evitar descuento mayor que el subtotal

  const shippingCostToUse = isCartCheckout && cart && cart.shippingCost
    ? parseFloat(cart.shippingCost)
    : selectedShippingCost;

  const total = subtotal - totalDiscount + shippingCostToUse;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">

            {/* Product Summary */}
            {loadingCart ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Cargando productos...</span>
                </div>
              </div>
            ) : isCartCheckout && cart ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tu Baúl ({cart.cartItems.length} productos)
                </h2>
                <div className="space-y-4">
                  {cart.cartItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h3>
                        <div className="mt-1 space-y-0.5">
                          {item.productVariant?.color && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Color:</span>
                              <span className="text-xs font-medium text-gray-900">{item.productVariant.color.name}</span>
                            </div>
                          )}
                          {item.productVariant?.size && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Talla:</span>
                              <span className="text-xs font-medium text-gray-900">{item.productVariant.size.name}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Cantidad:</span>
                            <span className="text-xs font-medium text-gray-900">{item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          ${parseFloat(item.subtotal).toLocaleString()} COP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Subtotal:</span>
                    <span className="text-lg font-bold text-blue-600">${subtotal.toLocaleString()} COP</span>
                  </div>
                </div>
              </div>
            ) : product ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tu Producto</h2>
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                    <div className="mt-2 space-y-1">
                      {color && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Color:</span>
                          <span className="text-sm font-medium text-gray-900">{color}</span>
                        </div>
                      )}
                      {size && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Talla:</span>
                          <span className="text-sm font-medium text-gray-900">{size}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Cantidad:</span>
                        <span className="text-sm font-medium text-gray-900">{quantity}</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600 mt-3">
                      ${subtotal.toLocaleString()} COP
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">Dirección de Envío</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nombre:</span>
                    <p className="text-gray-900">{userData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                    <p className="text-gray-900">{userData.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ciudad:</span>
                    <p className="text-gray-900">{userData.city}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Dirección:</span>
                    <p className="text-gray-900">{userData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">Método de Envío</h2>
              </div>
              
              <button
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={cotizarEnvio}
                disabled={isFetchingShipping}
              >
                {isFetchingShipping ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cotizando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Cotizar Envío
                  </>
                )}
              </button>

              {shippingOptions.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Selecciona tu método de envío:</p>
                  <div className="space-y-3">
                    {shippingOptions.map((option, index) => (
                      <label
                        key={index}
                        className={`block relative cursor-pointer`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          className="sr-only"
                          onChange={() => handleSelectShipping(option)}
                        />
                        <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                          selectedShippingOption === option
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{option.provider.toUpperCase()}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Entrega: {option.fecha_entrega || "No especificada"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600">
                                ${option.valor.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">COP</p>
                            </div>
                          </div>
                          {selectedShippingOption === option && (
                            <div className="absolute top-4 right-4">
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="space-y-6">
            
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toLocaleString()} COP</span>
                </div>
                
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Descuento:</span>
                    <span className="font-semibold">-${totalDiscount.toLocaleString()} COP</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">
                    {shippingCostToUse > 0
                      ? `$${shippingCostToUse.toLocaleString()} COP`
                      : "Gratis"}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${total.toLocaleString()} COP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Cupón de Descuento</h3>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Código de descuento"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  onClick={validateCoupon}
                  disabled={loadingCoupon}
                >
                  {loadingCoupon ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Aplicar"
                  )}
                </button>
              </div>
              
              {isValidCoupon === false && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Cupón inválido
                </p>
              )}
              
              {couponMessage && (
                <p className={`text-sm mt-2 flex items-center ${couponValid ? 'text-green-600' : 'text-red-500'}`}>
                  <svg className={`w-4 h-4 mr-1 ${couponValid ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    {couponValid ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Bank Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Selecciona tu Banco</h3>
              </div>
              
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">Selecciona un banco</option>
                {banks.map((bank, index) => (
                  <option key={index} value={bank.bankCode}>
                    {bank.bankName}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <PaymentMethodSelector
                onPayNow={createSale}
                onAddToCart={addToCart}
                loadingSale={loadingSale}
                disabledPayNow={!selectedBank}
                disabledAddToCart={!storeConfig.cartEnabled || isCartCheckout}
                cartTimeoutDays={storeConfig.cartTimeoutDays}
                cartEnabled={storeConfig.cartEnabled && !isCartCheckout}
              />
              {saleMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">{saleMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
