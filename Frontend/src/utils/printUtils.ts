export type PrintFormat = 'a4' | 'ticket';

interface PrintData {
  type: 'venta' | 'compra';
  id: string | number;
  date: string;
  entityName: string; // Cliente o Proveedor
  methodName: string;
  total: number;
  details: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

export const printInvoice = async (data: PrintData, format: PrintFormat) => {
  // Abrimos la ventana sincrónicamente para evitar el bloqueador de pop-ups del navegador
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes (pop-ups) para imprimir.');
    return;
  }
  printWindow.document.write('<div style="font-family: sans-serif; padding: 20px;">Preparando formato de impresión...</div>');

  // Obtenemos las configuraciones de la empresa
  let settings = {
    business_name: 'Dashboard Deportivo',
    legal_id: '',
    address: '',
    phone: '',
    invoice_footer_message: '¡Gracias por su compra!'
  };

  try {
    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_URL}/settings`);
    const resData = await response.json();
    if (resData.success && resData.data) {
      settings = resData.data;
    }
  } catch (error) {
    console.error('Error al obtener la configuración de impresión', error);
  }

  const isTicket = format === 'ticket';
  
  // A4 vs Ticket dimensions
  const width = isTicket ? '300px' : '100%';
  const margin = isTicket ? '0 auto' : '0';
  const fontSize = isTicket ? '12px' : '14px';
  const headerSize = isTicket ? '16px' : '24px';

  // Format date correctly
  const dateObj = new Date(data.date);
  const formattedDate = !isNaN(dateObj.getTime()) 
    ? new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
    : '-';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura #${data.id}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: ${width};
          margin: ${margin};
          font-size: ${fontSize};
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0 0 5px 0;
          font-size: ${headerSize};
          text-transform: uppercase;
        }
        .header p {
          margin: 0;
          color: #333;
        }
        .info {
          margin-bottom: 20px;
        }
        .info p {
          margin: 2px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          text-align: left;
          padding: 5px 0;
          border-bottom: 1px solid #ddd;
        }
        th {
          font-weight: bold;
          border-bottom: 2px solid #000;
        }
        .text-right {
          text-align: right;
        }
        .total-section {
          border-top: 2px dashed #000;
          padding-top: 10px;
          text-align: right;
        }
        .total-amount {
          font-size: ${isTicket ? '16px' : '20px'};
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #555;
        }
        @media print {
          @page { margin: 0; }
          body { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.business_name || 'Dashboard Deportivo'}</h1>
          ${settings.legal_id ? `<p>RIF/NIT: ${settings.legal_id}</p>` : ''}
          ${settings.address ? `<p>${settings.address}</p>` : ''}
          ${settings.phone ? `<p>Tel: ${settings.phone}</p>` : ''}
          <br/>
          <p>Factura de ${data.type === 'venta' ? 'Venta' : 'Compra'} #${data.id}</p>
        </div>
        
        <div class="info">
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>${data.type === 'venta' ? 'Cliente' : 'Proveedor'}:</strong> ${data.entityName}</p>
          <p><strong>Método de Pago:</strong> ${data.methodName}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th class="text-right">Cant</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${data.details.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">$${Number(item.price).toFixed(2)}</td>
                <td class="text-right">$${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p>TOTAL ${data.type === 'venta' ? 'COBRADO' : 'PAGADO'}</p>
          <p class="total-amount">$${Number(data.total).toFixed(2)}</p>
        </div>

        <div class="footer">
          <p>${settings.invoice_footer_message || 'Gracias por su compra'}</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 200);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
