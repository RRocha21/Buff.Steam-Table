// db.js

import { Pool } from 'pg';

const pool = new Pool({
  user: 'doadmin',
  host: 'db-steam-buff-bot-do-user-13097918-0.c.db.ondigitalocean.com',
  database: 'Pool1',
  password: 'AVNS_GRvfxsqSGM1kpyI0Gqr',
  port: 25061, // your PostgreSQL port
  ssl: {
    rejectUnauthorized: false, // Use only in development if your PostgreSQL server uses self-signed certificates
  },
});

export const connectDb = async () => {
  const client = await pool.connect();
  return client;
};

export const disconnectDb = (client) => {
  client.release();
};