const express = require('express');

const router = express.Router()

const { getAllUsers, loginUser, registerNewUser } = require('../controllers/userController');

router.get('/', getAllUsers)

router.post('/login', loginUser)

router.post('/register', registerNewUser)

module.exports = router;