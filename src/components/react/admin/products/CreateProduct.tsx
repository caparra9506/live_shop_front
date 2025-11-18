import { useEffect, useState } from "react";
import axios from "axios";
import { FaUpload } from "react-icons/fa";
import { API_BASE_URL } from '@config/api';

interface CreateProductProps {
  onClose: () => void;
  onProductCreated?: () => void;
}

export default function CreateProduct({ onClose, onProductCreated }: CreateProductProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: "", // Solo almacena el ID, no un objeto
    inStock: true,
    stock: 0,
    colors: [] as { name: string; hexCode: string }[],
    sizes: [] as { name: string }[],
    weight: null,
    length: null,
    width: null,
    height: null,
  });

  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  useEffect(() => {
    fetchCategories();
    setIsModalOpen(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddColor = () => {
    if (colorInput.trim()) {
      setNewProduct((prevState) => ({
        ...prevState,
        colors: [
          ...prevState.colors,
          { name: colorInput.trim(), hexCode: "#000000" }, // 🔹 HexCode por defecto
        ],
      }));
      setColorInput("");
    }
  };

  const handleAddSize = () => {
    if (sizeInput.trim()) {
      setNewProduct((prevState) => ({
        ...prevState,
        sizes: [...prevState.sizes, { name: sizeInput.trim() }],
      }));
      setSizeInput("");
    }
  };

  const handleRemoveColor = (index: number) => {
    setNewProduct((prevState) => ({
      ...prevState,
      colors: prevState.colors.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveSize = (index: number) => {
    setNewProduct((prevState) => ({
      ...prevState,
      sizes: prevState.sizes.filter((_, i) => i !== index),
    }));
  };

  // Manejar la selección del archivo
  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/products/file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("📸 Imagen subida:", res.data); // 🔍 Verifica la respuesta en consola

      if (res.data.url) {
        setNewProduct((prev) => ({ ...prev, imageUrl: res.data.url }));
      } else {
        throw new Error("No se recibió la URL de la imagen");
      }
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };
  // Función para subir la imagen al backend y guardar la URL
  const uploadImage = async () => {
    if (!imageFile) {
      alert("Selecciona una imagen antes de subir.");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      setUploading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/products/file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Actualizar el estado del producto con la nueva URL de la imagen
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        imageUrl: res.data.url,
      }));

      alert("Imagen subida con éxito!");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Formatear los datos antes de enviarlos
    const formattedProduct = {
      ...newProduct,
      price: parseFloat(newProduct.price) || 0,
      countStock: parseInt(newProduct.stock.toString()) || 0,
      categoryId: parseInt(newProduct.categoryId.toString()), // Convertir a número
      inStock: newProduct.inStock,
      weight: newProduct.weight ? parseFloat(newProduct.weight) : null,
      length: newProduct.length ? parseFloat(newProduct.length) : null,
      width: newProduct.width ? parseFloat(newProduct.width) : null,
      height: newProduct.height ? parseFloat(newProduct.height) : null,
      colors: newProduct.colors.map((color) => ({
        name: color.name || "", // 🔹 Evita `undefined`
        hexCode: color.hexCode || "#000000",
      })),
      sizes: newProduct.sizes.map((size) => ({
        name: size.name || "", // 🔹 Evita `undefined`
      })),
    };

    console.log("formattedProduct ", formattedProduct);

    try {
      await axios.post(`${API_BASE_URL}/api/products`, formattedProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccessMessage("Producto agregado con éxito.");
      if (onProductCreated) {
        onProductCreated();
      }
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      setErrorMessage(
        "Hubo un error al agregar el producto. Verifica los campos."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // ✅ Formatear correctamente los productos con variantes
      const formattedProducts = res.data.map((product: any) => ({
        ...product,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          stock: variant.stock,
          color: variant.color
            ? { name: variant.color.name, hexCode: variant.color.hexCode }
            : null,
          size: variant.size ? { name: variant.size.name } : null,
        })),
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl relative max-h-[90vh] overflow-y-auto">
            {/* Header fijo */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 z-10">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl transition-colors"
                aria-label="Cerrar modal"
              >
                ×
              </button>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Agregar Producto
                </h2>
                <p className="text-gray-600 mt-2">Complete los detalles del producto</p>
              </div>
            </div>

            <div className="p-8">
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 📌 Columna Izquierda: Datos principales */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nombre del producto"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                      <input
                        type="text"
                        name="code"
                        placeholder="Código único"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                      <input
                        type="number"
                        name="price"
                        placeholder="$0.00"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* 📌 Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="description"
                      placeholder="Describe el producto..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px]"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        setNewProduct(prev => ({ ...prev, description: e.target.value }))
                      }
                      required
                    />
                  </div>

                  {/* 📌 Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      name="categoryId"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 📌 Disponibilidad y Stock */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={newProduct.inStock}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-gray-700 font-medium">Disponible en stock</label>
                    </div>
                    {newProduct.inStock && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="Cantidad disponible"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 📌 Columna Derecha: Imagen y Variantes */}
                <div className="space-y-6">
                  {/* 📌 Subir Imagen */}
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Imagen del Producto
                    </label>
                    <div className="mb-4">
                      {newProduct.imageUrl ? (
                        <div className="relative group mx-auto w-64 h-64">
                          <img
                            src={newProduct.imageUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">Vista previa</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">No hay imagen seleccionada</p>
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                      <FaUpload className="text-lg" />
                      <span>Seleccionar Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    {uploading && (
                      <div className="flex items-center justify-center text-blue-600 mt-2">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Subiendo imagen...
                      </div>
                    )}
                  </div>

                  {/* 📌 Dimensiones */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dimensiones y Peso
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Largo (cm)</label>
                        <input
                          type="number"
                          name="length"
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ancho (cm)</label>
                        <input
                          type="number"
                          name="width"
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Alto (cm)</label>
                        <input
                          type="number"
                          name="height"
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 📌 Colores y Tallas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Colores */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colores Disponibles</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          placeholder="Agregar color..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={handleAddColor}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {newProduct.colors.map((color, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {color.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(index)}
                              className="ml-1 text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tallas */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tallas Disponibles</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          placeholder="Agregar talla..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={handleAddSize}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {newProduct.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {size.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(index)}
                              className="ml-1 text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📌 Botón Guardar */}
                <div className="col-span-1 lg:col-span-2 sticky bottom-0 bg-white border-t border-gray-200 py-4 px-8 -mx-8">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Producto"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
