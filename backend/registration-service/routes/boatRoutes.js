const express = require('express');
const route = express.Router();
const boatController = require('../controllers/registerBoat');
const { authMiddleware, authorizeRoles}  = require('../Authmiddleware/authMiddleware')
const multerMiddleware = require('../multerMiddleware/storage');

route.post('/registerBoat',authMiddleware,multerMiddleware.fields([{ name: 'license', maxCount: 1 }, { name: 'images', maxCount: 6 }]),boatController.registerBoat);
route.get('/viewAllBoats',boatController.viewAllBoats);


module.exports = route;