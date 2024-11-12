const Post = require('../models/posts')
const cloudinary = require('cloudinary').v2;

// Function to upload image to Cloudinary with transformations
const uploadImageToCloudinary = async (buffer, mimetype) => {
        const base64String = buffer.toString('base64');
        const dataUri = `data:${mimetype};base64,${base64String}`;

        try {
                const result = await cloudinary.uploader.upload(dataUri, {
                        folder: 'blog_images',
                        fetch_format: 'auto',
                        quality: 'auto',
                        crop: 'auto',
                        gravity: 'auto'
                });
                return result.secure_url;
        } catch (error) {
                throw error;
        }
};
const getAllPosts = async (req, res) => {
        try {
                // Check if 'all' query is passed to fetch all posts
                const fetchAll = req.query.all === 'true'; // If ?all=true, fetch all posts

                // If 'all' is true, fetch all posts without pagination
                if (fetchAll) {
                        const allPosts = await Post.find();
                        if (allPosts.length === 0) {
                                return res.status(404).json({ message: 'There are no posts available' });
                        }
                        return res.status(200).json(allPosts);
                }

                // Pagination setup: ?page=1&limit=10
                const page = parseInt(req.query.page) || 1; // Default to page 1
                const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
                const skip = (page - 1) * limit;

                // Get the paginated posts
                const posts = await Post.find().skip(skip).limit(limit);

                if (posts.length === 0) {
                        return res.status(404).json({ message: 'There are no posts available' });
                }

                // Get the total number of posts for pagination calculation
                const totalPosts = await Post.countDocuments();
                const totalPages = Math.ceil(totalPosts / limit);

                // Respond with paginated posts and pagination info
                res.status(200).json({
                        posts,
                        currentPage: page,
                        totalPages,
                        totalPosts
                });
        } catch (error) {
                res.status(500).json({ message: 'Error Retrieving Posts', error });
        }
};


const getSinglePost = async (req, res) => {
        try {
                const { id: postID } = req.params
                const post = await Post.findById(postID)
                if (!post) {
                        return res.status(404).json({ message: `No post with ID:${postID}` })
                }
                res.status(200).json(post)
        } catch (error) {
                res.status(500).json({ message: 'Error Retrieving Post', error })
        }
}
const createPost = async (req, res) => {
        try {
                const { title, description, author, tags, published } = req.body;
                let headerImageUrl = '';

                if (req.files) {
                        // Upload header image
                        if (req.files.headerImage) {
                                try {
                                        headerImageUrl = await uploadImageToCloudinary(
                                                req.files.headerImage[0].buffer,
                                                req.files.headerImage[0].mimetype
                                        );
                                } catch (uploadError) {
                                        console.error('Cloudinary Upload Error for Header Image:', uploadError);
                                        return res.status(500).json({ message: 'Header Image Upload Failed', error: uploadError });
                                }
                        }
                }

                // Create a new post
                const post = new Post({
                        title,
                        description,
                        author,
                        tags,
                        headerImage: headerImageUrl,
                        inlineImages: [], // Initialize inlineImages as empty; handled separately
                        published
                });

                await post.save();
                res.status(201).json(post);
        } catch (error) {
                console.error('Error Creating Post:', error);
                res.status(500).json({ message: 'Error Creating Post', error });
        }
};

// New function to handle inline image uploads
const uploadInlineImage = async (req, res) => {
        try {
                if (!req.file) {
                        return res.status(400).json({ message: 'No file uploaded.' });
                }

                const imageUrl = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
                res.status(200).json({ imageUrl });
        } catch (error) {
                console.error('Error uploading inline image:', error);
                res.status(500).json({ message: 'Image upload failed', error });
        }
};

const updatePost = async (req, res) => {
        try {
                const { id: postID } = req.params;
                const { title, description, author, tags, published } = req.body;

                const updatedFields = { title, description, author, tags, published };
                let headerImageUrl = '';
                const inlineImageUrls = [];

                // Check for updated images in the request
                if (req.files) {
                        // Update header image if provided
                        if (req.files.headerImage) {
                                try {
                                        headerImageUrl = await uploadImageToCloudinary(
                                                req.files.headerImage[0].buffer,
                                                req.files.headerImage[0].mimetype
                                        );
                                        updatedFields.headerImage = headerImageUrl;
                                } catch (uploadError) {
                                        console.error('Cloudinary Upload Error for Header Image:', uploadError);
                                        return res.status(500).json({ message: 'Header Image Update Failed', error: uploadError });
                                }
                        }

                        // Update inline images if provided
                        if (req.files.inlineImages) {
                                for (const file of req.files.inlineImages) {
                                        try {
                                                const url = await uploadImageToCloudinary(file.buffer, file.mimetype);
                                                inlineImageUrls.push(url);
                                        } catch (uploadError) {
                                                console.error('Cloudinary Upload Error for Inline Images:', uploadError);
                                                return res.status(500).json({ message: 'Inline Image Update Failed', error: uploadError });
                                        }
                                }
                                updatedFields.inlineImages = inlineImageUrls; // Update inline images array
                        }
                }

                // Update the post
                const updatedPost = await Post.findByIdAndUpdate(postID, updatedFields, { new: true, runValidators: true });
                if (!updatedPost) {
                        return res.status(404).json({ message: `No post with ID: ${postID}` });
                }
                res.status(200).json(updatedPost);
        } catch (error) {
                console.error('Error Updating Post:', error);
                res.status(500).json({ message: 'Error Updating Post', error });
        }
}

const deletePost = async (req, res) => {
        try {
                const { id: postID } = req.params
                const deletedPost = await Post.findByIdAndDelete(postID)
                if (!deletedPost) {
                        return res.status(404).json({ message: `No post with ID: ${postID}` })
                }

                if (deletePost.headerImage) {
                        try {
                                const publicId = deletedPost.headerImage.split('/').pop().split('.')[0]; // Extract public_id from URL
                                await cloudinary.uploader.destroy(`blog_images/${publicId}`);
                        } catch (deleteError) {
                                console.error('Cloudinary Deletion Error:', deleteError);
                                return res.status(500).json({ message: 'Error Deleting Image from Cloudinary', error: deleteError })
                        }
                }

                res.status(200).json({ message: `${deletedPost} was deleted succesfully` })
        } catch (error) {
                res.status(500).json({ message: 'Error Deleting post', error })
        }
}

const searchPost = async (req, res) => {
        try {
                const query = req.query.q;
                if (!query) {
                        return res.status(400).json({ message: 'Query parameter is required' });
                }
                const searchResult = await Post.find({
                        $or: [
                                { title: { $regex: query, $options: 'i' } }, // Case insensitive search in title
                                { description: { $regex: query, $options: 'i' } }, // Case insensitive search in description
                                { tags: { $regex: query, $options: 'i' } } // Case insensitive search in tags
                        ]
                }).limit(10); // Limit to 10 results

                if (!searchResult.length) {
                        return res.status(404).json({ message: 'No posts found matching your query.' });
                }
                res.json({ searchResult });
        } catch (error) {
                console.error('Error searching posts:', error);
                res.status(500).json({ message: 'Server error.', error });
        }
}




module.exports = {
        getAllPosts,
        getSinglePost,
        createPost,
        updatePost,
        deletePost,
        searchPost,
        uploadInlineImage
}