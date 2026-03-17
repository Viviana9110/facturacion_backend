import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoicePDF = (bill) => {

  const filePath = `./factura-${bill.number}.pdf`;

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("FACTURA ELECTRÓNICA", { align: "center" });

  doc.moveDown();

  doc.fontSize(12).text(`Número de factura: ${bill.number}`);
  doc.text(`CUFE: ${bill.cufe}`);
  doc.text(`Total: $${bill.total}`);

  doc.moveDown();

  doc.text("Validación DIAN:");
  doc.text(bill.qr);

  doc.end();

  return filePath;
};