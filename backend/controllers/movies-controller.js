const { initGetMoviesApp } = require('../api/tmdb-api');
const { addMovies } = require('../mongodb/mongodb');
const movieModel = require('../models/movies/movie-model');

const getMovies = async (req, res) => {
  try {
    const param = req.query;
    const body = req.body;

    if (param && Object.keys(param).length > 0) {
      const query = {...param};
      console.log('Query received in getMovies controller:', query);
      const data = await initGetMoviesApp(query);
      await addMovies(data.results); 
      res.status(200).json(data);
    } else {
      console.log('Body received in getMovies controller:', body);
      const query = {...body};
      const data = await initGetMoviesApp(query);
      await addMovies(data.results);
      res.status(200).json(data);   
    }
  } catch (error) {
    console.error('Error in getMovies controller:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  getMovies, 
}