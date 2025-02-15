const express = require('express');
const router = new express.Router();
const controller = require('./controller');
const utilities = require('../../utilities/index');

router.get('', (req, res) => {
    res.send('Welcome to my API');
});

// Get all users
router.get('/user/all', utilities.checkJWTToken, async (req, res) => {
    // Update SQL to include user privilege
    const data = await controller.getAllUsers();
    res.send(data);
});

// Check if user exits by email
router.get('/checkuser/:email/:username', async (req, res) => {
    res.send(
        await controller.checkForUser(req.params.email, req.params.username)
    );
});

// Get a specific user
router.get('/user/:email', async (req, res) => {
    const data = await controller.getUserByEmail(req.params.email);
    res.send(data);
});

// Add a user
router.post('/user/new', async (req, res) => {
    const { username, email, password_hash } = req.body;
    const data = await controller.addUser(username, email, password_hash);
    res.send(data);
});

// Delete User
// ADD CHECK FOR ADMIN
router.delete('/user/delete', utilities.checkJWTToken, async (req, res) => {
    // Update to move logic to controller
    const { id } = req.body;

    if (await controller.getUserById(id)) {
        const data = await controller.deleteUser(id);
        res.send(`Deleted user ${id}`);
    } else {
        res.send('User does not exist.');
    }
});

router.put('/user/edit', utilities.checkJWTToken, async (req, res) => {
    const body = req.body;

    const response = await controller.editUser(body);
    res.send(response);
});

module.exports = router;
