const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');

const users = {
    admin: { password: 'admin1234', role: 'admin' },
    client: { password: 'client1234', role: 'client' }
  };

 
const db = mysql.createConnection({
    host: 'localhost',  
    user: 'root',       
    password: 'teo',       
    database: 'restaurantapi',  
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});
 
app.use(express.json());

const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Non autorisé');
    }

    const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':');

    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(403).send('Accés refusé : mot de passe ou nom d\'utilisateur incorrect');
    }

    req.user = user; 
    next();
};

const authorize = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Accés refusé : Vous n\'avez pas les autorisations nécessaires');
        }
        next();
    };
};
// Route pour les ITEMS//
// Route All Items by ID
app.get('/items/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM items WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'items:', err);
            res.status(500).send('Erreur lors de la récupération de l\'items');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Items non trouvé');
        } else {
            res.json(result[0]);
        }
    });
});

// Route Create Items
app.post('/items', basicAuth, authorize('admin'), (req, res) => {
    const { id, name, price, description, category_id } = req.body;  // Adapte en fonction des colonnes de ta table
    const sql = 'INSERT INTO items (id, name, price, description, category_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [id, name, price, description, category_id], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'items:', err);
            res.status(500).send('Erreur lors de l\'ajout de l\'items');
            return;
        }
        res.status(201).json({ message: 'Items ajouté avec succès', itemId: result.insertId });
    });
});

// Route Update Items by ID
app.put('/items/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const { name, price, description, category_id } = req.body;
    const sql = 'UPDATE items SET name = ?, price = ?, description = ?, category_id = ? WHERE id = ?';
    db.query(sql, [name, price, description, category_id, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'items:', err);
            res.status(500).send('Erreur lors de la mise à jour de l\'items');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Items non trouvé');
        } else {
            res.json({ message: 'Items mis à jour avec succès' });
        }
    });
});

// Route Delete Items by ID
app.delete('/items/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM items WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de l\'items:', err);
            res.status(500).send('Erreur lors de la suppression de l\'items');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Items non trouvé');
        } else {
            res.json({ message: 'Items supprimé avec succès' });
        }
    });
});


// Route Filtrer et Get All Items
app.get('/items', (req, res) => {
    const { name, price, description, category_id } = req.query;
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];
 
    if (name) {
        sql += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }
    if (price) {
        sql += ' AND price = ?';
        params.push(price);
    }
    if (description) {
        sql += ' AND description LIKE ?';
        params.push(`%${description}%`);
    }
    if (category_id) {
        sql += ' AND category_id = ?';
        params.push(category_id);
    }
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des items:', err);
            res.status(500).send('Erreur lors de la récupération des items');
            return;
        }
        res.json(results);
    });
});

// Route Patch Item by ID
app.patch('/items/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const sql = 'UPDATE items SET ? WHERE id = ?';
    db.query(sql, [updateData, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'item:', err);
            return res.status(500).send('Erreur lors de la mise à jour de l\'item');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Item non trouvé');
        }
        res.json({ message: 'Item mis à jour avec succès' });
    });
});

// Route pour les CATEGORIES//
// Route All categories
app.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM categories'; 
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des categories:', err);
            res.status(500).send('Erreur lors de la récupération des categories');
            return;
        }
        res.json(results); 
    });
});

// Route Categories by ID
app.get('/categories/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération de la categories:', err);
            res.status(500).send('Erreur lors de la récupération de la categories');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('catégories non trouvé');
        } else {
            res.json(result[0]);
        }
    });
});

// Route Create Categories
app.post('/categories', basicAuth, authorize('admin'), (req, res) => {
    const { id, name } = req.body;  // Adapte en fonction des colonnes de ta table
    const sql = 'INSERT INTO categories (id, name) VALUES (?, ?)';
    db.query(sql, [id, name], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de la catégories:', err);
            res.status(500).send('Erreur lors de l\'ajout de la catégories');
            return;
        }
        res.status(201).json({ message: 'catégories ajoutée avec succès', itemId: result.insertId });
    });
});

// Route Update Categories by ID
app.put('/categories/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const sql = 'UPDATE categories SET name = ? WHERE id = ?';
    db.query(sql, [name, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la catégorie:', err);
            res.status(500).send('Erreur lors de la mise à jour de la catégorie');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Catégorie non trouvée');
        } else {
            res.json({ message: 'Catégorie mise à jour avec succès' });
        }
    });
});

// Route Delete Categories by ID
app.delete('/categories/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la categories:', err);
            res.status(500).send('Erreur lors de la suppression de la categories');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('categories non trouvé');
        } else {
            res.json({ message: 'categories supprimé avec succès' });
        }
    });
});

// Route Patch catégories by ID
app.patch('/categories/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const sql = 'UPDATE categories SET ? WHERE id = ?';
    db.query(sql, [updateData, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la catégories:', err);
            return res.status(500).send('Erreur lors de la mise à jour de la catégories');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('catégories non trouvé');
        }
        res.json({ message: 'catégories mis à jour avec succès' });
    });
});

// Route pour les formulas//
// Route Formula by ID
app.get('/formulas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM formulas WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'item:', err);
            res.status(500).send('Erreur lors de la récupération de l\'item');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Item non trouvé');
        } else {
            res.json(result[0]);
        }
    });
});
// Route Create Formulas
app.post('/formulas', basicAuth, authorize('admin'), (req, res) => {
    const {name, price, categories} = req.body;  // Adapte en fonction des colonnes de ta table
    const sql = 'INSERT INTO formulas (name, price, categories) VALUES (?, ?, ?)';
    db.query(sql, [name, price,categories], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de la formulas:', err);
            res.status(500).send('Erreur lors de l\'ajout de la formulas');
            return;
        }
        res.status(201).json({ message: 'formulas ajouté avec succès', formulasId: result.insertId });
    });
});
// Route Update Formulas by ID
app.put('/formulas/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const { name, price, categories} = req.body;
    const sql = 'UPDATE formulas SET name = ?, price = ?, categories = ? WHERE id = ?';
    db.query(sql, [name, price, categories, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la formulas:', err);
            res.status(500).send('Erreur lors de la mise à jour de la formulas');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('formulas non trouvé');
        } else {
            res.json({ message: 'formulas mis à jour avec succès' });
        }
    });
});
// Route Delete Formulas by ID
app.delete('/formulas/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM formulas WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la formulas:', err);
            res.status(500).send('Erreur lors de la suppression de la formulas');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('formulas non trouvé');
        } else {
            res.json({ message: 'formulas supprimé avec succès' });
        }
    });
});

    // Route pour filtrer et Get All Formulas
app.get('/formulas', (req, res) => {
    const { name, price, categories } = req.query;
    let sql = 'SELECT * FROM formulas WHERE 1=1';
    const params = [];
 
    if (name) {
        sql += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }
    if (price) {
        sql += ' AND price = ?';
        params.push(price);
    }
    
    if (categories) {
        sql += ' AND categories = ?';
        params.push(categories);
    }
 
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des formulas:', err);
            res.status(500).send('Erreur lors de la récupération des formulas');
            return;
        }
        res.json(results);
    });
});

// Route Patch formulas by ID
app.patch('/formulas/:id', basicAuth, authorize('admin'), (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const sql = 'UPDATE formulas SET ? WHERE id = ?';
    db.query(sql, [updateData, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la formulas', err);
            return res.status(500).send('Erreur lors de la mise à jour de la formulas');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Formulas non trouvé');
        }
        res.json({ message: 'Formulas mis à jour avec succès' });
    });
});


app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});

