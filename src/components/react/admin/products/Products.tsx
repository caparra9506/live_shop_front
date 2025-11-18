import { useEffect, useState } from "react";
import axios from "axios";
import CreateProduct from "./CreateProduct";
import { API_BASE_URL } from '@config/api';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
  inStock: boolean;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
  variants: any[];
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductsResponse {
  data: Product[];
  pagination: PaginationInfo;
}

interface Category {
  id: number;
  name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  
  useEffect(() => {
    fetchProducts(1);
    fetchCategories();
  }, []);

  // Debug: verificar cuando cambia el estado products
  useEffect(() => {
    console.log('🔍 USEEFFECT - Estado products cambió:', products.length, products);
  }, [products]);

  // Debounce para búsqueda - espera 500ms después de que el usuario deje de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filtros instantáneos (no necesitan debounce)
  useEffect(() => {
    fetchProducts(1);
  }, [categoryFilter, stockFilter, pagination.limit]);

  const fetchProducts = async (page: number = 1, customLimit?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(stockFilter && { inStock: stockFilter })
      });

      console.log('🔍 Parámetros enviados al backend productos:', {
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        search: searchQuery || 'vacío',
        category: categoryFilter || 'vacío',
        inStock: stockFilter || 'vacío'
      });

      const res = await axios.get(`${API_BASE_URL}/api/products/me?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log('🔍 RESPUESTA COMPLETA del backend:', res.data);
      console.log('🔍 TIPO de respuesta:', typeof res.data);
      console.log('🔍 ES ARRAY?:', Array.isArray(res.data));

      // Manejar respuesta con paginación o array directo
      if (Array.isArray(res.data)) {
        console.log('🔍 CASO 1 - Array directo, productos:', res.data.length);
        setProducts(res.data);
        setPagination({
          page: 1,
          limit: res.data.length,
          total: res.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        console.log('🔍 CASO 2 - Objeto con data, productos:', res.data.data?.length || 0);
        console.log('🔍 Data array:', res.data.data);
        console.log('🔍 Paginación:', res.data.pagination);
        const response: ProductsResponse = res.data;
        const productsData = response.data || [];
        console.log('🔍 Setting products:', productsData);
        setProducts(productsData);
        setPagination(response.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        console.log('🔍 CASO 3 - Formato no reconocido');
        setProducts([]);
      }
      
      console.log('🔍 FINAL - Estado products actualizado, cantidad:', products.length);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Solicitando categorías...');
      const res = await axios.get(`${API_BASE_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log('🔍 Respuesta de categorías:', res.data);
      setCategories(res.data);
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
      console.error("❌ Error detallado:", error.response?.data || error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchProducts(1, newLimit);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStockFilter("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Productos</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-xl">+</span> Agregar Producto
        </button>
      </div>
      
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 transition-all duration-200 hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Productos</h3>
          <p className="text-3xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg rounded-xl p-6 border border-green-200 transition-all duration-200 hover:shadow-xl">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Disponibles</h3>
          <p className="text-3xl font-bold text-green-800">{products.filter(p => p.stock > 0).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 shadow-lg rounded-xl p-6 border border-red-200 transition-all duration-200 hover:shadow-xl">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Sin Stock</h3>
          <p className="text-3xl font-bold text-red-800">{products.filter(p => p.stock === 0).length}</p>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, código, descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Con stock</option>
              <option value="false">Sin stock</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      
      {/* Vista desktop: Tabla */}
      <div className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Foto</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Información</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Detalles</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Variantes</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Columna de Imagen */}
                    <td className="px-4 py-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded-lg shadow-sm" 
                      />
                    </td>

                    {/* Columna de Información */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">Código: {product.code}</p>
                        <p className="text-xs text-gray-500">Categoría: {product.category.name}</p>
                      </div>
                    </td>

                    {/* Columna de Detalles */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-800">
                          ${new Intl.NumberFormat('es-CO').format(product.price)}
                        </p>
                        <div className="text-xs text-gray-600">
                          <p>Peso: {product.weight}kg</p>
                          <p>{product.length}×{product.width}×{product.height}cm</p>
                        </div>
                      </div>
                    </td>

                    {/* Columna de Variantes */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {product.variants && product.variants.length > 0 ? (
                          <>
                            {product.variants.slice(0, 2).map((variant) => (
                              <div key={variant.id} className="flex items-center gap-1">
                                {variant.color && (
                                  <div 
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: variant.color.hexCode }}
                                    title={variant.color.name}
                                  />
                                )}
                                {variant.size && (
                                  <span className="text-xs text-gray-600">
                                    {variant.size.name}
                                  </span>
                                )}
                              </div>
                            ))}
                            {product.variants.length > 2 && (
                              <span className="text-xs text-gray-400">+{product.variants.length - 2} más</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Sin variantes</span>
                        )}
                      </div>
                    </td>

                    {/* Columna de Estado */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                        </span>
                        <p className="text-xs text-gray-500">
                          {product.inStock ? 'Disponible' : 'Sin stock'}
                        </p>
                      </div>
                    </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Vista mobile: Cards */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-start space-x-4">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Código: {product.code}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-gray-800">
                      ${new Intl.NumberFormat('es-CO').format(product.price)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium
                      ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock} unidades
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <span className="text-sm font-medium text-gray-800">{product.category.name}</span>
                  </div>

                  {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Variantes:</span>
                      <div className="flex space-x-1">
                        {product.variants.slice(0, 3).map((variant) => (
                          <div key={variant.id} className="flex items-center space-x-1">
                            {variant.color && (
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.color.hexCode }}
                                title={variant.color.name}
                              />
                            )}
                            {variant.size && (
                              <span className="text-xs px-1 py-0.5 bg-gray-100 rounded text-gray-700">
                                {variant.size.name}
                              </span>
                            )}
                          </div>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-xs text-gray-400">+{product.variants.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      
      {/* Paginación */}
      {!loading && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-sm text-gray-600">
              Mostrando {products.length} de {pagination.total} productos
              (Página {pagination.page} de {pagination.totalPages})
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Por página:</label>
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const page = Math.max(1, pagination.page - 2) + i;
                if (page > pagination.totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron productos con los filtros seleccionados.</p>
        </div>
      )}

      {/* Modal para agregar producto */}
      {isModalOpen && (
        <CreateProduct 
          onClose={() => setIsModalOpen(false)} 
          onProductCreated={() => fetchProducts(pagination.page)}
        />
      )}
    </div>
  );
}
