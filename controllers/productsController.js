import { db } from "../db/db-connection";
// Create new product
const createProduct = (req, res) => {
  const { name, quantity, price, category } = req.body;
  
  // Validation
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  if (price < 0 || (quantity && quantity < 0)) {
    return res.status(400).json({ error: 'Invalid price or quantity' });
  }

  const sql = `
    INSERT INTO products (name, quantity, price, category)
    VALUES (?, ?, ?, ?)
  `;
  
  const params = [
    name, 
    quantity || 0, 
    price, 
    category || null
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      quantity: quantity || 0,
      price,
      category,
      message: 'Product created successfully'
    });
  });
};

// Get all products (with pagination and sorting)
const getProducts = (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = 'name', 
    order = 'ASC',
    search = '',
    category = ''
  } = req.query;

  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (search) {
    whereClause += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }

  // Validate sort column
  const validSortColumns = ['name', 'price', 'quantity', 'created_at'];
  const sortColumn = validSortColumns.includes(sort) ? sort : 'name';
  
  // Validate order direction
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countSql = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
  const dataSql = `
    SELECT * FROM products 
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  db.serialize(() => {
    db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        console.error('Count error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);
      
      db.all(dataSql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err);
          return res.status(500).json({ error: 'Failed to fetch products' });
        }
        
        res.json({
          products: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        });
      });
    });
  });
};

// Update product
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, quantity, price, category } = req.body;
  
  const sql = `
    UPDATE products
    SET 
      name = COALESCE(?, name),
      quantity = COALESCE(?, quantity),
      price = COALESCE(?, price),
      category = COALESCE(?, category),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [name, quantity, price, category, id];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ 
      id,
      message: 'Product updated successfully'
    });
  });
};

// Delete product
const deleteProduct = (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
};

exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};