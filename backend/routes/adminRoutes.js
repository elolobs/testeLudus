const express = require('express');
const { getUsers, getStatistics } = require('../controllers/adminController');
const router = express.Router();


router.get('/users', getUsers);

router.get('/statistics', getStatistics);

module.exports = router;
