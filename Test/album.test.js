const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../app");
const AlbumSchema = require("../Models/albumSchema");

let token; //  generate token to test purpose
let albumIdToDelete; // Store the ID of an album for deletion

// Set up the database before tests
beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(process.env.TEST_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Seed the database with known albums
  const albums = [
    {
      artist: "Artist 1",
      title: "Album 1",
      year: 2020,
      genre: "Pop",
      tracks: 10,
    },
    {
      artist: "Artist 2",
      title: "Album 2",
      year: 2021,
      genre: "Rock",
      tracks: 8,
    },
    {
      artist: "Artist 3",
      title: "Album 3",
      year: 2022,
      genre: "Jazz",
      tracks: 12,
    },
  ];

  // Insert the test albums into the database
  const insertedAlbums = await AlbumSchema.insertMany(albums);
  albumIdToDelete = insertedAlbums[0]._id.toString(); // Store the ID of the first album for deletion

  // Generate a mock JWT token
  token = jwt.sign({ userId: "12345" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
});

// Clean up after tests are finished
afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Clean up the test database
  await mongoose.disconnect(); // Disconnect the test database
});

describe("GET albums", () => {
  it("All Albums Fetch Success", async () => {
    const response = await request(app)
      .get("/album")
      .set("Authorization", `Bearer ${token}`); // Include the mock token in the request header

    // Check the status and the number of albums in the response
    expect(response.status).toBe(200);
    expect(response.body.allAlbums.length).toBe(3); // Since we inserted 3 albums
  });
});

describe("POST albums", () => {
  it("New album upload success", async () => {
    const initialCount = await AlbumSchema.countDocuments();

    // New album data to add
    const newAlbum = {
      artist: "Artist 4",
      title: "Album 4",
      year: 2023,
      genre: "Pop",
      tracks: 9,
    };

    const response = await request(app)
      .post("/album") // Ensure the correct route is being called
      .set("Authorization", `Bearer ${token}`) // Include the mock token
      .send(newAlbum);

    expect(response.status).toBe(201);
    expect(response.body.newAlbum).toMatchObject(newAlbum);

    // Get the new count of albums in the database
    const newCount = await AlbumSchema.countDocuments();

    // Check if the album count has increased by 1
    expect(newCount).toBe(initialCount + 1);
  });
});

describe("DELETE album/:id", () => {
  it("Album deleted successfully", async () => {
    // Get the initial count of albums in the database
    const initialCount = await AlbumSchema.countDocuments();

    // Make the DELETE request to remove the album
    const response = await request(app)
      .delete(`/album/${albumIdToDelete}`)
      .set("Authorization", `Bearer ${token}`); // Include the mock token

    // Check if the response status is 200 (successful deletion)
    expect(response.status).toBe(200);

    // Check if the album count has decreased by 1
    const newCount = await AlbumSchema.countDocuments();
    expect(newCount).toBe(initialCount - 1);

    // Verify that the deleted album is no longer in the database
    const deletedAlbum = await AlbumSchema.findById(albumIdToDelete);
    expect(deletedAlbum).toBeNull();
  });

  it("should return 404 when trying to delete a non-existent album", async () => {
    // Generate a non-existent album ID
    const nonExistentAlbumId = new mongoose.Types.ObjectId();

    // Make the DELETE request for the non-existent album
    const response = await request(app)
      .delete(`/album/${nonExistentAlbumId}`)
      .set("Authorization", `Bearer ${token}`); // Include the mock token

    // Check if the response status is 404 (not found)
    expect(response.status).toBe(404);

    // Check if the response message is appropriate
    expect(response.body.message).toBe("Album not found");
  });
});
