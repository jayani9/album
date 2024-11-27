const mongoose = require("mongoose");

const genres = [
  "Rock",
  "Pop",
  "Jazz",
  "Hip-Hop",
  "Classical",
  "Country",
  "Electronic",
  "Reggae",
  "Blues",
  "Folk",
  "Metal",
  "R&B",
  "Latin",
  "Punk",
  "Indie",
];

const albumSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
  genre: {
    type: String,
    required: true,
    enum: genres,
  },
  tracks: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update the updatedAt timestamp
albumSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Album", albumSchema);
