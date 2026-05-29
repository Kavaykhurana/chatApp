import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ quiet: true });

const { Pool } = pg;

const useConnectionString = Boolean(process.env.DATABASE_URL);
const shouldUseSsl =
  process.env.DB_SSL === "true" || (useConnectionString && process.env.DB_SSL !== "false");
const schemaName = process.env.DB_SCHEMA?.trim();

const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      },
);

if (schemaName) {
  pool.on("connect", (client) => {
    client.query(`SET search_path TO ${quoteIdentifier(schemaName)}, public`);
  });
}

export const query = (text, params) => pool.query(text, params);
export default pool;
