import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import HeaderLogin from "./HeaderLogin";
import { API_BASE_URL } from '@config/api';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", username: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        credentials
      );

      if (!res.data) {
        toast.error("No se recibió un token válido");
        return;
      }

      localStorage.setItem("token", res.data);
      toast.success("Inicio de sesión exitoso 🎉");

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1200);
    } catch (error) {
      console.error("Error en el login:", error);
      toast.error("Credenciales incorrectas 😢");
    }
  };

  return (
    <>
      <HeaderLogin />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Bienvenido de nuevo!
              </h2>
              <p className="text-blue-100 text-sm">
                Inicia sesión para acceder a tu cuenta
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                      name="username"
                      placeholder="usuario@ejemplo.com"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
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
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                Crear cuenta gratis
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
