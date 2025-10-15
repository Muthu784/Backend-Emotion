import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

function getDatabaseConfig() {
    // Prefer DATABASE_URL when provided (e.g., cloud providers)
    if (process.env.DATABASE_URL) {
        const useSsl = (
            process.env.PGSSL === "true" ||
            process.env.PGSSLMODE === "require" ||
            process.env.NODE_ENV === "production"
        );
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: useSsl ? { rejectUnauthorized: false } : undefined
        };
    }

    const useSsl = (
        process.env.PGSSL === "true" ||
        process.env.PGSSLMODE === "require" ||
        process.env.NODE_ENV === "production"
    );

    const config = {
        host: process.env.PGHOST || process.env.host,
        user: process.env.PGUSER || process.env.PG_USER,
        password: process.env.PGPASSWORD || process.env.password,
        port: Number(process.env.PGPORT || process.env.port) || 5432,
        database: process.env.PGDATABASE || process.env.database,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined
    };

    const missing = Object.entries({
        PGHOST: config.host,
        PGUSER: config.user,
        PGPASSWORD: config.password,
        PGDATABASE: config.database
    }).filter(([_, value]) => !value);

    if (missing.length > 0) {
        const missingKeys = missing.map(([key]) => key).join(", ");
        throw new Error(`Database configuration is missing required env vars: ${missingKeys}`);
    }

    return config;
}

let pool;
try {
    const dbConfig = getDatabaseConfig();
    pool = new Pool(dbConfig);
} catch (configError) {
    // Surface a clear configuration error early
    console.error(configError.message);
    // Create a dummy pool that will throw on use to avoid undefined imports
    pool = {
        query: async () => { throw configError; },
        on: () => {}
    };
}

pool.on("connect", () => {
    console.log("Postgres database connection established");
});

pool.on("error", (err) => {
    console.error("Unexpected Postgres error", err);
});

export default pool;
