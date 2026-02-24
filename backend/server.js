const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { startMLService } = require('./services/mlService');

dotenv.config();
connectDB();

// Start Background ML Service
startMLService();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Pass io to routes via middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/institution', require('./routes/institutionRoutes'));
app.use('/api/building', require('./routes/buildingRoutes'));
app.use('/api/room', require('./routes/roomRoutes'));
app.use('/api/device', require('./routes/deviceRoutes'));
app.use('/api/reading', require('./routes/readingRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

// Socket connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Production Server running on port ${PORT}`);
});
