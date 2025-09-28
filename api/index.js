import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// ✅ Configuración de CORS (permite localhost y tu dominio en Vercel)
app.use(cors({
  origin:["http://localhost:3000", "https://vercel-prueba-ten.vercel.app", "http://localhost:5000"],
  methods:["GET","POST","DELETE","PUT"],
  allowedHeaders:["Content-Type"]
}));

app.use(express.json());

// Necesario en ESModules para usar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("¡Conectado a MongoDB Atlas!"))
  .catch(err => console.error("Error al conectar:", err));

// Esquema y modelo
const productSchema = new mongoose.Schema({
  nombre: String,
  stock: String,
  price: Number,
  // campo legible y secuencial para mostrar en UI (ej. PROD-001)
  code: String,
  img: String
});
const Product = mongoose.model("Product", productSchema);

// Counter schema para secuencias atómicas (una colección simple)
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// Generador atómico de códigos para productos (PROD-001)
async function generateProductCode() {
  // findOneAndUpdate con upsert y $inc garantiza incremento atómico
  const res = await Counter.findOneAndUpdate(
    { _id: 'product_code' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = res.seq;
  // formatear con ceros a la izquierda
  const padded = String(seq).padStart(3, '0');
  return `PROD-${padded}`;
}

// 📂 Servir archivos estáticos desde public/
app.use(express.static(path.join(__dirname, "../public")));

// Rutas frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// 🌐 API
app.get("/products", async (req, res) => {
  // Devolver productos ordenados por 'code' ascendente. Si 'code' no existe en
  // algunos documentos, se ordenarán según la semántica de Mongo (valores null/absent primero).
  // Si prefieres que los sin código queden al final, podemos usar una pipeline de aggregation.
  const products = await Product.find().sort({ code: 1 });
  res.json(products);
});

app.post("/products", async (req, res) => {
  try {
    // Si no se pasa un code, generamos uno automáticamente
    if (!req.body.code) {
      req.body.code = await generateProductCode();
    }
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error creando producto:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// RUTA DE BACKFILL: asigna códigos a productos que no los tengan
app.post('/products/backfill-codes', async (req, res) => {
  try {
    // Obtener productos que no tengan el campo `code`
    const toFix = await Product.find({ code: { $exists: false } }).limit(1000);
    const updates = [];
    for (const p of toFix) {
      p.code = await generateProductCode();
      updates.push(p.save());
    }
    await Promise.all(updates);
    res.json({ updated: updates.length });
  } catch (err) {
    console.error('Error en backfill:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE product by id
app.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET product by id
app.get('/products/:id', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Not found' });
    res.json(prod);
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT: update a product by id
app.put('/products/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;