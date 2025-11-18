import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';
import { FaUpload } from "react-icons/fa";
import Header from "./Header";

export default function CreateStoreForm({ onStoreCreated }) {
  const [storeData, setStoreData] = useState({
    name: "",
    description: "",
    logo: "",
    countryId: "", // 🔥 Agregado
    departmentId: "", // 🔥 Agregado
    cityId: "",
    documentType: "",
    document: "",
    address: "",
    phone: "",
  });

  const documentTypes = ["CC", "CE", "RUT", "NIT"];
  const [file, setFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [newProduct, setNewProduct] = useState<{ imageUrl?: string }>({});

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/location/countries`)
      .then((res) => setCountries(res.data))
      .catch(() => console.error("Error cargando países"));
  }, []);

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

  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/stores/file`,
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
        setStoreData((prev) => ({ ...prev, logo: res.data.url }));
      } else {
        throw new Error("No se recibió la URL de la imagen");
      }
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(storeData).some((val) => !val)) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/stores/create`, storeData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Tienda creada con éxito");
      onStoreCreated();
    } catch {
      setError("Error al crear la tienda");
    }
  };

  return (
    <>
      <Header />
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-5xl">
          <h2 className="text-4xl font-black text-center text-[#1a1a40] mb-10">
            Crear Tienda
          </h2>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Nombre de la tienda"
                required
                className="p-3 border rounded-xl shadow-sm"
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <input
                type="text"
                name="description"
                placeholder="Descripción breve"
                required
                className="p-3 border rounded-xl shadow-sm"
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                name="documentType"
                className="p-3 border rounded-xl shadow-sm"
                value={storeData.documentType}
                onChange={(e) => handleChange("documentType", e.target.value)}
                required
              >
                <option value="">Tipo de documento</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="document"
                placeholder="Número de documento"
                required
                className="p-3 border rounded-xl shadow-sm"
                onChange={(e) => handleChange("document", e.target.value)}
              />
            </div>

            {/* Dirección y teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="address"
                placeholder="Dirección"
                required
                className="p-3 border rounded-xl shadow-sm"
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <input
                type="text"
                name="phone"
                placeholder="Teléfono"
                required
                className="p-3 border rounded-xl shadow-sm"
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select
                className="p-3 border rounded-xl shadow-sm"
                value={storeData.countryId}
                onChange={(e) => handleChange("countryId", e.target.value)}
              >
                <option value="">País</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>

              <select
                className="p-3 border rounded-xl shadow-sm"
                value={storeData.departmentId}
                onChange={(e) => handleChange("departmentId", e.target.value)}
                disabled={!storeData.countryId}
              >
                <option value="">Departamento</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>

              <select
                className="p-3 border rounded-xl shadow-sm"
                value={storeData.cityId}
                onChange={(e) => handleChange("cityId", e.target.value)}
                disabled={!storeData.departmentId}
              >
                <option value="">Ciudad</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Logo de la tienda
              </label>
              <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-full flex items-center space-x-2 hover:bg-blue-700 transition">
                <FaUpload />
                <span>{file ? file.name : "Seleccionar archivo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <p className="text-sm text-blue-500 mt-2">Subiendo imagen...</p>
              )}

              {storeData.logo && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={storeData.logo}
                    alt="Logo tienda"
                    className="w-32 h-32 object-cover rounded-lg shadow border"
                  />
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-md hover:opacity-90 transition"
            >
              Crear tienda
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
