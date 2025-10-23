const colors = require('colors');

const logger = (req, res, next) => {
  const methodColors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'yellow',
    DELETE: 'red',
  }

  const methodColor = methodColors[req.method] || 'white';

  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} - ${new Date().toISOString()}` [methodColor]);
  next();
}

module.exports = logger;