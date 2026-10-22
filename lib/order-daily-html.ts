export interface DailyOrderBillItem {
  name: string;
  quantity: number;
  price: number;
}

export interface DailyOrderBillOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  items: DailyOrderBillItem[];
  subtotal: number;
  totalAmount: number;
}

export interface DailyOrderBill {
  dateLabel: string;
  orders: DailyOrderBillOrder[];
}

export function orderDailyHtmlString(bill: DailyOrderBill): string {
  const { dateLabel, orders } = bill;
  
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);

  const orderHtml = orders.map((order, i) => {
    const itemsHtml = order.items.map((item) => `
      <tr>
        <td style="padding: 6px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 6px; border: 1px solid #ddd; text-align:center">${item.quantity}</td>
        <td style="padding: 6px; border: 1px solid #ddd; text-align:right">${formatCurrency(item.price)}</td>
        <td style="padding: 6px; border: 1px solid #ddd; text-align:right">${formatCurrency(item.quantity * item.price)}</td>
      </tr>
    `).join("");

    return `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
          <strong>Order #${order.orderNumber}</strong>
          <span>${formatCurrency(order.totalAmount)}</span>
        </div>
        <div style="font-size: 11px; margin-bottom: 10px;">
          <div><strong>Customer:</strong> ${order.customerName}</div>
          <div><strong>Phone:</strong> ${order.phone}</div>
          <div><strong>Address:</strong> ${order.address}, ${order.pincode}</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align:left">Item</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align:center">Qty</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align:right">Rate</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 5px; font-weight: bold;">
          Order Subtotal: ${formatCurrency(order.subtotal)}
        </div>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Daily Orders - ${dateLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 5px 0; font-size: 12px; color: #666; }
    .summary { margin-top: 30px; text-align: right; font-size: 12px; }
    .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .summary-row.total { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
    @media print { 
      .no-print { display: none; }
      .container { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Accurate Liquid</h1>
      <p>Varachha, Surat, Gujarat</p>
      <p>Daily Orders Report</p>
      <p style="font-size: 14px; font-weight: bold;">${dateLabel}</p>
    </div>

    <div class="orders">
      ${orderHtml || "<p style='text-align:center;color:#666;'>No orders for this date</p>"}
    </div>

    <div class="summary">
      <div class="summary-row"><span>Total Orders</span><span>${orders.length}</span></div>
      <div class="summary-row total"><span>Total Amount</span><span>${formatCurrency(orders.reduce((s, o) => s + o.totalAmount, 0))}</span></div>
    </div>
  </div>
</body>
</html>`;
}