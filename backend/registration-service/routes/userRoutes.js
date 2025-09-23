const express = require('express');
const router = express.Router();
const UserController= require('../controllers/registerUser');
const loginUserController = require('../controllers/loginUser');
const { authMiddleware, authorizeRoles}  = require('../Authmiddleware/authMiddleware')

router.post('/registerUser',UserController.registerUser);
router.get('/retrieveUsers',authMiddleware,authorizeRoles("admin"), UserController.retrieveRequests);
router.get('/retrieveRequests',authMiddleware,authorizeRoles("admin"), UserController.statusBasedRequests);
router.put('/updateRequest/:id',authMiddleware,authorizeRoles("admin"),UserController.updateStatus);
router.post('/login',loginUserController.login);




module.exports = router;