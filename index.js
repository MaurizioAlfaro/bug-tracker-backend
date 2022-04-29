// Import express for handling incoming requests 
const express = require('express')

// Import CROS (Cross-Origin Resource Sharing)
const cors = require('cors')

// Import dotenv for environment variables
require('dotenv').config()

// Import dbConnection with mongodb through mongoose
const { dbConnection } = require('./database/config')

// Create express server
const app = express()

// Establish connection with db
dbConnection()

// Allow app to use cors
app.use(cors())

// Add middleware to serve static files 
app.use(express.static('public'))

// Add middlware to parse incoming JSON requests
app.use(express.json())

// Define route for authentication 
app.use('/api/auth', require('./routes/auth'))

// Define route for ticket management
app.use('/api/ticket', require('./routes/ticket'))

// Define route for project management
app.use('/api/project', require('./routes/project'))

// Define PORT that is going to be listening for requests
app.listen( process.env.PORT, () => {
    // Console log PORT in use
    console.log(`Server running on port ${process.env.PORT}`)
})
