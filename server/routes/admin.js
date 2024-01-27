const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Post = require('../models/Post')


const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;

    if(!token) return res.status(401).json({message : 'Unauthorized'})

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message : 'Unauthorized'})
    }
}

const adminLayout = '../views/layouts/admin.ejs'

router.get('/admin', async (req,res)=>{
    try {
        const locals = {
            title : "admin",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        
        res.render('admin/index',{locals, layout : adminLayout})
    } catch (error) {
        console.error(error);
    }
})

router.post('/admin', async (req,res)=>{
    try {    
        const {username , password} = req.body;

        const user = await User.findOne({username});

        if(!user) return res.status(401).json({message : "Invalide credentials"})

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid) return res.status(401).json({message : "Invalide credentials"})

        const token = jwt.sign({userId : user._id},process.env.JWT_SECRET);
        res.cookie('token',token,{httpOnly:true});
        res.redirect('dashboard');

    } catch (error) {
        console.error(error);
    }
})

router.get('/dashboard',authMiddleware, async (req,res)=>{
    try {
        const locals = {
            title : "Dashboard",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }

        const data = await Post.find();
        res.render('admin/dashboard',{locals,data,layout : adminLayout});
    } catch (error) {
        
    }
})

router.get('/add-post',authMiddleware, async (req,res)=>{
    try {
        const locals = {
            title : "Add Post",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }

        res.render('admin/add-post',{locals, layout : adminLayout});
    } catch (error) {
        console.error(error);
    }
})

router.post('/add-post',authMiddleware, async (req,res)=>{
    try {
        const newPost = new Post({
            title : req.body.title,
            body : req.body.body
        });
        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
    }
})

router.get('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {
        const locals = {
            title : "Edit Post",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        
        const data = await Post.findOne({_id : req.params.id});
        res.render(`admin/edit-post`,{data,layout: adminLayout});
    } catch (error) {
        console.error(error);
    }
})

router.put('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {
        
        await Post.findByIdAndUpdate(req.params.id,{
            title : req.body.title,
            body : req.body.body,
            updatedAt : Date.now()
        })
        
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.error(error);
    }
})

router.delete('/delete-post/:id',authMiddleware, async (req,res)=>{
    try {
        await Post.deleteOne({_id : req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
    }

})

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/')
})

router.post('/register', async (req,res)=>{
    try {
        const {username , password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        try {
            const user = await User.create({username , password : hashedPassword})
            res.status(201).json({message : "user created" , user});
        } catch (error) {
            if(error.code === 11000) res.status(409).json({message : "user already in use"})
            else res.status(500).json({message : "internal server error"});
        }
    } catch (error) {
        console.error(error);
    }
})

module.exports = router