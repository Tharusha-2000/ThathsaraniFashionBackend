const express = require("express");
const router = express.Router();
const controller = require('../authcontrol/controller')
const mailer = require('../authcontrol/mailer')
const middleware = require('../middleware/auth.js');


/*..........................................login.................................................... */
router.post("/register",controller.register,mailer.sendWelcomeEmail);
router.post("/login",controller.login);
router.post("/generateOTP&sendmail",middleware.localVariables,controller.generateOTP,mailer.sendingOTPMail);
router.get("/verifyOTP",controller.verifyOTP);
router.put("/resetPassword",controller.resetPassword); 

/*..........................................registration.................................................... */

router.get('/user',middleware.Auth,middleware.IsUser,controller.getUserById);
router.delete('/user/:id',middleware.Auth,middleware.IsAdmin,controller.deleteUser);
router.get('/users',middleware.Auth,middleware.IsAdmin,controller.getUsers);
router.put("/updateuser",middleware.Auth,middleware.IsUser,controller.updateuser);

router.post('/product',middleware.Auth,middleware.IsAdmin,controller.createProduct);
router.get('/products', controller.getAllProducts);
router.get('/product/:id',controller.getProductById);
router.delete('/product/:id',middleware.Auth,middleware.IsAdmin, controller.deleteProduct);
router.put('/product/:id',middleware.Auth,middleware.IsAdmin, controller.updateProduct);

router.post('/order',middleware.Auth,middleware.IsUser,controller.createOrder);
router.put('/byOrderId/:id',middleware.Auth,middleware.IsUser,controller.updatePaymentStatus,mailer.sendEmail);
router.get('/getOrderById',middleware.Auth,middleware.IsUser,controller.fetchOrdersByUserId);
router.get('/getFeedbackByOrderId/:id',middleware.Auth,middleware.IsUser,controller.getFeedbackByOrderId);
router.put('/createFeedbackByOrderId',middleware.Auth,middleware.IsUser,controller.updateFeedback);
router.put('/updateStatusByOrderId',middleware.Auth,middleware.IsAdmin,controller.updateStatus);
router.get('/order',middleware.Auth,middleware.IsAdmin,controller.getOrders);

router.get('/rating',middleware.Auth,middleware.IsUser,controller.getRatingsByProductId);
router.post('/Payment/create-payment-intent',controller.getClinetsectert);

router.get('/cart',middleware.Auth,middleware.IsUser,controller.getCartByUserId);
router.post('/cart',middleware.Auth,middleware.IsUser,controller.addToCart);
router.put('/cart/:id',middleware.Auth,middleware.IsUser,controller.updateFromCart);
router.delete('/cart/:id',middleware.Auth,middleware.IsUser,controller.deleteFromCart);


module.exports = router;




