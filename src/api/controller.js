const sql = require('./sql');
const pool = require('../../database');
const queries = require('./sql');

const controller = {};

// USERS TABLE ==========================================

controller.getAllUsers = async function () {
    const data = await pool.query(sql.selectAllUsers);
    return data.rows;
};

controller.checkForUserEmail = async function (email, username) {
    const checkEmail = {};
    const emailCheck = await pool.query(sql.checkForEmail, [email]);
    if (emailCheck.rows[0].email_exists) {
        checkEmail.emailExists = true;
    } else {
        checkEmail.emailExists = false;
    }
    return checkEmail;
};

controller.checkForUserUsername = async function (username) {
    checkUsername = {};
    const usernameCheck = await pool.query(sql.checkForUsername, [username]);
    if (usernameCheck.rows[0].username_exists) {
        checkUsername.usernameExists = true;
    } else {
        checkUsername.usernameExists = false;
    }
    return checkUsername;
};

controller.getUserById = async function (id) {
    const data = await pool.query(sql.selectUserById, [id]);
    return data.rows;
};

controller.getUserByEmail = async function (email) {
    const data = await pool.query(sql.selectUserByEmail, [email]);
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
    console.log(data);
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

// RECIPES TABLE ===========================================

controller.getAllRecipes = async function () {
    const data = await pool.query(sql.selectAllRecipes);
    return data;
};

controller.getRecipeSearch = async function (req) {
    const data = await pool.query(sql.selectRecipeSearch, [req.params.query]);
    return data;
};

controller.getRecipeById = async function (req) {
    const id = req.params.id;
    const data = await pool.query(sql.selectRecipeByID, [id]);
    return data;
};

controller.getRecipesByUser = async function (req) {
    const id = req.params.id;
    const data = await pool.query(sql.selectRecipesByUser, [id]);
    return data;
};

controller.addRecipe = async function (req) {
    const {
        recipeName,
        author,
        description,
        ingredient,
        ingredientAmount,
        ingredientUnit,
        instructions,
        cookTime,
        servings,
        imageURL,
        userId,
    } = req.body;

    try {
        await pool.query('BEGIN');
        await pool.query('SET CONSTRAINTS ALL DEFERRED;');

        // Insert recipe into recipe table
        const recipe_rows = await pool.query(queries.addRecipe, [
            userId,
            recipeName,
            description,
            instructions,
            cookTime,
            servings,
            imageURL,
            author,
        ]);
        const recipeId = recipe_rows.rows[0].id;

        const ingredients = [];

        if (typeof ingredient === 'string') {
            ingredients.push({
                name: ingredient,
                quantity: ingredientAmount,
                unit: ingredientUnit,
            });
        } else {
            for (let i = 0; i < ingredient.length; i++) {
                ingredients.push({
                    name: ingredient[i],
                    quantity: ingredientAmount[i],
                    unit: ingredientUnit[i],
                });
            }
        }
        await ingredients.forEach(async (ingredient) => {
            let ingredientId;

            // check if ingredient exists, add if not
            let ingredinetCheck = await pool.query(queries.selectIngredient, [
                ingredient.name,
            ]);
            if (ingredinetCheck.rows.length == 0) {
                let newIngredient = await pool.query(queries.addIngredient, [
                    ingredient.name,
                ]);
                ingredientId = newIngredient.rows[0].id;
            } else {
                ingredientId = ingredinetCheck.rows[0].id;
            }

            // get unit id
            let unitId = await pool.query(queries.selectUnit, [
                ingredient.unit,
            ]);

            // Add to recipe_ingredient for each ingredient
            await pool.query(queries.addRecipeIngredient, [
                ingredient.quantity,
                false, // This should be added as a form input later
                recipeId,
                ingredientId,
                unitId.rows[0].id,
            ]);
        });

        await pool.query('COMMIT');
        console.log('SUCCESS');
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
};

controller.deleteRecipe = async function (req) {
    console.log(req.body);
    const { recipeId } = req.body;
    const data = await pool.query(sql.deleteRecipe, [recipeId]);
    return data;
};

controller.editRecipe = async function (req) {
    const {
        recipeName,
        description,
        ingredients,
        instructions,
        cookTime,
        servings,
        imageURL,
        author,
        id,
    } = req.body;
    const data = await pool.query(sql.updateRecipe, [
        recipeName,
        description,
        ingredients,
        instructions,
        cookTime,
        servings,
        imageURL,
        author,
        id,
    ]);
};

module.exports = controller;
