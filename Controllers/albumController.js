require("express-async-errors");
const AlbumSchema = require("../Models/albumSchema");
const { APIError } = require("../Middleware/appError"); // Import your APIError class

// Get all albums function
const getAllAlbums = async (req, res) => {
  const {
    sortBy = "artist",
    order = "asc",
    startYear,
    endYear,
    fields,
    searchArtist,
    searchTitle,
  } = req.query;

  const sortOrder = order === "asc" ? 1 : -1;
  const sortQuery = { [sortBy]: sortOrder };
  const filterQuery = {};

  if (startYear || endYear) {
    filterQuery.year = {};
    if (startYear) filterQuery.year.$gte = parseInt(startYear, 10);
    if (endYear) filterQuery.year.$lte = parseInt(endYear, 10);
  }

  if (searchArtist) {
    filterQuery.artist = { $regex: searchArtist, $options: "i" };
  }
  if (searchTitle) {
    filterQuery.title = { $regex: searchTitle, $options: "i" };
  }

  const selectFields = fields ? fields.split(",").join(" ") : "";

  const allAlbums = await AlbumSchema.find(filterQuery)
    .sort(sortQuery)
    .select(selectFields);

  return res.status(200).json({ message: "All Albums Fetch Success", allAlbums });
};

// Add album function
const addAlbum = async (req, res) => {
  const { artist, title, year, genre, tracks } = req.body;

  // Validate required fields
  if (!artist || !title || !year || !genre || !tracks) {
    throw new APIError("All fields are required", 400);
  }

  const album = new AlbumSchema({
    artist,
    title,
    year,
    genre,
    tracks,
  });

  const newAlbum = await album.save();
  return res.status(201).json({ message: "New album upload success", newAlbum });
};

// Edit albums
const editAlbums = async (req, res) => {
  const { id } = req.params;
  const { artist, title, year, genre, tracks } = req.body;

  const editedAlbum = await AlbumSchema.findByIdAndUpdate(id, {
    artist,
    title,
    year,
    genre,
    tracks,
  }, { new: true }); // Added { new: true } to return the updated document

  if (!editedAlbum) {
    throw new APIError("Album not found", 404);
  }

  return res.status(200).json({ message: "Album edit success", editedAlbum });
};

// Delete album function
const deleteAlbum = async (req, res) => {
  const { id } = req.params;

  const deletedAlbum = await AlbumSchema.findByIdAndDelete(id);

  if (!deletedAlbum) {
    throw new APIError("Album not found", 404);
  }

  return res.status(200).json({ message: "Album deleted successfully", deletedAlbum });
};

module.exports = { getAllAlbums, addAlbum, editAlbums, deleteAlbum };
