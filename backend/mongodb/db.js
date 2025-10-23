const mongoose = require('mongoose');
const movies = require('../models/movies/movie-model');
const connectionString = process.env.MONGODB_CONNECTION_STRING;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB database.');
    try {
      const result = await movies.syncIndexes();
      console.log('✅ Indexes synced:', result);

      const indexes = await movies.collection.getIndexes();
      console.log('📘 Current indexes:', indexes);
    } catch (err) {

      console.error('❌ Index sync failed:', err);
      // // Drop the index after a failed sync (access the native collection directly)
      // const collection = mongoose.connection.collection('movies'); // Access the collection directly
      // await collection.dropIndex('imdbId_1'); // Drop the conflicting index
      // console.log('✅ Index imdbId_1 dropped successfully.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB database:', error);
    throw error;
  }
};

module.exports = {
  connectToDatabase,
};
