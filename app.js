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
    username:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
},{timestamps:true});

const Jobschema=new Schema({
    recipient:{type:String,required:true},
    subject:{type:String,required:true},
    message:{type:String , required:true},
    userid:{type:Object,required:true},
    retrycount:{type:Number,required:true},
    status:{type:String,required:true},
    createdAt:{type:Date,required:true},
    completedAt:{type:Date,required:false}

},{timestamps:true});

// const Queueschema=new Schema({
//   jobid:{type:String,required:true},
//   owner:{type:String,required:true},
//   status:{type:String,required:true}
// })

 

const User=mongoose.model("User",Userschema);
const Job=mongoose.model("Job",Jobschema);
// const Queue=mongoose.model("Queue",Queueschema);


app.use(express.json());
app.use(express.urlencoded({extended:true}));


mongoose.connect(MONGODB_URL)
.then(()=>{console.log("MongoDB connected✅"); app.listen(PORT,()=>console.log(`App running on PORT: ${PORT}`))})
.catch(err=>console.log(err))



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

app.post("/register",async (req,res)=>{
try {
    const {username,password,email}=req.body;
    if(!username||!password||!email) return res.status(400).json({messsage:"invalid credentials"})
    const validatename=username.trim().toLowerCase();
    const validateemail=email.trim();
    const encryptedpassword=await bcrypt.hash(password,10);
    const existinguser=await User.findOne({username:validatename});
    if(existinguser) return res.status(401).json({message:"User already exists"});

    await User.create({username:validatename,password:encryptedpassword,email:validateemail});
    const token=jwt.sign({username:validatename},JWT_SECRET);
    return res.status(200).json({message:`User: ${username} created successfully`,token});

} catch (error) {
    console.log(error)
}

})


app.post("/login",async (req,res)=>{
try {

    const {username,password}=req.body;
    if(!username||!password) return res.status(400).json({messsage:"invalid credentials"})
    const validatename=username.toLowerCase().trim();
    
    const user=await User.findOne({username:validatename});
    if (!user) return res.status(401).json({message:"Invalid Credentials"});
    const match=await bcrypt.compare(password,user.password);
    if(!match) return res.status(401).json({message:"Invalid Credentials"});
    const token=jwt.sign({username:validatename,userid:user.id},JWT_SECRET);
    return res.status(200).json({message:`Welcome back, ${username}!`,token});
} catch (error) {
    console.log(error)
}
})



//----------------------------------------UNTESTED CODE-------------------------------------------
app.post("/createjob",authmiddleware,async (req,res)=>{
try {
    const {recipient,subject,messsage}=req.body;
    if(!recipient||!subject||!message||!userid) return res.status(400).json({message:"Invalid Credentials"});
    const user=await User.findOne({username:req.user.username});
    const userid=user.id
    if(!user) return res.status(400).json({message:"User doesn't exist"});

    await Job.create({recipient,subject,message,userid,status:"pending",retrycount:0,createdAt:new Date()});
    console.log("Job created successfully");

    // const job=await Job.find({userid:userid,status:"pending"}).sort({createdAt:1});

//you stopped on getting job , now you will create a queue but finished testing all this


} catch (error) {
    
}
});



// app.post("/queue",authmiddleware,async (req,res)=>{

// })

// app.post("/work",authmiddleware,async (req,res)=>{

// })



