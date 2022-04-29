const { response } = require('express')
const jwt = require('jsonwebtoken')

// Check if JSON Web Token is still valid
const validateJWT = ( req, res = response, next ) => {
    // Get token from the request header
    const token = req.header('x-token')

    // If no token was found in the request, return an error response
    if(!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No token in request'
        })
    }

    // Try to verify JWT
    try {
        // Get the uid and name that comes inside the token if
        // verification is successfull
        const { uid, name } = jwt.verify(token, process.env.SECRET_JWT_SEED)

        // Append uid and name to the request
        req.uid = uid
        req.name = name

    } catch (error) {
        // Return an error response if something goes wrong
        return res.status(401).json({
            ok: false,
            msg: 'Invalid token'
        })
    }

    // Goes to the next check, which doesn't exist.
    // However, this line is necessary
    next()
}

module.exports = {
    validateJWT
}