const movieModel = require('../models/movies/movie-model');

const addMovies = async (movies) => {
  console.log('movies added to the database.');

  try {

    // New Movies Ids
    const tmdbIds = movies.map((movie) => movie.id);

    const existingMovies = await movieModel
      .find({ tmdbId: { $in: tmdbIds } })
      .select('tmdbId');

    const existingIds = new Set(existingMovies.map((m) => m.tmdbId));

    console.log('tmdbIds to check:', tmdbIds);
    console.log('Existing IDs in DB:', [...existingIds]);

    const newMovies = movies.filter((movie) => !existingIds.has(movie.id));

    if (newMovies.length === 0) {
      console.log('No new movies to insert.');
      return { insertedCount: 0 };
    }

    const formattedMovies = newMovies.map(({ id, imdb_id, backdrop_path, genres, ...rest }) => ({
      tmdbId: id,
      imdbId: imdb_id || null,
      backdrop_path,
      genre_ids: genres ? genres.map(genre => genre.id) : [],
      ...rest,
    }));

    const result = await movieModel.insertMany(formattedMovies);
    return result;
  } catch (error) {
    console.error('Error adding movies:', error);
    throw error;
  }
};

module.exports = {
  addMovies,
};
