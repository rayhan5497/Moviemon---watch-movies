const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true, // ensures no duplicate movies from TMDB
    },
    imdbId: {
      type: String,
      default: null,
    },
    backdrop_path: {
      type: String,
      default: null,
    },
    genre_ids: {
      type: [Number],
      default: [],
    },
    original_language: {
      type: String,
      default: null,
    },
    original_title: {
      type: String,
      default: null,
    },
    overview: {
      type: String,
      default: null,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    poster_path: {
      type: String,
      default: null,
    },
    release_date: {
      type: String, // TMDB returns it as string ("YYYY-MM-DD")
    },
    title: {
      type: String,
      required: true,
    },
    video: {
      type: Boolean,
      default: false,
    },
    vote_average: {
      type: Number,
      default: 0,
    },
    vote_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

movieSchema.index({ popularity: -1 });
movieSchema.index({ vote_average: -1 });
movieSchema.index({ release_date: -1 });
movieSchema.index({ genre_ids: 1 });
movieSchema.index({ original_language: 1 });
movieSchema.index({ title: 'text', original_title: 'text', overview: 'text' });

movieSchema.index({ original_language: 1, vote_average: -1 });
movieSchema.index({ vote_average: -1, genre_ids: 1 });
movieSchema.index({ original_language: 1, genre_ids: 1 });
movieSchema.index({
  original_language: 1,
  genre_ids: 1,
  vote_average: -1,
  popularity: -1,
});

module.exports = mongoose.model('Movie', movieSchema, 'movies');
