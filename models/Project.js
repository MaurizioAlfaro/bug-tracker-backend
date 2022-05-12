const { Schema, model } = require('mongoose')

// Define project structure with a reference to User
const ProjectSchema = Schema({
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    departments: {
        type: Array,
        required: true,
    },
    ticket_types: {
        type: Array,
        required: true
    },
    statuses: {
        type: Array,
        required: true,
    },
    urgencies: {
        type: Array,
        required: true
    },
    colleagues: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    date: {
        type: String,
        required: true,
    },
    project_id: {
        type: String,
        required: true
    },
    ticket_count: {
        type: Number,
        required: true
    },
    version_control: [{
        update_id: {
            type: Number,
            required: true
        },
        update_type: {
            type: String,
            required: true
        },
        update_user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        ticket_id: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
        },
        read_by: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    
})

// Override one method of ProjectSchema to return a new object with id instead of _id
ProjectSchema.method('toJSON', function() {
    // Gets the version, id and the rest of the object into new variables
    const {__v, _id, ...object} = this.toObject()

    // Assigns id to the _id variable so we have better format
    // ("id" instead of "_id")
    object.id = _id

    // Returns the newly created object (Which doesn't include __v which is the version)
    return object
})

// Models the newly created schema under the name of 'Project' and exports it
module.exports = model('Project', ProjectSchema)