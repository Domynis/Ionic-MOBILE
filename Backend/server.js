const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

const port = 3000;

//cors middleware
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:8100',  // Allow only the Ionic app
    methods: ['GET', 'POST'],         // Specify allowed HTTP methods
    credentials: true,                 // Allow credentials (if needed)
}));


const icecreams = [
    { id: 1, name: "Chocolate", description: "Our chocolate ice cream is rich, creamy, and deeply chocolaty." },
    { id: 2, name: "Vanilla", description: "Our vanilla ice cream is rich, creamy, and deeply vanillary." },
    { id: 3, name: "Strawberry", description: "Our strawberry ice cream is rich, creamy, and deeply strawberry." }
];

app.get('/', (req, res) => {
    res.send('Hello World!');
});



app.get("/api/icecreams", (req, res) => {
    res.json(icecreams);
});

app.get("/api/icecreams/:id", (req, res) => {
    const icecream = icecreams.find(icecream => icecream.id === parseInt(req.params.id));
    if (!icecream) res.status(404).send("The icecream with the given ID was not found.");
    res.send(icecream);
});


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('notification', {
        id: Math.random().toString(),
        message: 'Welcome to the server!',
        type: 'message',
        timestamp: new Date().toISOString(),
        sender: 'System'
    });

    //every 5 seconds send a new notification
    setInterval(() => {
        socket.emit('notification', {
            id: Math.random().toString(),
            message: 'Test notification from server! Every 5 seconds',
            type: 'message',
            timestamp: new Date().toISOString(),
            sender: 'Server'
        });
    }, 5000);
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/emit-notification', (req, res) => {
    io.emit('notification', {
        id: Math.random().toString(), // Random ID
        message: 'Test notification from server!',
        type: 'message',
        timestamp: new Date().toISOString(),
        sender: 'Server'
    });
    res.send('Notification sent');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});