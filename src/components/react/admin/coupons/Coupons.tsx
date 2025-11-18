import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountValue: "",
    discountType: "PERCENTAGE", // 🔹 Mapeado a valores correctos
    applicableTo: "store", // Puede ser: "store", "category", "product"
    expirationDate: "",
    categoryIds: [],
    productIds: [],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/coupons/store`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCoupons(res.data);
    } catch (error) {
      console.error("Error cargando cupones", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      try {
        const categoryRes = await axios.get(`${API_BASE_URL}/api/categories/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log('🔍 CUPONES - Respuesta categorías:', categoryRes.data);
        setCategories(categoryRes.data || []);
      } catch (categoryError) {
        console.error("Error cargando categorías:", categoryError);
        setCategories([]);
      }

      // Cargar productos
      try {
        const productRes = await axios.get(`${API_BASE_URL}/api/products/me/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log('🔍 CUPONES - Respuesta productos:', productRes.data);
        setProducts(productRes.data || []);
      } catch (productError) {
        console.error("Error cargando productos:", productError);
        setProducts([]);
      }

      fetchCoupons(); // 🔹 Cargar cupones después
    } catch (error) {
      console.error("Error general cargando datos", error);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    const payload = {
      ...newCoupon,
      discountValue: Number(newCoupon.discountValue),
      categoryIds:
        newCoupon.applicableTo === "category" ? newCoupon.categoryIds : [],
      productIds:
        newCoupon.applicableTo === "product" ? newCoupon.productIds : [],
    };

    try {
      await axios.post(`${API_BASE_URL}/api/coupons/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Cupón creado exitosamente!");
      fetchCoupons();
    } catch (error) {
      console.error("Error creando cupón", error);
      alert("No se pudo crear el cupón");
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/coupons/${couponId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCoupons();
    } catch (error) {
      console.error("Error cambiando estado del cupón", error);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error eliminando cupón", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cupones de Descuento</h1>
        <p className="text-gray-600 mt-2">Gestiona los cupones de descuento de tu tienda</p>
      </div>

      {/* Formulario de creación */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Cupón</h2>
        <form onSubmit={handleCreateCoupon} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input
                type="text"
                placeholder="Ej: VERANO2024"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Valor de Descuento</label>
              <input
                type="number"
                placeholder="Ingresa el valor"
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto Fijo (COP)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
              <input
                type="date"
                value={newCoupon.expirationDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expirationDate: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Aplicar a</label>
            <select
              value={newCoupon.applicableTo}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
                  applicableTo: e.target.value,
                  categoryIds: [],
                  productIds: [],
                })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="store">Toda la tienda</option>
              <option value="category">Categorías específicas</option>
              <option value="product">Productos específicos</option>
            </select>
          </div>

          {newCoupon.applicableTo === "category" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Selecciona Categorías</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.isArray(categories) && categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={newCoupon.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        const selected = newCoupon.categoryIds.includes(category.id)
                          ? newCoupon.categoryIds.filter((id) => id !== category.id)
                          : [...newCoupon.categoryIds, category.id];
                        setNewCoupon({ ...newCoupon, categoryIds: selected });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {newCoupon.applicableTo === "product" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Selecciona Productos</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.isArray(products) && products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      value={product.id}
                      checked={newCoupon.productIds.includes(product.id)}
                      onChange={(e) => {
                        const selected = newCoupon.productIds.includes(product.id)
                          ? newCoupon.productIds.filter((id) => id !== product.id)
                          : [...newCoupon.productIds, product.id];
                        setNewCoupon({ ...newCoupon, productIds: selected });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Crear Cupón</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de cupones */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Cupones Existentes</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando cupones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplicado a</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiración</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(coupons) && coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {coupon.discountValue}
                        {coupon.discountType === "PERCENTAGE" ? "%" : " COP"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {Array.isArray(coupon.categories) && coupon.categories.length > 0 ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            📦 Categorías
                          </span>
                          <div className="mt-1 text-sm text-gray-500">
                            {Array.isArray(coupon.categories) && coupon.categories.map((category) => (
                              <span key={category.id} className="inline-block mr-2">
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : Array.isArray(coupon.products) && coupon.products.length > 0 ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🛍 Productos
                          </span>
                          <div className="mt-1 text-sm text-gray-500">
                            {Array.isArray(coupon.products) && coupon.products.map((product) => (
                              <span key={product.id} className="inline-block mr-2">
                                {product.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🏪 Toda la tienda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {new Intl.DateTimeFormat("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(new Date(coupon.expirationDate))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🟢 Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔴 Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white ${
                          coupon.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        } transition-colors duration-200 mr-2`}
                      >
                        {coupon.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
