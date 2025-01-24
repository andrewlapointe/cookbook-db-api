const express = require('express');
const router = new express.Router();
const controller = require('./controller');

router.get('', (req, res) => {
    res.send('Welcome to my API');
});

// Get all users
router.get('/user/all', async (req, res) => {
    // Update SQL to include user privilege
    const data = await controller.getAllUsers();
    res.send(data);
});

// Get a specific user
router.get('/user/:id', async (req, res) => {
    const data = await controller.getUserById(req.params.id);
    res.send(data);
});

// Add a user
router.post('/user/new', async (req, res) => {
    const { username, email, password_hash } = req.body;
    const data = await controller.addUser(username, email, password_hash);
    res.send(data);
});

module.exports = router;
