import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const clients = new Set<WebSocket>();

export function createWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log(`WebSocket client connected. Total: ${clients.size}`);

        ws.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to gateway live feed',
            timestamp: new Date().toISOString(),
        }));

        ws.on('close', () => {
            clients.delete(ws);
            console.log(`WebSocket client disconnected. Total: ${clients.size}`);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err.message);
            clients.delete(ws);
        });
    });

    return wss;
}

export function broadcastRequest(data: {
    id?: number;
    method: string;
    path: string;
    statusCode: number;
    latencyMs: number;
    apiKey: string | null;
    timestamp: string;
}) {

    if (clients.size === 0) return;

    const message = JSON.stringify({
        type: 'new_request',
        data,
    });

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}