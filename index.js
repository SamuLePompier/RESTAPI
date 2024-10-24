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
 
// Pour utiliser le middleware JSON
app.use(express.json());

const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }

    const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':');

    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(403).send('Invalid credentials');
    }

    req.user = user; // Attach user to the request
    next();
};

// Role-based Access Control Middleware
const authorize = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Access denied');
        }
        next();
    };
};
// Route pour les ITEMS//
// Route pour récupérer un item par ID(get)
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

// Route pour ajouter un nouvel item (admin uniquement-create)
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

// Route pour mettre à jour un item par ID (admin uniquement-UPDATE)
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

// Route pour supprimer un item par ID (admin uniquement-DELETE)
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


// Route pour filtrer les item(get-parameters)
app.get('/items', (req, res) => {
    const { name, price, description, category_id } = req.query;
    // Début de la requête SQL
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];
 
    // Ajout des filtres
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
 
    // Exécution de la requête
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des items:', err);
            res.status(500).send('Erreur lors de la récupération des items');
            return;
        }
        res.json(results);
    });
});


    // Route pour les CATEGORIES//
  // Route pour récupérer tous les categories(get)
app.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';  // Adapte le nom de ta table
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des categories:', err);
            res.status(500).send('Erreur lors de la récupération des categories');
            return;
        }
        res.json(results); // Renvoie les résultats en JSON
    });
});

// Route pour récupérer une categories par ID(get)
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

// Route pour ajouter une nouvelle catégories  (admin uniquement-create)
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

// Route pour mettre à jour un categories par ID (admin uniquement-UPDATE)
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

// Route pour supprimer un categories par ID (admin uniquement-DELETE)
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

     // Route pour les formulas//
// Route pour récupérer un formulas par ID(get)
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
// Route pour ajouter un nouvel formulas (admin uniquement-create)
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
// Route pour mettre à jour une formulas par ID (admin uniquement-UPDATE)
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
// Route pour supprimer une formulas par ID (admin uniquement-DELETE)
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

    // Route pour filtrer les formulas(get-parameters)
app.get('/formulas', (req, res) => {
    const { name, price, categories } = req.query;
    // Début de la requête SQL
    let sql = 'SELECT * FROM formulas WHERE 1=1';
    const params = [];
 
    // Ajout des filtres
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
 
    // Exécution de la requête
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des formulas:', err);
            res.status(500).send('Erreur lors de la récupération des formulas');
            return;
        }
        res.json(results);
    });
});
app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});
