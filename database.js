const { Pool } = require('pg');
require('dotenv').config();

let pool;
pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

if (process.env.NODE_ENV == 'development') {
    // Added for troubleshooting queries
    // during development
    module.exports = {
        async query(text, params) {
            try {
                const res = await pool.query(text, params);
                return res;
            } catch (error) {
                console.error('error in query', { text });
                throw error;
            }
        },
    };
} else {
    module.exports = pool;
}
