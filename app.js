require('dotenv').config();

const express=require('express');
const mongoose=require('mongoose');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema
const PORT=process.env.PORT;
const MONGODB_URL=process.env.MONGODB_URL
const app=express();

mongoose.connect("")
.then(()=>{console.log("MongoDB connected✅"); app.listen(PORT,()=>console.log(`App running on PORT: ${PORT}`))})
.catch(err=>console.log(err))

const authmiddleware=async (req,res)=>{

}