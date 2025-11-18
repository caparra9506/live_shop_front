import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

export default function StoreLogos() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/stores`).then((res) => setStores(res.data));
  }, []);

  return (
    <section className="bg-gray-100 py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-extrabold mb-12">
          La confianza de los{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
            mejores
          </span>
        </h3>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-12 animate-slide whitespace-nowrap">
            {[...stores, ...stores].map((store, index) => (
              <img
                key={`logo-${index}`}
                src={store.logo}
                alt={store.name}
                title={store.name}
                className="h-20 w-auto max-w-[180px] object-contain rounded-lg shadow-md bg-white p-3 inline-block"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animación CSS */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slide {
          animation: slide 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
