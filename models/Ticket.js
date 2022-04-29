const { Schema, model } = require('mongoose')

// Define ticket structure with a reference to User
const TicketSchema = Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    tid: {
        type: Number,
        required: true
    },
    urgency: {
        type: String,
        required: true
    },
    comments: [{
        user: {
            uid: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
        },
        date: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    storyline: {
        type: Schema.Types.Object,
        ref: 'Project',
        required: true
    }
})

// Override one method of TicketSchema to return a new object with id instead of _id
TicketSchema.method('toJSON', function() {
    // Gets the version, id and the rest of the object into new variables
    const {__v, _id, ...object} = this.toObject()

    // Assigns id to the _id variable so we have better format
    // ("id" instead of "_id")
    object.id = _id

    // Returns the newly created object (Which doesn't include __v which is the version)
    return object
})

module.exports = model('Ticket', TicketSchema)