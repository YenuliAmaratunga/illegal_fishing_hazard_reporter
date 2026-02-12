const express = require('express');
const route = express.Router();
const boatController = require('../controllers/registerBoat');
const { authMiddleware, authorizeRoles}  = require('../Authmiddleware/authMiddleware')
const multerMiddleware = require('../multerMiddleware/storage');

route.post('/registerBoat',authMiddleware,multerMiddleware.fields([{ name: 'license', maxCount: 1 }, { name: 'images', maxCount: 6 }]),boatController.registerBoat);
route.get('/viewAllBoatRequests',authMiddleware,authorizeRoles("admin"),boatController.viewAllBoatRequests);
route.get('/findBoatequests',authMiddleware,authorizeRoles("admin"),boatController.statusBasedBoatRegRequests);
route.put('/updateBoatRegRequestStatus/:id',authMiddleware,authorizeRoles("admin"),boatController.updateBoatRequests);
route.get('/viewBoatRegRequestsMade/:id',boatController.viewAllBoatRequestsByFisherman);










module.exports = route;