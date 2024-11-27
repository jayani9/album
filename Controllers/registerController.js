const User = require("../Models/userSchema"); // Import the User model
const jwt = require("jsonwebtoken");
const { APIError } = require("../Middleware/appError"); // Import your APIError class

// Register new user
const registerUser = async (req, res) => {
  const { name, email, password, passwordConfirmation } = req.body;

  // Check for required fields
  if (!name || !email || !password || !passwordConfirmation) {
    throw new APIError("All fields are required", 400);
  }

  // Check if passwords match
  if (password !== passwordConfirmation) {
    throw new APIError("Passwords do not match", 400);
  }

  try {
    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new APIError("Email is already registered", 400);
    }

    // Create new user
    const newUser = new User({
      name,
      email: normalizedEmail,
      password,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Handle specific error cases if needed
    throw new APIError("Server error", 500);
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new APIError("Email and password are required", 400);
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new APIError("Invalid email or password", 400);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new APIError("Invalid email or password", 400);
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Example: 15 minutes for short-lived token
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" } // Example: 7 days for refresh token
    );

    // Store the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens to the client
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: false, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Use secure flag in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      })
      .status(200)
      .json({
        message: "Login successful",
        accessToken,
      });
  } catch (error) {
    throw new APIError("Server error", 500);
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new APIError("Refresh token is missing", 401);
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user and validate the refresh token from the database
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new APIError("Invalid refresh token", 403);
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Short-lived access token
    );

    res.status(200).json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    throw new APIError("Invalid or expired refresh token", 403);
  }
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(204).json({ message: "No content" }); // No content to clear
  }

  try {
    // Find the user and clear the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    throw new APIError("Logout failed", 500);
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
