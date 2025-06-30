const mongoose = require('mongoose');

let sizeIdCounter = 1;
const ProductSchema = new mongoose.Schema({
   
    name:{
        type: String,
        required: true,
      },
    imageUrl: {
        type: String,
        required: false,
      },
    categories: {
        type: [String],
        required: false,
      },
    isAvailable: {
        type: Boolean,
        default: false, 
    },
    description: {
        type: String,
        required: false,
      },
    sizes: [
        {
            _id: {
                type: Number, // Define _id as a number
                default: () => sizeIdCounter++, // Increment the counter for each size
              },
            size: {
            type: String,
            required: false,    
            },
            price: {
            type: Number,
            required: false,
             },
        },
      ],
   
}); 

const Product = mongoose.model('products', ProductSchema);

module.exports = Product;
