const webapp = require('./Controller/server');

// Set default port from environment or fallback to 3001
//const port = process.env.PORT || 3001;
const port = 3001;

// Set the host to listen on all network interfaces
//const host = '0.0.0.0'; //'127.0.0.1';

/**
 * Start the server on the specified port and host.
 * @returns {void} Logs the server status to the console.
 */
const server = webapp.listen(port, () => {
  console.log('Server running on port: ', port);
});
// const server = webapp.listen(port, (host), (err) => {
//   if (err) {
//     console.error('Server failed to start:', err);
//     return;
//   }
//   console.log(`Server running on port: ${port}`);
// });

module.exports = server;
