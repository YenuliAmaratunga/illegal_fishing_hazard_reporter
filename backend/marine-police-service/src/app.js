const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

//Basic route to test
app.get('/', (req,res) => {
    res.json({ message: 'Marine Police Service is running'});
}); 

//Routes
app.use('/api/police', require('./routes/policeRoutes'));

module.exports = app;