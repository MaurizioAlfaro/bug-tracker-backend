const Project = require('../models/Project');
const Storyline = require('../models/Storyline');
const Ticket = require('../models/Ticket');

const addTID = async(ticket) => {
    // Find project that holds this ticket
    const project = await Project.findById(ticket.project)
    
    // Sets ticket id to the next number
    ticket.tid = project.ticket_count + 1
    
    // Finds and updates internal ticket count to +1
    await Project.findOneAndUpdate({
        _id: ticket.project
    }, {
        ticket_count: ticket.tid
    })
}

// Creates a storyline and adds a reference to the ticket 
const addStoryline = async(ticket, req, update_id) => {

    // Get all necessary variables from ticket
    const { id, project, date, title, 
            body, status, urgency } = ticket

    // Create start of storyline
    const storyline = new Storyline({
        ticket: id,
        project: project,
        updates: [{
            update_id,
            user: {
                uid: req.uid,
                name: req.name
            },
            date: date,
            type: 'CREATION',
            caption: `created a New Ticket with\n
                title: ${title}\n 
                body: ${body}\n
                status: ${status}\n
                urgency: ${urgency}`
        }]
    })

    // Set the reference in the ticket
    ticket.storyline = storyline

    // Save storyline in the database
    await storyline.save()
}

const addUpdateToStoryline = async(ticket, req, update_id) => {
    const {_id} = ticket
    const storyline = await Storyline.findById(ticket.storyline._id)

    storyline.updates = [
        {
            update_id,
            user: {
                name: req.name,
                uid: req.uid
            },
            date: new Date(),
            type: req.body.update.type,
            caption: req.body.update.caption
        },
        ...storyline.updates
    ]

    await storyline.save()
    return await Ticket.findOneAndUpdate({_id}, {storyline}, {
        new:true
    })
}

module.exports = {
    addTID,
    addStoryline,
    addUpdateToStoryline
}