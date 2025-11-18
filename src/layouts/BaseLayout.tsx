// layouts/BaseLayout.tsx
import * as React from "react";
import { Toaster } from "react-hot-toast";

export default function BaseLayout({
  children,
  title = "LiveShop",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <main className="p-4 md:p-6 lg:p-8">{children}</main>
      <footer className="bg-gray-900 text-white text-center p-4 md:p-6">
        © 2025 LiveShop. Todos los derechos reservados.
      </footer>
    </div>
  );
}
