const registerUserModel = require('../models/users/registerUser-model');
const userModel = require('../models/users/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAllUsers = async (req, res) => {
  const users = await registerUserModel.find();
  res.status(200).json(users);
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const cookie = req.cookies;
  if (!cookie) {
    console.log('No token found in cookies');
  }
  console.log('cookie', cookie);

  try {
    const findUserByEmail = await registerUserModel.findOne({ email: email });

    if (!findUserByEmail) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }

    const passwordMatch = await bcrypt.compare(
      password,
      findUserByEmail.password
    );
    if (!passwordMatch) {
      const error = new Error('Incorrect password');
      error.status = 401;
      return next(error);
    }

    const { password: pwd, ...userData } = findUserByEmail.toObject();

    const token = jwt.sign(
      { userId: userData._id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true, // prevents JS access (protects against XSS)
      sameSite: 'Lax', // good default; use 'Strict' or 'None' if needed
      maxAge: 3600000, // 1 hour in milliseconds
      // secure: process.env.NODE_ENV === 'production',
      secure: false, // Set to true if using HTTPS
    });

    console.log('user', userData, 'token', token, 'cookie', req.cookies);
    res.status(200).json({ ...userData, token });
  } catch (err) {
    console.log('Error during user login:', err);
    const error = new Error('Internal Server Error');
    error.status = 500;
    return next(error);
  }
};

const registerNewUser = async (req, res, next) => {
  const { email, password } = req.body;

  console.log(
    `register new user with email : ${email} and password: ${password}`
  );

  // Encrypt the password before storing (hashing can be added here)
  const incryptedPassword = await bcrypt.hash(password, 10);

  let newUser = null;

  if (!email || !password) {
    console.log('please provide: email and password');
    const error = new Error('please provide: email and password');
    error.status = 400;
    return next(error);
  }

  const existingEmail = await registerUserModel.findOne({ email: email });
  if (existingEmail) {
    console.log('User with this email already exists');
    const error = new Error('User with this email already exists');
    error.status = 409;
    return next(error);
  }

  try {
    if (email && password) {
      newUser = await registerUserModel.create({
        email,
        password: incryptedPassword,
        userName: 'My Name',
        name: 'My Name',
        profilePicture: 'default-profile-pic-url',
      });
    }

    console.log('newUser', newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.log('Error during user registration:', err);
    const error = new Error('Internal Server Error');
    error.status = 500;
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  loginUser,
  registerNewUser,
};
