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

controller.getAllUserLists = async function (user_id) {
    return await pool.query(sql.getAllUserLists, [user_id]);
};

controller.getUserListById = async function (list_id) {
    const recipes = await pool.query(sql.getListRecipes, [list_id]);
    return recipes;
};

controller.createUserList = async function (user_id, list_name) {
    const result = await pool.query(sql.createUserList, [user_id, list_name]);
    return result;
};

controller.addRecipeToList = async function (list_id, recipe_id) {
    const inList = await pool.query(sql.checkForRecipeInList, [
        list_id,
        recipe_id,
    ]);
    console.log('Exists:' + inList.rows[0].item_exists);
    if (inList.rows[0].item_exists) {
        console.log('Running Query');
        return await pool.query(sql.addRecipeToList, [list_id, recipe_id]);
    } else {
        return 'Recipe Already In List';
    }
};

controller.editListName = async function (list_id, new_name) {
    return await pool.query(sql.editListName, [list_id, new_name]);
};

controller.deleteList = async function (list_id) {
    return await pool.query(sql.deleteList, [list_id]);
};

controller.removeRecipeFromList = async function (recipe_id, list_id) {
    const data = await pool.query(sql.removeRecipeFromList, [
        recipe_id,
        list_id,
    ]);
    console.log(data);
    return data;
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

controller.getRecipeIngredientsById = async function (req) {
    const id = req.params.id;
    const data = await pool.query(sql.selectRecipeIngredientsByID, [id]);
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

        for (const ing of ingredients) {
            let ingredientId;

            // check if ingredient exists, add if not
            const ingredinetCheck = await pool.query(queries.selectIngredient, [
                ing.name,
            ]);
            if (ingredinetCheck.rows.length == 0) {
                const newIngredient = await pool.query(queries.addIngredient, [
                    ing.name,
                ]);
                ingredientId = newIngredient.rows[0].id;
            } else {
                ingredientId = ingredinetCheck.rows[0].id;
            }

            // get unit id
            const unitId = await pool.query(queries.selectUnit, [ing.unit]);

            // Add to recipe_ingredient for each ingredient
            await pool.query(queries.addRecipeIngredient, [
                ing.quantity,
                false, // This should be added as a form input later
                recipeId,
                ingredientId,
                unitId.rows[0].id,
            ]);
        }

        await pool.query('COMMIT');
        return { id: recipeId };
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
        id,
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

        const recipeId = id;

        // Edit Recipe Table
        const recipe_rows = await pool.query(queries.updateRecipe, [
            recipeName,
            description,
            instructions,
            cookTime,
            servings,
            imageURL,
            author,
            recipeId,
        ]);

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

        await pool.query(
            `DELETE FROM recipe_ingredient WHERE recipe_id=${recipeId}`
        );

        for (const ing of ingredients) {
            let ingredientId;

            // check if ingredient exists, add if not
            const ingredinetCheck = await pool.query(queries.selectIngredient, [
                ing.name,
            ]);
            if (ingredinetCheck.rows.length == 0) {
                const newIngredient = await pool.query(queries.addIngredient, [
                    ing.name,
                ]);
                ingredientId = newIngredient.rows[0].id;
            } else {
                ingredientId = ingredinetCheck.rows[0].id;
            }

            // get unit id
            const unitId = await pool.query(queries.selectUnit, [ing.unit]);

            // Add to recipe_ingredient for each ingredient
            await pool.query(queries.addRecipeIngredient, [
                ing.quantity,
                false, // This should be added as a form input later
                recipeId,
                ingredientId,
                unitId.rows[0].id,
            ]);
        }

        await pool.query('COMMIT');
        return { id: recipeId };
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
};

controller.getAllUnits = async function () {
    const units = await pool.query(sql.selectAllUnits);
    return units;
};

module.exports = controller;
