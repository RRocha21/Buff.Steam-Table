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
    const response = await fetch('http://82.155.128.144:8000/buff2steam');
    
    const data = await response.json();
    
    // Send response to HTTP request
    res.status(200).json(data);

    // Send updated data to connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data)); // Send JSON string
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
