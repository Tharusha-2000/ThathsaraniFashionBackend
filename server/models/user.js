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
    address: {
      type: String,
      required: false,
    },
    phoneNo: {
    type: Number,
    // required: true
    }
  
   },
  );
   userSchema.pre("save", async function () {
     this.password = await bcrypt.hash(this.password, 12);

     });
   
const User = mongoose.model("users", userSchema);

module.exports = User;