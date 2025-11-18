import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [newCategory, setNewCategory] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({
      ...newCategory,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.post(`${API_BASE_URL}/api/categories`, newCategory, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccessMessage("Categoría agregada con éxito.");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage("");
      }, 2000);
      fetchCategories(); // Actualizar lista de categorías
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setErrorMessage("Hubo un error al agregar la categoría. Verifica los campos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Cargando categorías...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Categorías</h1>
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded my-4"
        onClick={() => setIsModalOpen(true)}
      >
        Agregar Categoría
      </button>

      {/* Modal para agregar categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Cerrar modal"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Agregar Categoría</h2>
            
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Nombre de la categoría" className="w-full p-2 border rounded" onChange={handleChange} required />
              <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded w-full" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Categoría"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Listado de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="text-gray-600 text-sm">Tienda: {category.store.name}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">
            No hay categorías disponibles.
          </p>
        )}
      </div>
    </div>
  );
}
