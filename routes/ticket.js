// Handles eveything that happens on the ticket routes

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
const { createTicket, updateTicket, deleteTicket, readTickets } = require('../controllers/ticket');
const { validateJWT } = require('../middlewares/validateJWT');

// Validates token and appends uid and name to the request
router.use(validateJWT)

// *** Handle ticket creation
// (Creates a new ticket with the information in the request body)
router.post('/create', [
    check('title', 'Title is required').not().isEmpty(),
    check('body', 'Body is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('project', 'Project is required').not().isEmpty(),
    check('urgency', 'Urgency is required').not().isEmpty(),
    validateFields
], createTicket)

// *** Handle ticket reading 
// (Reads and retrieves all tickets from specific user)
router.get('/:project_id', readTickets)

// *** Handle ticket updating
// (Updates a ticket by id with the information in the request body)
router.put('/:id', updateTicket)

// *** Handle ticket deletion
// (Deletes a ticket by id)
router.delete('/:id', deleteTicket)

// Export router so it can be accessed by index.js
module.exports = router