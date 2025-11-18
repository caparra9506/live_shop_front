import { Toaster } from "react-hot-toast";

export default function ToasterComponent() {
  return <Toaster position="top-right" toastOptions={{ duration: 4000 }} />;
}