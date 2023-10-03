// Import the Mongoose library
const mongoose = require('mongoose')

// Define a function for validating MongoDB ObjectIds
const validateMongoDbId = ((id) => {
    // Check if the provided id is a valid MongoDB ObjectId
    const isValid = mongoose.Types.ObjectId.isValid(id)
    
    // If the id is not valid, throw an error
    if (!isValid) {
        throw new Error('This id is not valid or not found in the database');
    }
})

// Export the validateMongoDbId function for use in other modules
module.exports = validateMongoDbId;
