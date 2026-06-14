require('dotenv').config();

const express=require('express');
const mongoose=require('mongoose');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const Schema=mongoose.Schema
const PORT=process.env.PORT||4000;
const MONGODB_URL=process.env.MONGODB_URL
const app=express();
const JWT_SECRET=process.env.JWT_SECRET;

const Userschema=new Schema({
    name:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
},{timestamps:true});

const User=mongoose.model("User",Userschema)

app.use(express.json());
app.use(express.urlencoded({extended:true}));

mongoose.connect(MONGODB_URL)
.then(()=>{console.log("MongoDB connected✅"); app.listen(PORT,()=>console.log(`App running on PORT: ${PORT}`))})
.catch(err=>console.log(err))


//----------------------------------------UNTESTED CODE-------------------------------------------

const authmiddleware=async (req,res)=>{
    const authheader=req.headers.authorization;
    if(!authheader)return res.status(401).json({message:"Unauthorized"});
    const token=authheader.split(" ")[1];
    jwt.verify(token,JWT_SECRET,(err,decoded)=>{
    if(err) return res.status(401).json({message:"unauthorized"})
    req.user=decoded;
    next()
})

}

app.post("/register",authmiddleware,async (req,res)=>{
try {
    const {name,password,email}=req.body;
    const validatename=name.trim().toLowerCase();
    const validateemail=email.trim();
    const encryptedpassword=await bcrypt.hash(password,10);
    const existinguser=await User.findOne({name:validatename});
    if(existinguser) return res.status(401).json({message:"User already exists"});

    await User.create({name:validatename,password:encryptedpassword,email:validateemail});
    const token=jwt.sign(username,{JWT_SECRET});
    return res.status(200).json({message:`User "${name} created successfully"`});

} catch (error) {
    console.log(error)
}

})


app.post("/login",authmiddleware,(req,res)=>{
try {
    const {name,password}=req.body;
    const validatename=name.toLowerCase().trim();
    const user=User.findOne({name:validatename});
    if (!user) return res.status(401).json({message:"Invalid Credentials"});
    const match=await bcrypt.compare(password,user.password);
    if(!match) return res.status(401).json({message:"Invalid Credentials"});
    const token=jwt.sign(username,{JWT_SECRET});
    return res.status(200).json({message:`Welcome back, "${name}!"`});
} catch (error) {
    console.log(error)
}
})