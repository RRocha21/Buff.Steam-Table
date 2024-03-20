import { WebSocketServer } from 'ws';
import fetch from 'node-fetch'; // Import fetch for making HTTP requests

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

export default async function handler(req, res) {
  try {
    // Fetch data from the external server
    const response = await fetch('http://144.64.9.162:8000/steam2buff');
    const properties = await response.json();

    // Send response to HTTP request
    res.status(200).json(properties);

    // Send updated data to connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(properties));
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
