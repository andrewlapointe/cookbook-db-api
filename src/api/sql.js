const queries = {};

// USERS TABLE ===========================================================
queries.selectAllUsers = `SELECT 
    u.id,
    u.username,
    ARRAY_AGG(r.role_name) AS roles
FROM users u
LEFT JOIN user_roles ur 
  ON u.id = ur.user_id
LEFT JOIN roles r
  ON ur.role_id = r.role_id
GROUP BY u.id, u.username
ORDER BY u.id;`;

queries.checkForEmail = `
SELECT EXISTS (
  SELECT 1
  FROM users
  WHERE email=$1
  ) AS email_exists;
`;

queries.checkForUsername = `
SELECT EXISTS (
  SELECT 1
  FROM users
  WHERE username=$1
  ) AS username_exists;
`;

queries.selectUserByEmail = `SELECT 
    u.id,
    u.username,
    u.email,
    u.password_hash,
    ARRAY_AGG(r.role_name) AS roles
FROM users u
LEFT JOIN user_roles ur 
ON u.id = ur.user_id
LEFT JOIN roles r
ON ur.role_id = r.role_id
WHERE u.email = $1
GROUP BY u.id, u.username
ORDER BY u.id;`;

queries.addUser = `
WITH new_user AS ( 
  INSERT INTO users (username, email, password_hash) 
  VALUES ($1, $2, $3) 
  RETURNING id
), 
role AS (
  SELECT role_id 
  FROM roles 
  WHERE role_name = $4
  LIMIT 1
) 
INSERT INTO user_roles (user_id, role_id) 
SELECT new_user.id, role.role_id 
FROM new_user, role
RETURNING user_roles.user_id;
`;

queries.deleteUser = `DELETE FROM users WHERE id=$1`;

queries.updateUser = `
UPDATE users
SET username = $1, email = $2
WHERE id = $3;
`;
// =======================================================================

// RECIPE_INGREDIENT TABLE ===============================================
queries.addRecipeIngredient = `
INSERT INTO recipe_ingredient
(quantity, optional, recipe_id, ingredient_id, unit_id)
VALUES ($1, $2, $3, $4, $5)
`;
// =======================================================================

// RECIPE TABLE ==========================================================
queries.selectAllRecipes = `
SELECT *
FROM recipes;
`;

queries.selectRecipeSearch = `
SELECT *
FROM recipes
WHERE title % $1 OR description % $1 OR instructions % $1 OR author % $1
ORDER BY
  GREATEST(
    similarity(title, $1), 
    similarity(description, $1),     
    similarity(instructions, $1),
    similarity(author, $1)
    ) DESC
LIMIT 50;
`;

queries.selectRecipeByID = `
SELECT *
FROM recipes
WHERE id = $1;
`;

queries.selectRecipesByUser = `
SELECT *
FROM recipes
WHERE user_id = $1
LIMIT 1000;
`;

queries.addRecipe = `
INSERT INTO recipes (
      user_id,
      title,
      description,
      instructions,
      cooking_time,
      servings,
      image_url,
      author
  ) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING id;
`;

queries.deleteRecipe = `
DELETE FROM recipes WHERE id=$1;
`;

queries.updateRecipe = `
UPDATE recipes
SET title = $1, description = $2, ingredients = $3, instructions = $4, cooking_time = $5, servings = $6, image_url = $7, author = $8
WHERE id = $9
`;
// =======================================================================
// INGREDIENTS TABLE =====================================================
queries.selectAllIngredients = `
SELECT * FROM ingredients;
`;

queries.selectIngredient = `
SELECT id FROM ingredients
WHERE name = $1; 
`;

queries.addIngredient = `
INSERT INTO ingredients
(name)
VALUES ($1)
ON CONFLICT (name) DO NOTHING
RETURNING id;
`;

queries.selectRecipeIngredientsByID = `
SELECT i.name AS ingredient, u.name AS unit, lt.quantity AS quantity, 
lt.optional AS optional, u.abbreviation AS unit_abbreviation, u.unit_system, u.measure_type
FROM recipe_ingredient lt
JOIN ingredients i
	ON i.id = lt.ingredient_id
JOIN units u
	ON u.id = lt.unit_id
WHERE lt.recipe_id = $1;
`;
// =======================================================================

// UNITS TABLE ===========================================================
queries.selectAllUnits = `
SELECT * FROM units;
`;

queries.selectUnit = `
SELECT id FROM units
WHERE name = $1;
`;
// =======================================================================

// NOTES TABLE ===========================================================
queries.selectAllNotes = `
SELECT * FROM notes;
`;

queries.selectNoteByRecipeId = `
SELECT *
FROM notes
WHERE user_id = $1;
`;

queries.addNote = `
INSERT INTO notes
(note_text, recipe_id, user_id)
VALUES ($1, $2, $3);
`;

queries.deleteNote = `
DELETE FROM notes WHERE id = $1;
`;

queries.updateNote = `
UPDATE notes
SET note_text = $1
WHERE id = $2;
`;
// =======================================================================

// FAVORITES TABLE =======================================================
queries.selectAllFavorites = `
SELECT * FROM favorites;
`;

queries.selectFavoritesByUserId = `
SELECT *
FROM favorites
WHERE user_id = $1;
`;

queries.addFavorite = `
INSERT INTO favorites
(user_id, recipe_id)
VALUES ($1, $2);
`;

queries.deleteFavorite = `
DELETE FROM favorites
WHERE id = $1;
`;
// =======================================================================

module.exports = queries;
