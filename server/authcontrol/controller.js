const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Product = require("../models/product.js");
const Cart = require("../models/Cart.js"); 
const Order = require("../models/Order.js"); 
const Stripe = require("stripe");
const stripe = Stripe(process.env.StripeSecretKey);
const fs = require("fs");
const fetch = require("node-fetch"); 
const path = require("path");
/*..............................login page.............................................*/




exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ loginStatus: false, msg: "Incorrect email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ loginStatus: false, msg: "Incorrect password" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role ,fname:user.fname },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      msg: "Login Successful...!",
      username: user.username,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ loginStatus: false, Error: "Internal Server Error" });
  }
};


/*generateOTP in 6 digit */
exports.generateOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ msg: "User not registered" });
    } else {
      const otp = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      // Store OTP in req.app.locals for later verification if needed
      req.app.locals.OTP = otp;

      const otpTimeout = setTimeout(() => {
        req.app.locals.OTP = null;
      }, 1 * 60 * 1000);


      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};


/* verifyOTP that email */
exports.verifyOTP = async (req, res) => {
  const { code } = req.query;

  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ msg: "Invalid OTP" });
};


/* reset password */
exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).json({ msg: "Session expired!" });

    const { email, password } = req.body;
    console.log(req.body);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ message: "User not registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.updateOne(
        {
          email: email,
        },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      req.app.locals.resetSession = false; // reset session
      return res.status(201).json({ msg: "Record Updated...!" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } catch (error) {
    return res.status(401).json({ error: "Invalid Request" });
  }
};

/*.............................registation add user table............................*/

 // Fetch all users from the user database
