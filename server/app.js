const express = require('express')
const cors = require('cors')
const app = express()
const postsRouter = require('./routes/post')
const authRouter = require('./routes/authRoutes')
const port = process.env.PORT || 5000
const connectDB = require('./db/posts')
require('dotenv').config


const cloudinary = require('cloudinary').v2

cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
})


app.use(cors())
app.use(express.json())


// upload image

app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)

const start = async () => {
        try {
                await connectDB();
                app.listen(port, () => {
                        console.log(`Server is listening on port: ${port}...`)
                })

        } catch (error) {
                console.log(error)
        }
}

start() 