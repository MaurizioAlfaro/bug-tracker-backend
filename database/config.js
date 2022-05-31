// Import mongoose to work with mongodb
const mongoose = require("mongoose")

// Setup connection with the database
const dbConnection = async() => {
    // Try to establish a connection
    try {
        // Send connection request
        if(process.env.NODE_ENV === 'development') {
            console.log('Running on development')
            await mongoose.connect(process.env.DB_CNN + 'test')
        } else {
            console.log('Running on production')
            await mongoose.connect(process.env.DB_CNN + 'production')
        }
        // Logs "DB Online" if connection was successful
        console.log("DB Online")
    } catch (error) {
        // Throw error if connection establishment failed
        throw new Error("Error while connecting to database")
    }
}

// Export dbConnection to be used anywhere
module.exports = {
    dbConnection
}