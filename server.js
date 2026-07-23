const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// -------------------- Connect to Remote Hosted DataBase ---------------------- //
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.connect(DB, {
//   // useNewUrlParser: true,
// }).then(() => console.log('Remote database connection successfull!')).catch(err => {
//   console.log("ERROR: " + err);
// });

mongoose.connect(process.env.DATABASE_LOCAL, {
}).then(async () => {
  console.log('Local database connection successfull!');
}).catch(err => {
  console.log("ERROR: " + err);
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const port = process.env.PORT || '3000';
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});