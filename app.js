const express = require("express");
let { albums } = require("./data"); // Assuming data is an array of albums
const app = express();
const albumRouter = require("./Routes/albumRoutes");
const userRouter = require("./Routes/userRoutes");
const path = require("path"); // Import path library
const cors = require("cors"); // Import cors to unblock CORS policy
const connectMongoDB = require("./db/mongodb");
const errorHandler = require("./Middleware/errorHandler");

app.use(express.json());
// Enable CORS for all origins (in a development environment)
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

connectMongoDB();

app.use("/album", albumRouter);
app.use("/auth", userRouter);

// Error handling middleware
app.use(errorHandler);

// Export the app without starting the server
module.exports = app;
