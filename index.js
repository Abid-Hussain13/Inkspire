import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = 3000;
dotenv.config();

// Middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    time: String,
});

const Blog = mongoose.model("Blog", blogSchema, "blogs");

app.get('/', async(req, res) => {
    const blogs = await Blog.find().sort({ _id: -1 });
    res.render("index", { blogs});
});

app.get('/composser', (req, res) => {
    res.render("composser");
});

app.get('/postview/:id',async (req, res) => {
    const blogId = req.params.id; 
    const blog = await Blog.findById(blogId);

    if (blog) {
        res.render("postview", { blog }); 
    } else {
        res.status(404).send("Blog not found"); 
    }
});
app.get('/postdelete/:id', async (req, res) =>{
    const blogId = req.params.id;
    await Blog.findByIdAndDelete(blogId);

    res.redirect('/');
})
app.get('/postedit/:id', async(req, res) =>{
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    res.render("postEditor",{
        blog : blog,
    });
})

app.post('/submit', async(req, res) => {
    const blogtitle = req.body.title;
    const blogContent = req.body.content;
    const blogTime = new Date().toLocaleString();
    const newBlog = new Blog({ title: blogtitle, content: blogContent, time : blogTime }); 
    await newBlog.save();
    res.redirect("/"); 
});
app.post('/save/:id', async(req, res) => {
    const blogId = req.params.id;
    const blogTitle = req.body.title;
    const blogContent = req.body.content;
    try{
        await Blog.findByIdAndUpdate(blogId, {
            title: blogTitle,
            content: blogContent,
            time: new Date().toLocaleString(),
        });
        res.redirect('/');
    }
    catch(err){
        res.status(500).send("Failed to update blog");
    }
    
})

export default app;