const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var addressSchema = new mongoose.Schema({
    name:String,
    email:String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    mobileNumber:String,
    AlternateMobileNumber:String,
    country: String,
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Address', addressSchema);