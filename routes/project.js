// Imports Router from express so we can access different routes
const { Router } = require('express')

// Initializes Router into router
const router = Router()

// Import check from express-validator to use conditional checking
const { check } = require('express-validator')

// Import functions used to CRUD projects
const { 
        createProject,
        readProjects, 
        updateProject, 
        deleteProject,
        joinProject,
        compareProject
     } = require('../controllers/project')

// Import custom middlewares to handle errors and validations
const { validateFields } = require('../middlewares/validateFields')
const { validateJWT } = require('../middlewares/validateJWT')

// Checks to see if JWT is valid.
// If it is, it appends the uid to the request.
// Returns an error if it isn't
router.use(validateJWT)

// *** Handle project creation
// (Creates a new project with the information in the request body)
router.post('/create', [
    check('name', 'Project name is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('project_id', 'Project ID is required').not().isEmpty(),
    check('departments', 'Departmens is required').not().isEmpty(),
    check('ticket_types', 'Ticket types is required').not().isEmpty(),
    check('statuses', 'Statuses is required').not().isEmpty(),
    check('urgencies', 'Urgencies types is required').not().isEmpty(),
    check('departments', 'Departments should be an array').isArray(),
    check('ticket_types', 'ticket_types should be an array').isArray(),
    check('statuses', 'Statuses should be an array').isArray(),
    check('urgencies', 'Urgencies should be an array').isArray(),
    validateFields
], createProject)

// *** Handle project reading
// (Reads and retrieves all projects that have a matching uid, 
// either on the leader field or in the colleagues (Array) field)
router.get('/', readProjects)

// *** Handle project updating
// (Updates the project matching the id in the url parameters)
// The request contains an updated project from the front-end
router.put('/:id', updateProject)

// *** Handle project deletion
// (Finds and deletes a project that matches the id in the url parameters)
router.delete('/:id', deleteProject)

// *** Handle project version control
router.get('/control/:project_id/:version_control', compareProject)

// *** Handle project joining
// Joins a project given a project_id not an internal db id
router.post('/join/:id', [
    check('password', 'Password is required').not().isEmpty(),
    validateFields
], joinProject)

// Exports router so we can access all these routes from index.js
module.exports = router