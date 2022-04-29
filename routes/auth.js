// Handles eveything that happens on the authentication routes

// Import Router from expres
const { Router } = require('express')

// Initialize router
const router = Router();

/* Import check from express-validator, which is an express middleware 
library for server-side data validation */
const { check } = require('express-validator')

// import validateFields, which is a custom middleware to handle checks and errors
const { validateFields } = require('../middlewares/validateFields')

// Import functions for authentication handling
const { registerUser, loginUser, renewToken } = require('../controllers/auth');
const { validateJWT } = require('../middlewares/validateJWT');

// *** Handle user registration
router.post('/register', [
    // Check if name field is not empty
    check('name', 'Name is required').not().isEmpty(),
    // Check if email is a valid email address
    check('email', 'Email is required').isEmail(),
    // Check that password is at least 8 characters long
    check('password', 'Password should be at least 8 characters long').isLength({min: 8}),
    // Declare custom middleware for error handling
    validateFields
], registerUser)


// *** Handle user login
router.post('/login', [
    // Check if email is of type email
    check('email', 'Email is required').isEmail(),
    // Check if password is not empty
    check('password', 'Password is required').not().isEmpty(),
    // Declare custom middleware for error handling
    validateFields
], loginUser)

router.get('/renew', validateJWT, renewToken)

// Export router so it can be accessed by index.js
module.exports = router