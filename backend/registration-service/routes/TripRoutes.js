const express = require('express');
const route = express.Router();
const {registerTrip} = require('../controllers/registerTrip'); 
const {authMiddleware}= require('../Authmiddleware/authMiddleware')


route.post('/registerTrip', authMiddleware, registerTrip);

module.exports = route;
