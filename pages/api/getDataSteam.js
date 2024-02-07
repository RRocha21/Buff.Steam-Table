import { connectDb, disconnectDb } from '../../util/db';

export default async function handler(req, res) {
  let client;

  try {
    client = await connectDb();
    const result = await client.query('SELECT * FROM Steam2Buff');
    const properties = result.rows;

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error querying PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      disconnectDb(client);
    }
  }
}