import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@config/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      console.log('📊 Fetching sales data from:', `${API_BASE_URL}/api/sales/data`);
      const res = await axios.get(`${API_BASE_URL}/api/sales/data`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      console.log('📊 Raw sales data response:', res.data);
      
      // Verificar que la respuesta sea un array
      const salesData = Array.isArray(res.data) ? res.data : [];
      
      // Transformar la data para que coincida con el formato esperado
      const transformedData = salesData.map((item: any) => ({
        mes: item.month || 'Sin datos',
        ganancia: Number(item.revenue) || 0,
        visitantes: Number(item.visitors) || 0,
      }));
  
      console.log('📊 Transformed sales data:', transformedData);
      setData(transformedData);
    } catch (error) {
      console.error("❌ Error fetching sales data:", error);
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      } else if (error.request) {
        console.error("❌ No response received:", error.request);
      } else {
        console.error("❌ Error message:", error.message);
      }
      // Establecer datos vacíos en caso de error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center">Cargando datos...</p>;

  if (data.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de ventas disponibles.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ganancia" stroke="#2563eb" strokeWidth={2} />
        <Line type="monotone" dataKey="visitantes" stroke="#374151" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
