import PDFDocument from "pdfkit";

/*
 =============================================
   GENERAR PDF EN BASE64
 =============================================
*/
export const generateInvoicePDF = (bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      let buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        const base64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
        resolve(base64);
      });

      /* ========== ENCABEZADO ========== */
      doc
        .fontSize(22)
        .fillColor("#000000")
        .text("FACTURA ELECTRÓNICA", { align: "center" });

      doc.moveDown(1.5);

      /* ========== DATOS DE FACTURA ========== */
      doc.fontSize(12).text(`Número de factura: ${bill.number}`);
      doc.text(`CUFE: ${bill.cufe}`);
      doc.text(`Total: $${Number(bill.total).toLocaleString()}`);

      doc.moveDown();

      /* ========== QR O LINK DE VALIDACIÓN ========== */
      doc.fontSize(12).text("Validación DIAN:", { underline: true });

      if (bill.qr?.startsWith("http")) {
        // Caso QR como URL (la mayoría de veces)
        doc.fillColor("blue").text(bill.qr, { link: bill.qr });
      } else {
        // Caso QR base64 directo (poco común)
        doc.fillColor("#000").text(bill.qr);
      }

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
};