const express = require('express');
const router = express.Router();
const { upload, uploadImages } = require('../middleware/multer'); // Correctly import 'upload'
const {
        getAllPosts,
        getSinglePost,
        createPost,
        updatePost,
        deletePost,
        uploadInlineImage,
        searchPost // Ensure this is imported
} = require('../controllers/posts');

// Define routes
router.get('/search', searchPost); // Place this before the '/' route
router.get('/:id', getSinglePost);
router.get('/', getAllPosts);

// Use uploadImages middleware for both header and inline images
router.post('/', uploadImages, createPost);
router.patch('/:id', uploadImages, updatePost);
router.delete('/:id', deletePost);

// New route for uploading inline images
router.post('/upload-inline-image', upload.single('inlineImage'), uploadInlineImage); // Ensure 'upload' is defined

module.exports = router;