exports.getUsers = async (req, res) => {
  try {
  
    // Fetch all users from the database
    const users = await User.find();
    const data = res.status(201).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

// Get user by ID
exports.getUserById= async (req, res) => {
  try {
    const { id } = req.data;
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
   
     res.status(201).json({ success: true, user});
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


 // deleteuser  from the user database
exports.deleteUser = async (req, res) => {
  try {
    
    let id = req.params.id;
    console.log(id);
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json("User not found");
    }
    
     await Cart.deleteMany({ userId: id });   
    
     await Order.deleteMany({ userId: id });  
    
    //if loguser delete him  then active this 
     if (req.data.id === id) {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }

    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

//register user
exports.register = async (req, res, next) => {
  try {
 
    const { fname,lname,email, password} = req.body;
    console.log(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ msg: "User already exists" });
    }

    const user = await User.create({
      fname,
      lname,
      email,
      password,
     
    });

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role,fname:user.fname  },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    res.locals.userData = { email, password , user, token};
    next();
  } catch (error) {
    console.error(error);
  }
};


/*..............................create user profile.............................. */
//update user profile
exports.updateuser=async (req, res) => {
    const { id } = req.data;
    try {
      console.log(id);  
      const body = req.body;
      console.log(body);  

      // Update the data
      const result = await User.updateOne({ _id: id }, { $set: body });
      console.log(result);
      if (result.nModified === 0) {
        return res.status(404).send({ error: "User not found or no changes applied" });
      }
      return res.status(200).send({ msg: "Record Updated" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  };



/*......................................project details.......................*/

exports.getCartByUserId = async (req, res) => {
  try {
    const { id } = req.data; // Extract userId from request parameters
    console.log("Request data:", req.data); 
    if (!id) {
      return res.status(400).json({ message: "Missing userId." });
    }

    // Fetch cart items for the given userId
    const cartItems = await Cart.find({ userId: id }).populate("productId");
    console.log(cartItems);
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found for this user." });
    }

    return res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};




exports.addToCart=async(req, res) =>{
  try {
    const { id } = req.data;
    const {
      productId,
      unitPrice,
      clothSize,
      count,
    } = req.body;
    console.log(req.body);
    console.log(id);
    const userId = id; 
    if (!userId || !productId || !clothSize || !count) {
      return res.status(400).json({ message: "Missing required fields." });
    }
   

    const existingItem = await Cart.findOne({
      userId,
      productId,
      clothSize,
    });

    if (existingItem) {
      const newCount = existingItem.count + count;

      // Update the existing item using `create` with `upsert`
      const updatedItem = await Cart.findOneAndUpdate(
        { userId, productId, clothSize },
        { count: newCount },
        { new: true } // Return the updated document
      ).populate("productId");

      return res.status(200).json({ message: "Cart updated.", cartItem: updatedItem });
    } else {
      // Create a new cart item
      const newCartItem = await Cart.create({
        userId,
        productId,
        unitPrice,
        clothSize,
        count,
      });
      const populatedCartItem = await newCartItem.populate("productId");
      return res.status(201).json({ message: "Item added to cart.", cartItem: populatedCartItem });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// PUT API: Update Cart

exports.updateFromCart=async(req, res) =>{
  try {
    const { id } = req.data; // Extract userId from request parameters
    const cartId = req.params.id;
    const { count } = req.body; // Extract count from request body
    console.log("User ID:", id);
    console.log("Request data:", req.body);
    console.log("Cart ID:", id, "Count:", count);
    if (!id || count === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (count <= 0) {
      await Cart.findByIdAndDelete(cartId);
      return res.status(200).json({ message: "Cart item removed." });
    }

    const updatedCartItem = await Cart.findByIdAndUpdate(
      cartId,
      { count },
      { new: true } // Return the updated document
    ).populate("productId");
    return res.status(200).json({ message: "Cart item updated.", updatedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};



exports.deleteFromCart=async(req, res) =>{  
  const { id } = req.data; // Extract userId from request parameters
  const  cartId  = req.params.id;

  try {
    // Find and delete the cart item by ID
    const deletedItem = await Cart.findByIdAndDelete(cartId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.status(200).json({ message: "Cart item removed successfully.", cartId });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createProduct=async(req, res) =>{

  const allowedCategories = [
    "Blouse",
    "Baggy T-Shirt",
    "T-Shirt",
    "Lady's Denim",
    "Frock",
    "Baby Frock",
    "Baby Full Dress",
    "Sale",
    "Children's Dress",
  ];

  try {
    const { name, imageUrl, categories, description, isAvailable, sizes } = req.body;
    console.log(req.body.sizes);
    // Validate categories 
    const invalidCategories = categories.filter(
      (category) => !allowedCategories.includes(category)
    );

    if (invalidCategories.length > 0) {
      return res.status(400).json({
        message: "Invalid categories provided",
        invalidCategories,
      });
    }
    // Create a new product instance
    const newProduct = await Product.create({
      name,
      imageUrl,
      categories,
      description,
      sizes,
      isAvailable,
    });

    
    // Send a success response
    res.status(201).json({
      message: "Product created successfully!",
      product: newProduct,
    });

  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }

};


exports.deleteProduct = async (req, res) => {
   try {
    const { id } = req.params;
    console.log(id);

    //Find and delete the product by ID
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
       return res.status(404).json({
           message: "Product not found",
        });
     }
    // Send a success response
    res.status(200).json({
       message: "Product deleted successfully!",
       product: deletedProduct,
     });
   } catch (error) {
     // Handle errors
     res.status(500).json({
       message: "Failed to delete product",
       error: error.message,
     });
   }
};



// Create Order API
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      fName,
      lname,
      email,
      phoneNum,
      address,
      paymentStatus,
      orderStatus,
      date,
      totalPrice,
      postalcode,
      cartItems,
    } = req.body;

    // Validate required fields
    if (!userId || !fName || !lname || !email || !phoneNum || !address || !totalPrice || !postalcode || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new order using Mongoose's create method
    const newOrder = await Order.create({
      userId,
      fName,
      lname,
      email,
      phoneNum,
      address,
      paymentStatus,
      orderStatus,
      date,
      totalPrice,
      postalcode,
      cartItems,
    });

    res.status(201).json({ message: "Order created successfully.", newOrder});
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.updateProductCount = async (req, res) => {
  try {
    const { id } = req.data;

    console.log(req.data);
    const  cartItems  = req.body;
    console.log(cartItems);
   
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Invalid cart items." });
    }

    // Iterate over each cart item
    for (const item of cartItems) {
      const { productId, clothSize, count } = item;
      console.log(productId, clothSize, count);
      if (!productId || !clothSize || !count) {
        return res.status(400).json({ message: "Missing required fields in cart item." });
      }
     // Update product count in the database
      const product = await Product.findById(productId._id);
      console.log(product);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${productId._id} not found.` });
      }
      

     // Match the `clothSize` with the `size` field in the `sizes` array
      const sizeIndex = product.sizes.findIndex((size) => size.size === clothSize);
      console.log(sizeIndex);
      if (sizeIndex === -1) {
        return res.status(400).json({ message: `Size ${clothSize} not found for product ${productId.name}.` });
      }
      // Decrement the `count` field for the matched size
       if (isNaN(product.sizes[sizeIndex].count) || isNaN(count)) {
          return res.status(400).json({ message: `Invalid count value for product ${productId.name}, size ${clothSize}.` });
        }
          // Decrement the `count` field for the matched size
      if (product.sizes[sizeIndex].count < count) {
        return res.status(400).json({ message: `Insufficient stock for product ${productId.name}, size ${clothSize}.` });
      }

      product.sizes[sizeIndex].count -= count;
      
      // Save the updated product
      await product.save();
    }

    res.status(200).json({ message: "Product counts updated successfully." });
  } catch (error) {
    console.error("Error updating product count:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updatePaymentStatus = async (req, res , next ) => {
  try {
    const id  = req.data.id; // Extract userId from request parameters
    const  orderId  = req.params.id; // Extract orderId from URL parameters
    const { paymentStatus } = req.body; // Extract paymentStatus from request body
    console.log(orderId, paymentStatus, id);
    // Validate required fields
    if (!orderId || paymentStatus === undefined) {
      return res.status(400).json({ message: "Order ID and payment status are required." });
    }

    // Find the order by ID and update the payment status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true } // Return the updated document
    ).populate("cartItems.productId");
    console.log(updatedOrder);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message:"Payment status updated successfully.", updatedOrder });
      
     const email = updatedOrder.email;
     const cartItems = updatedOrder.cartItems;
     const totalPrice = updatedOrder.totalPrice;
     
     res.locals.userData = { email, cartItems,totalPrice };
     next();

  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


// Fetch orders by userId
exports.fetchOrdersByUserId = async (req, res) => {
  try {
    const { id } = req.data;
    const userId = id; 

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find orders by userId
    const orders = await Order.find({ userId }).populate('cartItems.productId');
    console.log("Fetched orders:", orders);
    // Check if orders exist
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    // Return orders
    res.status(200).json({ message: "Orders fetched successfully.", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId').populate('cartItems.productId');
    console.log("Fetched orders:", orders);
    
    // Check if orders exist
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    // Return orders
    res.status(200).json({ message: "Orders fetched successfully.", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// Get feedback by orderId
exports.getFeedbackByOrderId = async (req, res) => {
  try {
    const { cal } = req.data;
    const  orderId  = req.params.id;
    console.log("Order ID:", orderId);

    // Validate orderId
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    // Find feedback by orderId
    const feedback = await Order.findOne({  _id: orderId  });

    

    // Return feedback
    res.status(200).json({ message: "Feedback fetched successfully.", feedback});
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.getRatingsByProductId = async (req, res) => {
  try {
    const id  = req.data.id; // Extract userId from request parameters
    const productId = req.query.productId; // Extract productId from request parameters
    console.log("Product ID:", productId,id);
    // Validate productId
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Query orders where cartItems contain the given productId
    const orders = await Order.find({ "cartItems.productId": productId }).populate("userId"); 
    console.log("Orders with ratings:", orders);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No ratings found for this product." });
    }

    // Extract ratings and feedback for the specific productId
    const ratings = [];
    orders.forEach(order => {
      order.cartItems.forEach(item => {
        if (item.productId.toString() === productId) {
          ratings.push({
            orderId: order._id,
            rating: order.rating,
            feedback: order.feedback,
            updatedAt: order.updatedAt,
            orderStatus: order.orderStatus,
            userId: order.userId,
            productId: item.productId,
            fname: order.userId.fName,
        
          });
        }
      });
    });

    // Return the ratings and feedback
    res.status(200).json({ message: "Ratings fetched successfully.", ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.updateStatus = async (req, res) => {
  try {
    const id  = req.data.id; // Extract userId from request parameters
    const { orderId, updatedStatus } = req.body;

    if (!orderId || !updatedStatus ) {
      return res.status(400).json({ error: "All fields are required" });
    }
   
    const updatedOrder = await Order.findOneAndUpdate(
      {_id:orderId }, // Search by orderId
      { orderStatus:updatedStatus }, // Update feedback and rating
      { new: true } // Return the updated document
    );

    console.log("Updated Order:", updatedOrder);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Payment status updated successfully.", updatedOrder });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.updateFeedback = async (req, res) => {
  try {
    const id  = req.data.id; // Extract userId from request parameters
    const { orderId, feedback, rating } = req.body;
    console.log("Request body:", req.body);
    if (!orderId || !feedback || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }
   
    const updatedOrder = await Order.findOneAndUpdate(
      {_id:orderId }, // Search by orderId
      { feedback, rating }, // Update feedback and rating
      { new: true } // Return the updated document
    );
    console.log("Updated Order:", updatedOrder);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Payment status updated successfully.", updatedOrder });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



exports.getClinetsectert = async (req, res) => {
  try {
    const { amount, currency, paymentMethodTypes } = req.body;
    console.log("Request body:", req.body);
    // Validate required fields
    if (!amount || !currency || !paymentMethodTypes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: paymentMethodTypes,
    });
    console.log("Payment Intent:", paymentIntent);
    // Respond with the client secret
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }

}




exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(id);
    console.log(updates);


    //Find and update the product by ID
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    console.log(updatedProduct);
    // Send a success response
    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    // Handle errors
     res.status(500).json({
       message: "Failed to update product",
       error: error.message,

    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products from the database
       // Extract query parameters
       const { minPrice, maxPrice, categories } = req.query;

       // Build the query object
       const query = {};
   
       // Add price range filter if provided
       if (minPrice && maxPrice) {
        query["sizes.price"] = { $gte: Number(minPrice), $lte: Number(maxPrice) }; // Query nested sizes.price
      }
   
       // Add categories filter if provided
       if (categories) {
         const categoryArray = categories.split(","); // Split categories into an array
         query.categories = { $in: categoryArray }; // Match any of the categories
       }
   
    console.log("Query:", query);
    const products = await Product.find(query);
    console.log("Products:", products);
    // Send a success response with the list of products
    res.status(200).json({
      message: "Products retrieved successfully!",
      products,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the product ID from the URL
    console.log("Product ID:", id);
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id); // Fetch the product by ID
    console.log("Product:", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product retrieved successfully!",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
};   


exports.PredictionMonthRevenue = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    // Load past 3 years of revenue data
    const revenueData = JSON.parse(fs.readFileSync("./revenue.json", "utf-8"));
    console.log("Revenue Data:", revenueData);

    // Prompt for Groq
    const prompt = `
      I have past 10 years of monthly revenue data: ${JSON.stringify(revenueData)}
      Please predict the revenue for the month of "${month}" for the next year.
      Respond ONLY in JSON format like: {"month":"${month}","predictedRevenue":1234}
    `;

    // Call Groq API
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.thathsarani}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const groqData = await groqRes.json();
    console.log("Groq Response:", groqData);

    let prediction = groqData?.choices?.[0]?.message?.content || "{}";
    prediction = prediction.replace(/```json|```/g, "").trim();
    
    try {
      prediction = JSON.parse(prediction);
    } catch (parseError) {
      console.error("Failed to parse prediction JSON:", parseError);
      prediction = { error: "Invalid prediction format" };
    }

    res.json(prediction);
    console.log("Prediction Response:", prediction);
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Failed to get prediction" });
  }
};

exports.AllMonthRevenue = async (req, res) => {

  const filePath = path.join(__dirname, "../revenue.json");

  // Read the revenue.json file
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading revenue.json:", err);
      return res.status(500).json({ error: "Failed to load revenue data" });
    }

    try {
      const revenueData = JSON.parse(data); // Parse the JSON data
      res.json(revenueData); // Send the data to the frontend
    } catch (parseError) {
      console.error("Error parsing revenue.json:", parseError);
      res.status(500).json({ error: "Invalid JSON format in revenue.json" });
    }
  });
};





