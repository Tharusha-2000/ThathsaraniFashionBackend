var nodemailer = require('nodemailer');
const otpGenerator = require("otp-generator");
const User = require("../models/user.js");



exports.sendingOTPMail = async (req, res) => {
    try {
      const { email } = req.body;
      const otp = req.app.locals.OTP; 
     
      var transporter = nodemailer.createTransport({
        service: 'gmail',
         auth: {
           user: process.env.Email,
           pass: process.env.Password
         }
       });
     
     var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: 'Sending otp',
        html:`
        <div style="width: 500px; padding: 20px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
                 <h1 style="color: blue; text-align: center;">Your OTP</h1>
                 <p style="text-align: center; color: #333; font-size: 20px;">${otp}</p>
        </div>
        `
   
     };

  transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       console.log(error);
       res.status(500).json({ msg: "server error"});
     } else {
       console.log('Email sent: ' + info.response);

       res.status(201).send({ msg: "otp send!",code: otp})

     }
    });

    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };


exports.sendWelcomeEmail = (req, res) => {
  
  try {
   const { email, password,user, token } = res.locals.userData;

    var transporter = nodemailer.createTransport({

        service: 'gmail',
        auth: {
          user: process.env.Email,
          pass: process.env.Password
        }
      });
      
      var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: 'registeration successful',
        html:  `
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">
              <h1 style="color: blue; text-align: center;">Welcome to Thathsarani </h1>
              <p style="text-align: center; color: #333;">You have successfully registered to the Thathsarani. Here are your details:</p>
              <div style="background-color: #fff; padding: 10px; border-radius: 10px; margin: 20px 0; color: #333;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              <p style="text-align: center; color: #333;">Your are welcome!</p>
              <p style="text-align: center; color: #333;"><a href="https://imsfrontend.verce/">Visit our site</a></p>
            </div> `


      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
            res.status(500).json({ msg: "server error"});
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({ msg: "User registered successfully",success: true,user:user,token: token });
        }
      });
      

    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
 
};

exports.sendEmail = (req, res) => {
  
  try {
    const { email, cartItems, totalPrice } = res.locals.userData;
    console.log(email,cartItems,totalPrice);

    var transporter = nodemailer.createTransport({

        service: 'gmail',
       // port: 534,
        auth: {
          user: process.env.Email,
          pass: process.env.Password 
        }
      });
      
      var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: `Order Details for Order `,
        html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <h1 style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #444; margin: 0;">
      Thathsarani Fashion
    </h1>
    <div style="padding: 20px;">
      <p style="font-size: 16px;">Dear Customer,</p>
      <p style="font-size: 16px;">Thank you for shopping with us! Here are the details of your order:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <thead>
          <tr style="background-color: #f9f9f9;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Size</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map(
              (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                  <img src="${item.productId.imageUrl}" alt="${item.productId.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                  ${item.productId.name}
                </td>
               
                <td style="border: 1px solid #ddd; padding: 10px;">${item.clothSize}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${item.count}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">Rs:${item.unitPrice}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
      <p style="font-size: 16px; font-weight: bold; text-align: right;">Total Price: Rs:${totalPrice.toFixed(2)}</p>
      <p style="font-size: 14px;">We hope to see you again soon!</p>
    </div>
    <footer style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
      &copy; ${new Date().getFullYear()} Thathsarani Fashion. All rights reserved.
    </footer>
  </div>
`,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({ msg: "User send email successfully", success: true});
        }
      });
      
     
    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
 
};

