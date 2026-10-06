export interface BillData {
  billNumber: string;
  billDate: string;
  partyName: string;
  partyPhone?: string;
  partyAddress?: string;
  partyGstin?: string;
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  roundOff: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode?: string;
  notes?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyGstin?: string;
  companyEmail?: string;
}

export interface BillItem {
  name: string;
  hsn?: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
  amount: number;
}

export function billHtmlString(bill: BillData): string {
  const { billNumber, billDate, partyName, partyPhone, partyAddress, partyGstin,
    items, subtotal, cgst, sgst, igst, discount, roundOff, total, paidAmount, dueAmount,
    paymentMode, notes, companyName, companyAddress, companyPhone, companyGstin, companyEmail } = bill;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);

  const itemRows = items.map((item, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${item.name}${item.hsn ? `<br><small>HSN: ${item.hsn}</small>` : ""}</td>
      <td style="text-align:center">${item.qty} ${item.unit}</td>
      <td style="text-align:right">${formatCurrency(item.rate)}</td>
      <td style="text-align:right">${item.discount ? formatCurrency(item.discount) : "-"}</td>
      <td style="text-align:right">${formatCurrency(item.amount)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bill ${billNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; color: #333; }
    .bill-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .company-info h2 { margin: 0; font-size: 18px; color: #1a1a1a; }
    .company-info p { margin: 2px 0; font-size: 10px; color: #666; }
    .bill-info { text-align: right; }
    .bill-info h3 { margin: 0; font-size: 16px; }
    .bill-info p { margin: 2px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px; }
    th { background: #f5f5f5; font-weight: bold; }
    .totals { float: right; width: 300px; }
    .totals table { width: 100%; }
    .totals td { padding: 4px 8px; }
    .totals .total-row { font-weight: bold; font-size: 12px; background: #f5f5f5; }
    .footer { margin-top: 30px; font-size: 10px; color: #666; }
    .footer p { margin: 4px 0; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="bill-container">
    <div class="header">
      <div class="company-info">
        <h2>${companyName || "Accurate Liquid"}</h2>
        <p>${companyAddress || "Varachha, Surat, Gujarat"}</p>
        <p>Phone: ${companyPhone || "+91-XXXXXXXXXX"} | Email: ${companyEmail || "info@accurate.com"}</p>
        <p>GSTIN: ${companyGstin || "24XXXXXXXXXXXXX"}</p>
      </div>
      <div class="bill-info">
        <h3>TAX INVOICE</h3>
        <p>Bill No: ${billNumber}</p>
        <p>Date: ${billDate}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <strong>Bill To:</strong> ${partyName}<br>
      ${partyAddress ? `Address: ${partyAddress}<br>` : ""}
      ${partyPhone ? `Phone: ${partyPhone}<br>` : ""}
      ${partyGstin ? `GSTIN: ${partyGstin}<br>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 5%">#</th>
          <th style="width: 40%">Description</th>
          <th style="width: 15%">Qty</th>
          <th style="width: 15%">Rate</th>
          <th style="width: 10%">Disc</th>
          <th style="width: 15%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr><td>Subtotal</td><td style="text-align:right">${formatCurrency(subtotal)}</td></tr>
        ${discount ? `<tr><td>Discount</td><td style="text-align:right">-${formatCurrency(discount)}</td></tr>` : ""}
        ${cgst ? `<tr><td>CGST (${(cgst / subtotal * 100).toFixed(0)}%)</td><td style="text-align:right">${formatCurrency(cgst)}</td></tr>` : ""}
        ${sgst ? `<tr><td>SGST (${(sgst / subtotal * 100).toFixed(0)}%)</td><td style="text-align:right">${formatCurrency(sgst)}</td></tr>` : ""}
        ${igst ? `<tr><td>IGST (${(igst / subtotal * 100).toFixed(0)}%)</td><td style="text-align:right">${formatCurrency(igst)}</td></tr>` : ""}
        ${roundOff ? `<tr><td>Round Off</td><td style="text-align:right">${formatCurrency(roundOff)}</td></tr>` : ""}
        <tr class="total-row"><td>Total</td><td style="text-align:right">${formatCurrency(total)}</td></tr>
        ${paidAmount ? `<tr><td>Paid</td><td style="text-align:right">${formatCurrency(paidAmount)}</td></tr>` : ""}
        ${dueAmount ? `<tr><td>Due</td><td style="text-align:right">${formatCurrency(dueAmount)}</td></tr>` : ""}
      </table>
    </div>

    <div style="clear: both; margin-top: 20px;">
      ${paymentMode ? `<p><strong>Payment Mode:</strong> ${paymentMode}</p>` : ""}
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice. No signature required.</p>
    </div>
  </div>
</body>
</html>`;
}