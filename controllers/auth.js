const bcrypt = require("bcryptjs/dist/bcrypt")
const { response } = require("express")
const { generateJWT } = require("../helpers/jwt")

const User = require("../models/User")

// Handle user registration with mongodb via mongoose
const registerUser = async(req, res = response) => {
    // Get email and password from the request's body
    const { email, password } = req.body

    // Try to register user
    try {
        // Search for user with the same email
        let user = await User.findOne({ email })

        // Check if email is already in use
        if(user) {
            return res.status(400).json({
                ok: false,
                msg: 'Email address already in use'
            })
        }

        // Define new user with the contents of the request
        user = new User(req.body)

        // Generate salt to add to password before encryption
        const salt = bcrypt.genSaltSync()

        // Set user's password to the hash result from hashing their password plus the salt
        user.password = bcrypt.hashSync(password, salt)

        // Save new user (register)
        await user.save()

        // Generate JWT
        const token = await generateJWT(user.id, user.name)

        // Return positive response with useful data
        return res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })


    } catch (error) {
        // Return error 500 in case of error
        return res.status(500).json({
            ok: false,
            msg: "Error while registering user"
        })
    }
}

// Handle user login
const loginUser = async(req, res = response) => {
    // Get email and password from request's body
    const { email, password } = req.body

    // Try to log user in
    try {
        // Check if an user exists with that email
        const user = await User.findOne({email})

        // Return error message in case there was not user under that email
        if(!user) {
            return res.status(400).json({
                ok: false,
                msg: "No user found under that email address"
            })
        }

        // Compare password hashes (to see if password is correct)
        const validPassword = bcrypt.compareSync(password, user.password)

        // Return error message if passwords do not match
        if(!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "Incorrect password"
            })
        }

        // Generate JWT
        const token = await generateJWT(user.id, user.name)

        // Return positive response with useful data
        return res.status(200).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })

    } catch (error) {
        // Return error 500 in case of error
        return res.status(500).json({
            ok: false,
            msg: "Error while logging user in"
        })
    }
}

const renewToken = async(req, res = response) => {
    const { uid, name } = req

    const token = await generateJWT(uid, name)

    return res.status(200).json({
        ok: true,
        uid,
        name,
        token
    })
}

module.exports = {
    registerUser,
    loginUser,
    renewToken
}