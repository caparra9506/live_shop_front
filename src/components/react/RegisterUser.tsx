import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from '@config/api';
import { AiOutlineMail, AiOutlineUser, AiOutlineLock } from "react-icons/ai";
import Header from "./Header";

export default function RegisterUser() {
  const [storeData, setStoreData] = useState({
    name: "",
    ownerEmail: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreData({ ...storeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/api/users/create`, {
        name: storeData.name,
        role: "admin",
        email: storeData.ownerEmail,
        password: storeData.password,
      });

      toast.success("Tienda registrada con éxito ✅");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar el usuario 😢");
    }
  };

  return (
    <>
      <Header />
      <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Únete a LiveShop!
              </h2>
              <p className="text-purple-100 text-sm">
                Crea tu cuenta y comienza a vender en línea
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineUser className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Tu nombre completo"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="email"
                      name="ownerEmail"
                      placeholder="usuario@ejemplo.com"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineLock className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 8 caracteres"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear cuenta gratis
                </button>

                {/* Terms */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Al crear tu cuenta, aceptas nuestros{" "}
                    <a href="#" className="text-purple-600 hover:underline">
                      Términos de Servicio
                    </a>{" "}
                    y{" "}
                    <a href="#" className="text-purple-600 hover:underline">
                      Política de Privacidad
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors">
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
