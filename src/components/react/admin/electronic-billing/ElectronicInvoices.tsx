import React, { useState, useEffect } from 'react';
import { Card } from '../../../ui/card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../../ui/button';
import { API_BASE_URL } from '@config/api';

interface ElectronicInvoice {
  id: number;
  factusId: string;
  cufe: string;
  invoiceNumber: string;
  prefix: string;
  status: 'PENDING' | 'GENERATED' | 'VALIDATED' | 'FAILED';
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  pdfUrl: string;
  xmlUrl: string;
  createdAt: string;
  sale: {
    id: number;
    totalAmount: number;
  };
}

const ElectronicInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      // Obtener facturas electrónicas de la tienda
      const response = await fetch(`${API_BASE_URL}/api/electronic-billing/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error obteniendo facturas electrónicas');
      }

      const data = await response.json();
      setInvoices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching electronic invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (saleId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/api/sales/generate-electronic-invoice/${saleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error generando factura electrónica');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Factura electrónica generada exitosamente');
        fetchInvoices(); // Refrescar lista
      } else {
        throw new Error(data.message || 'Error generando factura');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error generando factura');
      console.error('Error generating invoice:', err);
    }
  };

  const validateInvoice = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/api/electronic-billing/invoice/${invoiceId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error validando factura electrónica');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Factura electrónica validada exitosamente');
        fetchInvoices(); // Refrescar lista
      } else {
        throw new Error(data.message || 'Error validando factura');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error validando factura');
      console.error('Error validating invoice:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      GENERATED: { color: 'bg-blue-100 text-blue-800', text: 'Generada' },
      VALIDATED: { color: 'bg-green-100 text-green-800', text: 'Validada' },
      FAILED: { color: 'bg-red-100 text-red-800', text: 'Fallida' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>{error}</p>
          <Button onClick={fetchInvoices} className="mt-4">
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Facturas Electrónicas</h2>
        <Button onClick={fetchInvoices}>
          🔄 Actualizar
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">No hay facturas electrónicas</h3>
            <p>Las facturas se generan automáticamente cuando se confirman los pagos.</p>
            <p className="text-sm mt-2">Asegúrate de que la facturación electrónica esté habilitada en la configuración de tu tienda.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Factura #{invoice.invoiceNumber || invoice.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {invoice.prefix && `${invoice.prefix}-`}
                    Venta #{invoice.sale.id}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="text-gray-900">{invoice.customerName}</p>
                  <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Monto</label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${invoice.totalAmount.toLocaleString()} COP
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha</label>
                  <p className="text-gray-900">
                    {new Date(invoice.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>

              {invoice.cufe && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600">CUFE</label>
                  <p className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                    {invoice.cufe}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {invoice.status === 'GENERATED' && (
                  <Button 
                    onClick={() => validateInvoice(invoice.id)}
                    variant="outline"
                    size="sm"
                  >
                    ✅ Validar
                  </Button>
                )}
                
                {invoice.pdfUrl && (
                  <Button 
                    onClick={() => window.open(invoice.pdfUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    📄 Ver PDF
                  </Button>
                )}
                
                {invoice.xmlUrl && (
                  <Button 
                    onClick={() => window.open(invoice.xmlUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    📁 Ver XML
                  </Button>
                )}

                {invoice.factusId && (
                  <span className="text-xs text-gray-500 self-center">
                    ID FACTUS: {invoice.factusId}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectronicInvoices;