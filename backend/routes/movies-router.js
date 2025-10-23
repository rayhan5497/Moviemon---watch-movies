const express = require('express');

const router = express.Router();

const { getMovies } = require('../controllers/movies-controller');

router.get('/', getMovies);

module.exports = router;
