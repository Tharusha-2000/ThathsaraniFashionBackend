const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    // title: {
    //     type: String,
    //     required: true,
    //     minlength: 1,
    //     trim: true
    // },
    
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    productId: {
         type: mongoose.Types.ObjectId,
         ref: 'products',
         required: true
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        required: true,
       
    },
    pizzaSize: {
        type: String,
        required: true,
    },
        
    
    // isComplete: {
    //     type: Boolean,
    //     default: false
    // },
    // mentorEmail:{
    //     type: String,
    // },
    // isVerified:{
    //     type: Boolean,
    //     default: false
    // }



});


const  Cart = mongoose.model('carts', CartSchema);

module.exports =  Cart;