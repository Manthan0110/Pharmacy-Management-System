const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));


// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

// Search API
app.get("/search", (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) return res.json([]);

    const query = `
        (SELECT name, price, image_url FROM ayurvedic WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM healthmonitor WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM medicines WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM motherbaby WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM personal WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM skincare WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM vitamins WHERE name LIKE ? AND price <> 'NA')
        UNION ALL 
        (SELECT name, price, image_url FROM women WHERE name LIKE ? AND price <> 'NA')
        LIMIT 10`;

    const searchParam = `%${searchQuery}%`;
    db.query(query, Array(8).fill(searchParam), (err, results) => {
        if (err) {
            console.error("Error fetching search results:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});

// Register API
app.post('/register', (req, res) => {
    const { full_name, email, dob, password } = req.body;

    // Check if email already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already registered!' });
        }

        // Hash password before storing
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert new user
        db.query('INSERT INTO users (full_name, email, dob, password) VALUES (?, ?, ?, ?)',
            [full_name, email, dob, hashedPassword],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({ message: 'User registered successfully!' });
            }
        );
    });
});


// Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length > 0) {
            const user = result[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (match) {
                    if (user.role === "admin") {
                        res.json({ message: "Login successful!", role: "admin", redirect: "/admin/html/admin.html" });
                    } else {
                        res.json({ message: "Login successful!", role: "customer", redirect: "/User/html/firstpage.html" });
                    }
                } else {
                    res.json({ error: "Invalid Password!" });
                }
            });
        } else {
            res.json({ error: "User not found!" });
        }
    });
});

app.get("/all-products", (req, res) => {
    const query = `
        SELECT name, price, image_url FROM ayurvedic WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM healthmonitor WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM medicines WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM motherbaby WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM personal WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM skincare WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM vitamins WHERE price IS NOT NULL AND price <> 'NA'
        UNION ALL 
        SELECT name, price, image_url FROM women WHERE price IS NOT NULL AND price <> 'NA'
        ORDER BY RAND() LIMIT 16`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});


app.get("/admin/products", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = 20;
    let offset = (page - 1) * limit;
    let searchQuery = req.query.search ? `${req.query.search}%` : "%";  // ✅ Match only the first letter

    let query = "SELECT * FROM medicines WHERE name LIKE ? LIMIT ? OFFSET ?";
    let countQuery = "SELECT COUNT(*) AS total FROM medicines WHERE name LIKE ?";

    db.query(query, [searchQuery, limit, offset], (err, results) => {
        if (err) {
            console.error('❌ Error fetching products:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query(countQuery, [searchQuery], (err, countResult) => {
            if (err) {
                console.error("❌ Error fetching product count:", err);
                return res.status(500).json({ error: "Database error" });
            }

            let totalProducts = countResult[0].total;
            let totalPages = Math.ceil(totalProducts / limit);

            res.json({
                products: results,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
});

app.delete("/admin/products/:id", (req, res) => {
    const productId = req.params.id;

    db.query("DELETE FROM medicines WHERE id = ?", [productId], (err, result) => {
        if (err) {
            console.error("❌ Error deleting product:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "❌ Product not found!" });
        }

        res.json({ message: "✅ Product deleted successfully!" });
    });
});

app.post("/admin/products", (req, res) => {
    const { name, price, image_url } = req.body;

    if (!name || !price || !image_url) {
        return res.status(400).json({ error: "❌ Name, price, and image URL are required!" });
    }

    db.query(
        "INSERT INTO medicines (Name, Price, Image_url) VALUES (?, ?, ?)",
        [name, price, image_url],
        (err, result) => {
            if (err) {
                console.error("❌ Error adding product:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "✅ Product added successfully!", id: result.insertId });
        }
    );
});




// ✅ API: Fetch All Users
app.get("/admin/users", (req, res) => {
    db.query("SELECT id, full_name, email, dob, role FROM users", (err, results) => {
        if (err) {
            console.error("❌ Error fetching users:", err);
            return res.status(500).json({ error: "Database error!" });
        }
        res.json(results);
    });
});

// ✅ API: Add User
app.post("/admin/users", async (req, res) => {
    const { full_name, email, dob, password, role } = req.body;

    if (!full_name || !email || !dob || !password || !role) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (full_name, email, dob, password, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [full_name, email, dob, hashedPassword, role], (err, result) => {
            if (err) {
                console.error("❌ MySQL Insert Error:", err);
                return res.status(500).json({ error: "Database error!" });
            }
            res.json({ message: "✅ User added successfully!" });
        });
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Server error!" });
    }
});

// ✅ API: Delete User
app.delete("/admin/users/:id", (req, res) => {
    const userId = req.params.id;
    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) {
            console.error("❌ MySQL Delete Error:", err);
            return res.status(500).json({ error: "Database error!" });
        }
        res.json({ message: "✅ User deleted successfully!" });
    });
});

// ✅ API: Edit User
app.put("/admin/users/:id", (req, res) => {
    const userId = req.params.id;
    const { full_name, email, dob, role } = req.body;

    if (!full_name || !email || !dob || !role) {
        return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    const sql = "UPDATE users SET full_name = ?, email = ?, dob = ?, role = ? WHERE id = ?";
    db.query(sql, [full_name, email, dob, role, userId], (err, result) => {
        if (err) {
            console.error("❌ MySQL Update Error:", err);
            return res.status(500).json({ error: "Database error!" });
        }
        res.json({ message: "✅ User updated successfully!" });
    });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully!" });
    });
});


app.get("/admin/getOrders", (req, res) => {
    const sql = "SELECT * FROM orders";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ success: false, message: "Error fetching orders." });
        }
        res.json(results);
    });
});

app.put('/update-order-status/:id', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error('Error updating status:', err);
            res.status(500).json({ message: 'Database error' });
        } else {
            res.json({ message: 'Order status updated successfully' });
        }
    });
});


app.delete('/delete-order/:id', (req, res) => {
    const orderId = req.params.id;
    const sql = 'DELETE FROM orders WHERE id = ?';

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            res.status(500).json({ message: 'Failed to delete order' });
        } else {
            res.json({ message: 'Order deleted successfully' });
        }
    });
});




// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
