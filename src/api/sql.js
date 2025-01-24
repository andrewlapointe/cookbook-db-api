const queries = {};

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

queries.selectUserById = `SELECT 
    u.id,
    u.username,
    u.email,
    ARRAY_AGG(r.role_name) AS roles
FROM users u
LEFT JOIN user_roles ur 
ON u.id = ur.user_id
LEFT JOIN roles r
ON ur.role_id = r.role_id
WHERE u.id = $1
GROUP BY u.id, u.username
ORDER BY u.id;`;

queries.addUser = `WITH new_user AS ( 
INSERT INTO users (username, email, password_hash) 
VALUES ($1, $2, $3) 
RETURNING id
), role AS (
SELECT role_id 
FROM roles 
WHERE role_name = $4
) 
INSERT INTO user_roles (user_id, role_id) 
SELECT new_user.id, role.role_id 
FROM new_user, role;`;

queries.deleteUser = `DELETE FROM users WHERE id=$1`;

queries.updateUser = `
UPDATE users
SET username = $1, email = $2
WHERE id = $3;
`;

module.exports = queries;
