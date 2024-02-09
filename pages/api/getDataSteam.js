import { connectDb, disconnectDb } from '../../util/db';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

export default async function handler(req, res) {
  let client;

  try {
    client = await connectDb();
    const result = await client.query('SELECT * FROM steam2buff');
    const properties = result.rows;

    // Send updated data to connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(properties));
      }
    });

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
