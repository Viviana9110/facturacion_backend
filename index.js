import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import { createInvoice, getInvoices, getToken } from "./services/factusService.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://green-cart-eight-sigma.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API Factus funcionando 🚀");
});

/* Crear factura */
app.post("/crear-factura", async (req, res) => {
  try {
    const factura = await createInvoice(req.body);

console.log("RESPUESTA FACTUS:", factura.data); // 👈 DEBUG

const bill = factura.data?.data?.bill || factura.data?.bill;

    res.json({
  status: factura.data?.status,
  message: factura.data?.message,
  numero_factura: bill?.number,
  cufe: bill?.cufe,
  total: bill?.total,
  qr: bill?.qr,
});
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

/* Listar facturas */
app.get("/facturas", async (req, res) => {
  try {
    const facturas = await getInvoices();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

/* Descargar PDF de factura */
app.get("/factura-pdf/:number", async (req, res) => {
  try {
    const number = req.params.number;
    const token = await getToken();

    const response = await axios.get(
      `${process.env.BASE_URL}/v1/bills/show/${number}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const bill = response.data.data.bill;

    if (!bill || !bill.pdf) {
      return res.status(404).json({
        error: "Factura aún no tiene PDF",
      });
    }

    const buffer = Buffer.from(bill.pdf, "base64");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Factura-${number}.pdf"`,
    });

    res.send(buffer);

  } catch (error) {
    console.error("❌ ERROR REAL:", error.response?.data || error.message);

    res.status(500).json({
      error: "Error obteniendo PDF",
    });
  }
});



app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});