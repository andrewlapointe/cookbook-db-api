const sql = require('./sql');
const pool = require('../../database');

const controller = {};

controller.getAllUsers = async function () {
    const data = await pool.query(sql.selectAllUsers);
    return data.rows;
};

controller.getUserById = async function (id) {
    const data = await pool.query(sql.selectUserById, [id]);
    return data.rows;
};

controller.addUser = async function (
    username,
    email,
    password_hash,
    role = 'viewer'
) {
    const data = await pool.query(sql.addUser, [
        username,
        email,
        password_hash,
        role,
    ]);
    return data.rows[0];
};

controller.deleteUser = async function (id) {
    const response = await pool.query(sql.deleteUser, [id]);
    return response;
};

controller.editUser = async function (reqBody) {
    const { id, username, email } = reqBody;
    if (this.getUserById(id)) {
        await pool.query(sql.updateUser, [username, email, id]);
        return 'User updated.';
    } else {
        return 'User does not exist';
    }
};

module.exports = controller;
