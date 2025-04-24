const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MSQL2005', // your password
    database: 'habit_tracker_node'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// API to receive new habit
app.post('/api/habits', (req, res) => {
    console.log("Incoming habit data:", req.body); // 👈 Add this
  
    const { name, description, category, frequency } = req.body;
    const sql = 'INSERT INTO habits (name, description, category, frequency) VALUES (?, ?, ?, ?)';
  
    db.query(sql, [name, description, category, frequency], (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).send('Database error');
      }
      console.log("Habit inserted:", result.insertId); // 👈 Add this
      res.json({ success: true });
    });
  });
  
app.get('/test', (req, res) => {
    res.send('Test route working!');
  });
  
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });
  
  app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  });

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Error registering user');
            }
            console.log('User registered:', result.insertId);
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Hashing error:', error);
        res.status(500).send('Error processing registration');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Login DB error:', err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            console.log('❌ Email not found');
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('❌ Password incorrect');
            return res.status(401).send('Invalid credentials');
        }

        console.log('✅ Login successful:', email);
        res.redirect('/index.html'); // Adjust to your actual dashboard file
    });
});


  
