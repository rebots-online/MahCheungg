const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/auth/register', (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const users = loadUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    const id = require('crypto').randomUUID();
    const user = { id, email, password: hashed, displayName, photoURL: '', createdAt: Date.now() };
    users.push(user);
    saveUsers(users);
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.status(200).json({ userId: user.id, email: user.email, displayName: user.displayName, token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.status(200).json({ userId: user.id, email: user.email, displayName: user.displayName, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/profile', authenticate, (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id, email, displayName, photoURL } = user;
    res.status(200).json({ userId: id, email, displayName, photoURL });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/auth/profile', authenticate, (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    saveUsers(users);
    const { id, email } = user;
    res.status(200).json({ userId: id, email, displayName: user.displayName, photoURL: user.photoURL });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
