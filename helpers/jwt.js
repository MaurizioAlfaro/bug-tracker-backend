// Import jwt (used for keeping user's session alive)
const jwt = require('jsonwebtoken')

// Generate JWT with uid and name
const generateJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        // Define payload to generate token
        const payload = {uid, name}

        // Ask for a JWT that expires in 2 hours
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h'
        }, (err, token) => {
            // Reject promise if there's an error
            if(err) {
                reject('Could not generate JWT')
            }

            // Return token if promise was fulfilled correctly
            resolve(token)
        })
    })
}

// Export generateJWT so it can be used anywhere
module.exports = {
    generateJWT
}