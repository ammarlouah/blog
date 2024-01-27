const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


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
        const locals = {
            title : "admin",
            desc : "This is a simple blog created by nodejs express and mongodb"
        }
        
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

router.get('/dashboard',authMiddleware,(req,res)=>{
    res.render('admin/dashboard');
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