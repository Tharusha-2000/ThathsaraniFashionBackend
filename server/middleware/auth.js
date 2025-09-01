const jwt = require('jsonwebtoken');
const User = require('../models/user');



/** auth middleware */
 async function Auth(req, res, next){
    try {
        // access authorize header to validate request
        const token = req.headers.authorization.split(" ")[1];
        // retrive the user details fo the logged in user
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        req.data = decodedToken;
        console.log("decodedToken");
        console.log(decodedToken);    
       

        next()

    } catch (error) {
        res.status(401).json({ error : "Authentication Failed!"})
    }


} 


 function localVariables(req, res, next){
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
   
    next();
}



async function IsAdmin(req, res, next){
    const {id} =req.data;
    const user = await User.findById(id);

     if (user.role !== "Admin") {
          return res
            .status(403)
            .json({ msg: "You do not have permission to access this function" });
        }
            next();
  
}


async function IsUser(req, res, next){
    const {id} = req.data;
    const user = await User.findById(id);
 
    if (!user) {
        return res
          .status(404)
          .json({ msg: "User not found" });
    }
    
     req.user = user;
     next();
}



module.exports ={Auth, localVariables,IsAdmin,IsUser};


