import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

export default function StorePage({ store }: { store: string }) {
  const [storeData, setStoreData] = useState<any>(null);
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [tiktokUser, setTiktokUser] = useState({
    tiktok: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [registering, setRegistering] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const documentTypes = ["CC", "CE", "RUT", "NIT"];
  const typesOfPersons = [
    { value: "0", label: "Persona Natural" },
    { value: "1", label: "Persona Jurídica" },
  ];

  useEffect(() => {
    // 1️⃣ Cargar países desde el backend
    axios
      .get(`${API_BASE_URL}/api/location/countries`)
      .then((res) => setCountries(res.data))
      .catch(() => console.error("Error cargando países"));

    // 2️⃣ Mostrar el popup después de 1 segundo
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000);

    // Limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [setShowPopup]); // Agregamos setShowPopup como dependencia

  const fetchDepartments = (countryId) => {
    axios
      .get(`${API_BASE_URL}/api/location/departments/${countryId}`)
      .then((res) => setDepartments(res.data))
      .catch(() => console.error("Error cargando departamentos"));
  };

  const fetchCities = (departmentId) => {
    axios
      .get(`${API_BASE_URL}/api/location/cities/${departmentId}`)
      .then((res) => setCities(res.data))
      .catch(() => console.error("Error cargando ciudades"));
  };

  const handleChange = (name, value) => {
    setStoreData((prev) => ({ ...prev, [name]: value }));

    if (name === "countryId") {
      setStoreData((prev) => ({
        ...prev,
        countryId: value,
        departmentId: "",
        cityId: "",
      }));
      fetchDepartments(value);
    }

    if (name === "departmentId") {
      setStoreData((prev) => ({ ...prev, departmentId: value, cityId: "" }));
      fetchCities(value);
    }
  };

  const fetchCartCount = async (userTikTokId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/cart/user/${userTikTokId}/store/${store}`
      );
      if (res.data?.data?.cartItems) {
        const totalItems = res.data.data.cartItems.reduce(
          (sum: number, item: any) => sum + item.quantity, 
          0
        );
        setCartItemCount(totalItems);
      }
    } catch (error) {
      // Cart doesn't exist yet, that's fine
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeRes = await axios.get(
          `${API_BASE_URL}/api/stores/store/${store}`
        );
        setStoreData(storeRes.data);
        setCategories(storeRes.data.categories || []);

        // Obtener configuración pública de la tienda
        const configRes = await axios.get(
          `${API_BASE_URL}/api/store-config/public/${store}`
        );
        setStoreConfig(configRes.data);

        // Cargar contador del carrito si el usuario está registrado y el carrito está habilitado
        const userTikTokId = sessionStorage.getItem("userTikTokId");
        if (userTikTokId && configRes.data?.cartEnabled) {
          fetchCartCount(userTikTokId);
        }
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [store]);

  // Filtrar productos basado en búsqueda y categoría
  useEffect(() => {
    let allProducts = categories.flatMap((category) => 
      category.products.map((product: any) => ({
        ...product,
        categoryId: category.id,
        categoryName: category.name
      }))
    );

    // Filtrar por categoría
    if (selectedCategory !== null) {
      allProducts = allProducts.filter(product => product.categoryId === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(allProducts);
  }, [categories, searchQuery, selectedCategory]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {

      const submissionData = {
        ...tiktokUser,
        documentType: storeData.documentType || tiktokUser.documentType,
        document: storeData.document || tiktokUser.documentNumber, // Note: different field names
        country: storeData.countryId, 
        department: storeData.departmentId,
        city: storeData.cityId,
        personType: storeData.typePerson,
      };

      console.log('tiktokUser ', submissionData);
      
      const resp = await axios.post(
        `${API_BASE_URL}/api/tiktokuser/register/${store}`,
        submissionData
      );

      console.log('resp ', resp);

      if (resp.data.id && !isNaN(Number(resp.data.id))) {
        sessionStorage.setItem("userTikTokId", resp.data.id);
        sessionStorage.setItem("storeId", resp.data.store.id);
      }

      alert("Usuario registrado con éxito");
      setShowPopup(false);
      //setTiktokUser({ tiktok: "", name: "", phone: "", address: "" });
    } catch (error) {
      console.error("Error registrando usuario:", error);
      alert("Error al registrar usuario");
    } finally {
      setRegistering(false);
    }
  };

  // 🚀 Función para redirigir al checkout con la información del producto
  const handleCheckout = (product: any) => {
    const userIdTiktok = sessionStorage.getItem("userTikTokId") || "";
    const checkoutUrl = `/tiktok/${store}/checkout?productId=${product.id}&userTikTokId=${userIdTiktok}`;

    // Redirige al checkout con window.location.href
    window.location.href = checkoutUrl;
  };

  // 🛒 Función para agregar producto al carrito
  const handleAddToCart = async (product: any) => {
    try {
      const userIdTiktok = sessionStorage.getItem("userTikTokId");
      if (!userIdTiktok) {
        alert("Por favor regístrate primero");
        setShowPopup(true);
        return;
      }

      const cartData = {
        userTikTokId: parseInt(userIdTiktok),
        storeName: store,
        products: [{
          productId: product.id,
          quantity: 1,
          price: parseFloat(product.price)
        }],
        shippingCost: 0
      };

      const response = await axios.post(`${API_BASE_URL}/api/cart`, cartData);
      
      if (response.data.cartId) {
        alert("✅ Producto agregado al baúl");
        // Opcional: redirigir al carrito
        // window.location.href = `/cart/${response.data.cartId}?token=${response.data.token}`;
      }
    } catch (error) {
      console.error("Error agregando al carrito:", error);
      alert("❌ Error agregando al baúl");
    }
  };

  if (loading) {
    return (
      <h2 className="text-center text-2xl mt-10 font-semibold">Cargando...</h2>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 z-20 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded-full p-2 hover:bg-opacity-40"
              onClick={() => setShowPopup(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header moderno */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-2">
                  ¡Únete a la Comunidad!
                </h2>
                <p className="text-center text-blue-100 text-lg">
                  Regístrate y obtén acceso exclusivo a descuentos y productos especiales
                </p>
              </div>
            </div>

            {/* Contenido del formulario */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <form onSubmit={handleRegister} className="space-y-8">
                {/* Información Personal */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Información Personal
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        value={tiktokUser.name}
                        onChange={(e) => setTiktokUser({ ...tiktokUser, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usuario TikTok *</label>
                      <input
                        type="text"
                        value={tiktokUser.tiktok}
                        onChange={(e) => setTiktokUser({ ...tiktokUser, tiktok: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="@tu_usuario"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        value={tiktokUser.phone}
                        onChange={(e) => setTiktokUser({ ...tiktokUser, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={tiktokUser.email}
                        onChange={(e) => setTiktokUser({ ...tiktokUser, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Identificación */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Información de Identificación
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Persona *</label>
                      <select
                        name="typePerson"
                        value={storeData.typePerson}
                        onChange={(e) => handleChange("typePerson", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Seleccione el tipo</option>
                        {typesOfPersons.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
                      <select
                        name="documentType"
                        value={storeData.documentType}
                        onChange={(e) => handleChange("documentType", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Seleccione el tipo</option>
                        {documentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento *</label>
                      <input
                        type="text"
                        name="document"
                        placeholder="Ingrese su número de documento"
                        onChange={(e) => handleChange("document", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Ubicación
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">País *</label>
                      <select
                        value={storeData.countryId}
                        onChange={(e) => handleChange("countryId", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Selecciona un país</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                      <select
                        value={storeData.departmentId}
                        onChange={(e) => handleChange("departmentId", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!storeData.countryId}
                      >
                        <option value="">Selecciona un departamento</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                      <select
                        value={storeData.cityId}
                        onChange={(e) => handleChange("cityId", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!storeData.departmentId}
                      >
                        <option value="">Selecciona una ciudad</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                      <input
                        type="text"
                        value={tiktokUser.address}
                        onChange={(e) => setTiktokUser({ ...tiktokUser, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Ingresa tu dirección completa"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de registro */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={registering}
                  >
                    {registering ? (
                      <>
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>¡Únete a LiveShop!</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Al registrarte, aceptas nuestros términos y condiciones
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Store Name */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={storeData?.logo}
                  alt={storeData?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">{storeData?.name}</h1>
                {storeConfig?.testMode && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Modo Prueba
                  </span>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Cart and Actions */}
            <div className="flex items-center space-x-4">
              {storeConfig?.cartEnabled && (
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                    0
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowPopup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Únete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4">
              Descubre {storeData?.name}
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Productos exclusivos con la calidad que mereces. Únete a nuestra comunidad y disfruta de ofertas especiales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Únete Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8 py-4 overflow-x-auto">
            <button 
              onClick={() => handleCategoryClick(null)}
              className={`whitespace-nowrap pb-2 font-medium transition-colors ${
                selectedCategory === null 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`whitespace-nowrap pb-2 font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Active Filters */}
      {(searchQuery || selectedCategory !== null) && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                <div className="flex items-center space-x-2">
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Búsqueda: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategory !== null && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Categoría: {categories.find(c => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {selectedCategory !== null 
              ? `${categories.find(c => c.id === selectedCategory)?.name || 'Productos'}`
              : searchQuery 
              ? `Resultados para "${searchQuery}"`
              : 'Productos Destacados'
            }
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {filteredProducts.length > 0 
              ? `${filteredProducts.length} productos encontrados`
              : 'Descubre nuestra selección de productos cuidadosamente elegidos para ti'
            }
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ${parseInt(product.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">COP</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {storeConfig?.cartEnabled ? (
                      <>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                          </svg>
                          Agregar al Baúl
                        </button>
                        <button
                          onClick={() => handleCheckout(product)}
                          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Comprar Ahora
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCheckout(product)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Comprar Ahora
                      </button>
                    )}
                  </div>
                </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory !== null 
                ? 'No se encontraron productos' 
                : 'No hay productos disponibles'
              }
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== null 
                ? 'Intenta con otros términos de búsqueda o explora diferentes categorías.'
                : 'Pronto tendremos productos increíbles para ti.'
              }
            </p>
            {(searchQuery || selectedCategory !== null) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Store Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={storeData?.logo}
                  alt={storeData?.name}
                  className="w-10 h-10 rounded-full"
                />
                <h3 className="text-xl font-bold">{storeData?.name}</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Tu tienda de confianza con productos de calidad y el mejor servicio al cliente.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.013C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Todos los Productos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ofertas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nuevos Productos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Envíos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Devoluciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 {storeData?.name}. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">Powered by LiveShop</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
