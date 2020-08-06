const mongoose = require("mongoose")
const Schema = mongoose.Schema

const User = new Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    isAdmin:{
        type: Number,
        default: 1
    },
    password:{
        type:String,
        required:true
    }
})

mongoose.model("users", User)