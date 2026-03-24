import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API = process.env.BASE_URL;

export const getToken = async () => {

  const response = await axios.post(`${API}/oauth/token`, {
    grant_type: "password",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    username: process.env.EMAIL,
    password: process.env.PASSWORD
  });

  return response.data.access_token;
};

export const createInvoice = async (data) => {

  const token = await getToken();

  const { invoice, customer, products } = data;

  const invoiceData = {

    numbering_range_id: 8,

    reference_code: `FACT-${Date.now()}`,

    observation: "Factura generada desde frontend",

    payment_form: "1",
    payment_method_code: "10",
    payment_due_date: invoice.date,

    customer: {
      identification: customer.identification,
      names: customer.name,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
      legal_organization_id: "1",
      tribute_id: "21",
      identification_document_id: "3",
      municipality_id: "980"
    },

    items: products.map((p, index) => ({
      code_reference: `P00${index + 1}`,
      name: p.description,
      quantity: p.quantity,
      discount_rate: 0,
      price: p.price,
      tax_rate: "19",
      unit_measure_id: "70",
      standard_code_id: "1",
      is_excluded: 0,
      tribute_id: "1"
    }))

  };

  const response = await axios.post(
    `${API}/v1/bills/validate`,
    invoiceData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  
  return response;

};

export const getInvoices = async () => {

  const token = await getToken();

  const response = await axios.get(
    `${API}/v1/bills`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;

};

export const downloadInvoicePDF = async (billNumber) => {
  const token = await getToken();

  const response = await axios.get(
    `${API}/v1/bills/download-pdf/${billNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  // Factus devuelve el PDF codificado en base64 dentro de un JSON
  return response.data; // { data: { pdf_base_64_encoded: "..." } }
};

export const getInvoiceByNumber = async (req, res) => {
  const { number } = req.params;

  try {
    const token = await getToken();

    const response = await axios.get(
      `${API}/v1/bills/show/${number}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const bill = response.data?.data?.bill;

    if (!bill) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    res.json({
      ok: true,
      data: {
        bill,
        customer: response.data?.data?.customer,
      },
    });

  } catch (error) {
    console.error("❌ ERROR OBTENIENDO FACTURA:", error.response?.data || error.message);

    res.status(500).json({
      error: "Error obteniendo factura",
    });
  }
};