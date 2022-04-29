// Import response handler from express
const { response } = require("express")

// Import validationResult (Extracts the validation errors from a request and makes them available in a Result object)
const { validationResult } = require("express-validator")

/* Custom middleware to handle errors. 
req is a check (validation) that comes from the checks on the route
res is initialize as response to have intellisense.
next is a function to go to the next check */
const validateFields = (req, res = response, next) => {
    // Validate request and save result into errors
    const errors = validationResult(req)

    // Return 400 response if there are errors (meaning validationResult returned an error)
    if(!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            // Set msg as the error message
            msg: errors.mapped()
        })
    }

    // Go to the next check (req)
    next()
}

// Export validateFields function
module.exports = {
    validateFields
}