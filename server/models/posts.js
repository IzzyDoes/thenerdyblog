const mongoose = require('mongoose');
const slugify = require('slugify'); // Use this for generating slugs

const PostSchema = new mongoose.Schema({
        title: {
                type: String,
                required: [true, 'Must Provide Post Title'],
                trim: true,
                maxLength: [100, 'Title cannot be more than 100 characters']
        },
        description: {
                type: String,
                required: [true, 'Must Provide Post Description'],
                trim: true,
                maxLength: [1500, 'Post Description cannot be more than 1500 characters']
        },
        author: {
                type: String,
                required: true,
                trim: true
        },
        headerImage: {
                type: String, // Store the image URL
                trim: true
        },
        slug: {
                type: String,
                required: true,
                unique: true // Slugs must be unique to avoid URL conflicts
        },
        tags: {
                type: [String], // An array of strings for categorizing posts
                default: []
        },
        createdAt: {
                type: Date,
                default: Date.now // Automatically sets the creation date
        },
        published: {
                type: Boolean,
                default: false // Posts are unpublished (draft) by default
        },
        inlineImages: {
                type: [String],
                trim: true
        }
});

// Middleware to automatically generate slug before saving the post
PostSchema.pre('validate', function (next) {
        if (!this.slug) {
                this.slug = slugify(this.title, { lower: true, strict: true });
        }
        next();
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
