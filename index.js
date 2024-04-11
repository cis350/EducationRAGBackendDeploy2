const webapp = require('./server');

// (5) define the port
//const port = 3001;

// start the server and connect to the DB
/**webapp.listen(port, async () => {
  console.log(`Server running on port: ${port}`);
});*/

const port = process.env.PORT || 3001;
const host = '0.0.0.0';

const server = webapp.listen(port, host, async (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    return;
  }
  console.log(`Server running on port: ${port}`);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname,  "build", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = server;