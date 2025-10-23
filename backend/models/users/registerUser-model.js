const mongoose = require('mongoose');

const registerUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },  
    name: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    profilePicture: { type: String, required: true },
  }
);

module.exports = mongoose.model('RegisterUser', registerUserSchema, 'users');
