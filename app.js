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

const Jobschema=new Schema({
    email:{type:String,required:true},
    subject:{type:String,required:true},
    message:{type:String , required:true},
    userid:{type:Object,required:true}

},{timestamps:true});

const Queueschema=new Schema({
  jobid:{type:String,required:true},
  owner:{type:String,required:true},
  status:{type:String,required:true}
})

 

const User=mongoose.model("User",Userschema);
const Job=mongoose.model("Job",Jobschema);
const Queue=mongoose.model("Queue",Queueschema);


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


app.post("/login",authmiddleware,async (req,res)=>{
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

app.post("/createjob",authmiddleware,async (req,res)=>{
try {
    const user=await findOne({username:req.user});;
    const userid=user.id
    if(!user) return res.status(400).json({message:"User doesn't exist"});
    const {email,subject,messsage}=req.body;
    if(!email||!subject||!message||!userid) return res.status(400).json({message:"Invalid Credentials"});

    await Job.create({userid,email,subject,message});
    await Queue.create({jobid:job.id,owner:userid,status:"pending"});

    // return res.status(200).json({message:"Job created successfully"})


} catch (error) {
    
}
})

// app.post("/queue",authmiddleware,async (req,res)=>{

// })

// app.post("/work",authmiddleware,async (req,res)=>{

// })

