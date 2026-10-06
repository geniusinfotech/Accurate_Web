import { BillData } from "./bill-html";

export async function shareBillViaWhatsApp(bill: BillData): Promise<void> {
  const { billNumber, partyName, partyPhone, total } = bill;
  
  if (!partyPhone) {
    throw new Error("Party phone number is required for WhatsApp sharing");
  }

  const message = `Dear ${partyName},\n\nYour bill ${billNumber} for ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} is ready.\n\nThank you for your business!\nAccurate Liquid`;
  
  const encodedMessage = encodeURIComponent(message);
  const phone = partyPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/91${phone}?text=${encodedMessage}`;
  
  if (typeof window !== "undefined") {
    window.open(whatsappUrl, "_blank");
  }
}