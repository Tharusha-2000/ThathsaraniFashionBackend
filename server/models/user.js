const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema({

    fname:{
      type: String,
    //  required: true,
    },
    
    lname:{
      type: String,
     // required: true,
    },

    dob:{
      type: String,
    //  required: true,
    },

    role:{
      type: String,
    //  required: true,
      default: "user", 
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    jobtitle:{
      type: String,
      required:false,
    },
    employmentType:{
      type: String,
      required:false,
    },
    department:{
      type: String,
      required:false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    cvUrl :{
      type: String,
      required: false,
    },
 
  university: {
    type: String,
   // required: true
  },

  GPA: {
    type: Number,
   // required: true
  },
  phonenumber: {
    type: Number,
   // required: true
  },
 
  schedules: [{
    title: String,
    start: Date,
    end: Date,
  }],
  
   },
  );
   userSchema.pre("save", async function () {
     this.password = await bcrypt.hash(this.password, 12);

     });
   
const User = mongoose.model("users", userSchema);

module.exports = User;