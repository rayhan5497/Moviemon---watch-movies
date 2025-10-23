// NPM Modules
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const path = require('path');

const port = process.env.PORT || 3000;
const app = express();

// Middlewares
const loggerMiddleware = require('./middleware/logger-middleware');
const errorMiddleware = require('./middleware/error-middleware');
const notFoundMiddleware = require('./middleware/notFound-middleware');

// Routes
const dataRouter = require('./routes/data-router');
const userRouter = require('./routes/user-router');
const moviesRouter = require('./routes/movies-router');

// DB Connector module
const { connectToDatabase } = require('./mongodb/db');

// // Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

// Third-party middlewares
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://127.0.0.1:3000',
  'http://192.168.0.198:5173',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Logger middleware
app.use(loggerMiddleware);

// Routes
app.use('/data', dataRouter);
app.use('/user', userRouter);
app.use('/movies', moviesRouter);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database. Server not started.', error);
});
