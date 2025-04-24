const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length > 0) {
      res.send('success');
    } else {
      res.status(401).send('Invalid login');
    }
  });
});

module.exports = router;
