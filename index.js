import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateInvoicePDF } from "./services/pdfService.js";
import { createInvoice, getInvoices } from "./services/factusService.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://facturacion-frontend-five.vercel.app/']

app.use(cors({origin: allowedOrigins, credentials: true}));

app.get("/", (req, res) => {
  res.send("API Factus funcionando");
});

app.post("/crear-factura", async (req, res) => {

  try {

    console.log("Datos recibidos:", req.body);

    const factura = await createInvoice(req.body);

    const bill = factura.data.bill;

    const pdfPath = generateInvoicePDF(bill);

    res.json({
      status: factura.status,
      message: factura.message,
      numero_factura: bill.number,
      cufe: bill.cufe,
      total: bill.total,
      qr: bill.qr,
      pdf: pdfPath
    });

  } catch (error) {

    console.error("Error:", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }

});

app.get("/facturas", async (req, res) => {

  try {

    const facturas = await getInvoices();

    res.json(facturas);

  } catch (error) {

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
});