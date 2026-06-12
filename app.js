require('dotenv').config();

const express=require('express');
const mongoose=require('mongoose');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema
const PORT=process.env.PORT||4000;
const MONGODB_URL=process.env.MONGODB_URL
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

mongoose.connect(MONGODB_URL)
.then(()=>{console.log("MongoDB connected✅"); app.listen(PORT,()=>console.log(`App running on PORT: ${PORT}`))})
.catch(err=>console.log(err))

const authmiddleware=async (req,res)=>{
const authheader=req.headers.authorization;
if(!authheader)return res.status(401).json({message:"Unauthorized"});
const token=authheader.split(" ")[1];
jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
    if(err) return res.status(401).json({message:"unauthorized"})
})
}