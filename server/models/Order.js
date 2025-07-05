const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    fName: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNum: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: Boolean,
        default: false
    },
    orderStatus: {
        type: String,
        default: "new"
    },
    date: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    postalcode: {
        type: String,
        required: true
    },
    cartIds: [{
        type: mongoose.Types.ObjectId,
        ref: 'carts',
        required: true
    }]
          

});


const  Order = mongoose.model('orders', OrderSchema);

module.exports =  Order;