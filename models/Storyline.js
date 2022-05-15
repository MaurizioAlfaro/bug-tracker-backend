const { model, Schema } = require('mongoose')

const StorylineSchema = Schema({
    ticket: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    updates: [{
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
        type: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: true
        },
        update_id: {
            type: Number,
            required: false
        }
    }]
})

module.exports = model('Storyline', StorylineSchema)