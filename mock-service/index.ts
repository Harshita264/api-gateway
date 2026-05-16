import express from 'express';
import { error } from 'node:console';

const app = express();
const PORT = 4000;

app.use(express.json());

//Basic Endpoint
app.get('/api/users', (req, res) => {
    res.json({
        service: 'mock-backend',
        endpoint: '/api/users',
        data: [
            { id: 1, name: 'Alice'},
            { id: 2, name: 'Bob'},
            { id: 3, name: 'Charlie'},
        ],
    });
});

//Single Resource Endpoint
 app.get('/api/users/:id', (req, res) => {
    res.json({
        service: 'mock-backend',
        endpoint: `/api/users/${req.params.id}`,
        data: {id: req.params.id, name: 'Alice'},
    });
 });

 //Slow Endpoint
app.get('/api/slow', (req, res) => {
    setTimeout(() => {
        res.json({
            service: 'mock-backend',
            endpoint: '/api/slow',
            message: 'I took 2 seconds',
        });
    }, 2000);
});

//Randomly failing endpoint
app.get('/api/unstable', (req,res) => {
    const shouldFail = Math.random() < 0.4;

    if(shouldFail) {
        return res.status(500).json({
            service: 'mock-backend',
            endpoints: '/api/unstable',
            error: 'Something went wrong',
        });
    }

    res.json({
        service: 'mock-backend',
        endpoints: '/api/unstable',
        error: 'Got lucky, request succeeded',
    });
});

//POST Endpoint
app.post('/api/users', (req, res) => {
    res.status(201).json({
        service: 'mock-backend',
        endpoint: '/api/users',
        message: 'User created',
        received: req.body,
    });
});

//Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'mock-backend',
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`Mock backend running on port ${PORT}`);
});
