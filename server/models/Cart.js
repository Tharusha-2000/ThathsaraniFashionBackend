const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    
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
    clothSize: {
        type: String,
        required: true,
    },
          

});


const  Cart = mongoose.model('carts', CartSchema);

module.exports =  Cart;