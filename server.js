import cors from "cors";
import express from "express";
import { User, getUsers } from "./controllers/userControllers.js";
import { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories 
} from "./controllers/productsController.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Inventory API is running!' });
});

// User routes
app.post('/api/users', User);
app.get('/api/users', getUsers);

// Product routes
app.post('/api/products', createProduct);
app.get('/api/products', getProducts);
app.get('/api/products/categories', getCategories);
app.get('/api/products/:id', getProduct);
app.put('/api/products/:id', updateProduct);
app.delete('/api/products/:id', deleteProduct);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: err.error || []
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});