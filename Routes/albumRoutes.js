const express = require('express');
const router = express.Router();
const albumController = require('../Controllers/albumController');
const checkIsUserMiddleware = require('../Middleware/user');// import middleware function
const authMiddleware = require('../Middleware/authMiddleware');

  // Get all albums (protected route)
  router.get('/', authMiddleware, albumController.getAllAlbums);
  
  // Add new album (protected route)
  router.post('/', authMiddleware, albumController.addAlbum);
  
  // Update an album by ID (protected route)
  router.put('/:id', authMiddleware, albumController.editAlbums);
  
  // Delete an album by ID (protected route)
  router.delete('/:id', authMiddleware, albumController.deleteAlbum);



module.exports=router;