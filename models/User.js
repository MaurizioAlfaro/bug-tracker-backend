// Import Schema and model
// A Schema maps to a mongodb collection and defines the shape of the documents within that collection
// A model is a fancy consctructor compiled from Schema definitions. An instance of a model is called document
const { Schema, model } = require('mongoose')

// Define User structure (Schema)
const UserSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
})

// Export model 'User' that contains the schema defined here
module.exports = model('User', UserSchema)