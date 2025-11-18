import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';
import Cart from '../cart/Cart';

export default function Checkout() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartMode, setIsCartMode] = useState(false);
  const [userTikTokId, setUserTikTokId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const productCode = url.searchParams.get("productId");
    const userTikTokIdParam = url.searchParams.get("userTikTokId");

    // ✅ Extraer 'store' desde la ruta
    const pathSegments = window.location.pathname.split("/");
    const store = pathSegments[2];

    if (!store) {
      console.error("Store no está definido en la ruta");
      setLoading(false);
      return;
    }

    setStoreName(store);
    
    if (userTikTokIdParam && !isNaN(Number(userTikTokIdParam))) {
      const userId = Number(userTikTokIdParam);
      setUserTikTokId(userId);
      sessionStorage.setItem("userTikTokId", userTikTokIdParam);
    }

    // Determinar el modo: si no hay productId, es modo carrito
    if (!productCode && userTikTokIdParam) {
      setIsCartMode(true);
      setLoading(false);
      return;
    }

    if (!productCode) {
      console.error("Parámetros faltantes: productId no está definido para checkout de producto");
      setLoading(false);
      return;
    }

    // Modo producto individual (lógica existente)
    const path = `${API_BASE_URL}/api/products/store/${store}/product/${productCode}`;
    console.log("Llamando API con:", path);

    axios
      .get(path)
      .then((res) => {
        if (!res.data) {
          throw new Error("Respuesta vacía de la API");
        }

        const productData = res.data;

        // Extraer colores y tallas desde variants
        const colors = [
          ...new Map(
            productData.variants
              .filter((v: any) => v.color && v.color.name)
              .map((v: any) => [
                v.color.name,
                { name: v.color.name, hexCode: v.color.hexCode },
              ])
          ).values(),
        ];

        const sizes = [
          ...new Set(
            productData.variants
              .filter((v: any) => v.size && v.size.name)
              .map((v: any) => v.size.name)
          ),
        ];

        setProduct({ ...productData, colors, sizes });

        if (colors.length) setSelectedColor(colors[0].name);
        if (sizes.length) setSelectedSize(sizes[0]);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        console.error(
          "Detalles del error:",
          err.response ? err.response.data : err.message
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBuy = () => {
    /*if (!selectedColor || !selectedSize) {
      alert("Por favor selecciona color y talla antes de comprar.");
      return;
    }*/
  
    // ✅ Extraer 'store' desde la ruta
    const pathSegments = window.location.pathname.split("/");
    const store = pathSegments[2]; // Si 'store' siempre está en la tercera posición
  
    if (!store) {
      console.error("Parámetros faltantes: store o productId no están definidos.");
      return;
    }
  
    // ✅ Guardar en Session Storage
    sessionStorage.setItem("product", JSON.stringify(product));
    sessionStorage.setItem("productId", product.id);
    sessionStorage.setItem("storeName", store);
    sessionStorage.setItem("size", selectedSize || '');
    sessionStorage.setItem("color", selectedColor || '');
    sessionStorage.setItem("quantity", quantity.toString());
    
  
    // ✅ También guardar userTikTokId si existe en la URL
    const url = new URL(window.location.href);
    const userTikTokId = url.searchParams.get("userTikTokId");
    if (userTikTokId) {
      sessionStorage.setItem("userTikTokId", userTikTokId);
    }
  
    // ✅ Redirigir a la página de pago
    window.location.href = `/tiktok/${store}/payment`;
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            {isCartMode ? 'Cargando carrito...' : 'Cargando producto...'}
          </p>
        </div>
      </div>
    );
  }

  // Cart mode
  if (isCartMode) {
    if (!userTikTokId || !storeName) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-red-500">
              Datos de usuario o tienda no encontrados
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a la tienda
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tu Baúl</h1>
            <p className="text-gray-600">Gestiona los productos en tu carrito de compras</p>
          </div>

          <Cart
            userTikTokId={userTikTokId}
            storeName={storeName}
            onCartChange={() => {
              // Optional: refresh logic if needed
            }}
          />
        </div>
      </div>
    );
  }

  // Product mode (existing logic)
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-500">
            Producto no encontrado
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la tienda
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Image */}
          <div className="order-2 lg:order-1">
            <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-8">
              {/* Product Info */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">Referencia: {product.code}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-blue-600">
                    ${Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-gray-500">COP</span>
                </div>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Color</h3>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color: any) => (
                      <button
                        key={color.name}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                          selectedColor === color.name
                            ? "border-blue-500 scale-110 shadow-lg"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.hexCode }}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <div className="absolute inset-0 rounded-full border-2 border-white shadow-inner" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-gray-600 mt-2">
                      Color seleccionado: <span className="font-medium">{selectedColor}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Talla</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size: any) => (
                      <button
                        key={size}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantidad</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      className="p-3 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                    <button
                      className="p-3 hover:bg-gray-100 transition-colors"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Total: <span className="text-blue-600">${(Number(product.price) * quantity).toLocaleString()} COP</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                onClick={handleBuy}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                </svg>
                <span>Proceder al Pago</span>
              </button>

              {/* Product Description */}
              {product.description && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción del producto</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
