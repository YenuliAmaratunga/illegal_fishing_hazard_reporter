require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

const checklistRoutes = require('./routes/checklistRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => res.status(200).send('OK'));

app.use('/', checklistRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB connected');   
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});