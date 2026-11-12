
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AuthMiddleware = require('../middlewares/AuthMiddleware'); 
const AdminMiddleware = require('../middlewares/AdminMiddleware'); 

router.get('/dashboard', AuthMiddleware, AdminMiddleware, AdminController.getDashboard);

module.exports = router;