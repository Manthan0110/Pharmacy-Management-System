const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'root', // Replace with your MySQL password
    database: 'pharmacy_db', // Replace with your database name
    localInfile: true
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// ✅ Ensure tables exist (optional for testing)
const createTables = () => {
    const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            medicine_name VARCHAR(255),
            quantity INT,
            price DECIMAL(10,2),
            status ENUM('Pending', 'Ordered') DEFAULT 'Pending',
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.query(createOrdersTable, (err) => {
        if (err) console.error('❌ Error creating orders table:', err);
    });

    const createMedicinesTable = `
        CREATE TABLE IF NOT EXISTS medicines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255),
            Price DECIMAL(10,2),
            Image_url TEXT
        );
    `;
    db.query(createMedicinesTable, (err) => {
        if (err) console.error('❌ Error creating medicines table:', err);
    });
};
createTables();

// ✅ Fetch all medicines
app.get('/medicines', (req, res) => {
    const query = 'SELECT Name, Price, Image_url FROM medicines';
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error fetching medicines:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(results);
        }
    });
});

// ✅ Search medicines
app.get('/medicines/search', (req, res) => {
    const searchQuery = req.query.name;
    if (!searchQuery) return res.status(400).json({ error: 'Search query required' });

    const sql = `SELECT * FROM medicines WHERE Name LIKE ? LIMIT 10`;
    db.query(sql, [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('❌ Error searching medicines:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// ✅ Save order (Add to Cart)
app.post('/orders', (req, res) => {
    const { medicineName, quantity, price } = req.body;
    if (!medicineName || !quantity || !price) {
        return res.status(400).json({ error: 'All fields required' });
    }

    const query = 'INSERT INTO orders (medicine_name, quantity, price) VALUES (?, ?, ?)';
    db.query(query, [medicineName, quantity, price], (err) => {
        if (err) {
            console.error('❌ Error placing order:', err);
            res.status(500).json({ error: 'Failed to save order' });
        } else {
            res.json({ message: '✅ Order placed successfully' });
        }
    });
});

// ✅ Fetch all **pending** orders
app.get('/orders', (req, res) => {
    const query = 'SELECT * FROM orders WHERE status = "Pending" ORDER BY order_date DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching orders:", err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ✅ Delete an order
app.delete('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.query('DELETE FROM orders WHERE id = ?', [orderId], (err, result) => {
        if (err) {
            res.status(500).json({ error: "❌ Error deleting order" });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "Order not found" });
        } else {
            res.json({ message: "✅ Order deleted successfully" });
        }
    });
});

// ✅ Update order quantity
app.put('/orders/update', (req, res) => {
    const orders = req.body.orders;

    if (!orders || orders.length === 0) {
        return res.status(400).json({ error: "No orders to update" });
    }

    let queries = orders.map(order => {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE orders SET quantity = ? WHERE id = ?',
                [order.quantity, order.id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    });

    Promise.all(queries)
        .then(() => res.json({ message: "✅ Orders updated successfully" }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "❌ Error updating orders" });
        });
});

// ✅ Confirm orders (bulk update)
app.put('/orders/confirm', (req, res) => {
    const orders = req.body.orders;
    if (!orders || orders.length === 0) {
        return res.status(400).json({ error: 'No orders to confirm' });
    }

    let query = 'UPDATE orders SET quantity = CASE ';
    let values = [];
    let ids = [];

    orders.forEach(order => {
        if (order.orderId) {
            query += `WHEN id = ? THEN ? `;
            values.push(order.orderId, order.quantity);
            ids.push(order.orderId);
        }
    });

    if (ids.length === 0) {
        return res.status(400).json({ error: 'No valid order IDs' });
    }

    query += `END, status = "Ordered" WHERE id IN (${ids.map(() => '?').join(",")})`;

    db.query(query, [...values, ...ids], (err, result) => {
        if (err) {
            console.error('❌ Error confirming orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, message: '✅ All orders confirmed!' });
    });
});

// Fetch medicines based on category
app.get('/medicines/:category', (req, res) => {
    const category = req.params.category;
    const query = `SELECT * FROM ${category} LIMIT 10`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching medicines:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
