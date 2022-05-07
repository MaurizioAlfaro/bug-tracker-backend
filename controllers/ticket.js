const { response } = require("express");
const Ticket = require('../models/Ticket')
const Project = require('../models/Project');
const { addTID, addStoryline, addUpdateToStoryline } = require("../helpers/ticket");
const Storyline = require("../models/Storyline");
const { updateVersionControl } = require("../helpers/project");

// *** Creates a new ticket and saves it to the db
const createTicket = async(req, res = response) => {
    // Creates new ticket with the information inside the body request
    const ticket = new Ticket(req.body)

    // Tries to save the ticket
    try {
        // Sets the user reference to the active uid in request
        // that was obtained with the JWT
        ticket.user = req.uid
        
        // Add storyline object to ticket
        await addStoryline(ticket, req)
        
        // Add ticket id to ticket
        await addTID(ticket)

        // Waits for the new ticket to be saved in the db
        const savedTicket = await ticket.save()

        // Updates version control so other users
        // can know that there has been an update
        const update_id = await updateVersionControl(
            savedTicket.project, 
            savedTicket._id,
            "CREATE TICKET",
            savedTicket.user
        )

        // Returns successful response with saved ticket embedded
        return res.status(200).json({
            ok: true,
            msg: savedTicket,
            update_id
        })
    } catch(err) {
        // Return error response if something went wrong
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: 'Error while creating ticket'
        })
    }
}

// Finds a ticket by id and deletes it
const deleteTicket = async(req, res = response) => {
    // Gets the ticket id from the parameters in the url
    const id = req.params.id

    // Gets the uid from the uid in the request
    // (Which was obtained via the JWT)
    const uid = req.uid

    try {
        // Searches for a ticket with a certain id
        const ticket = await Ticket.findById(id)

        // If ticket is null, it means that it didn't find a ticket
        // matching with that id
        if(!ticket) {
            // This should really say 'No ticket found'
            // but we stay ambiguous for security reasons
            return res.status(404).json({
                ok: false,
                msg: 'Error while deleting ticket'
            })
        }

        // If the uid is not the same as the user that created the ticket
        // then return an error response
        if(ticket.user.toString() !== uid) {
            // This should really say 'Not authorized to delete this ticket'
            // but we stay ambiguous for security reasons
            return res.status(401).json({
                ok: false,
                msg: 'Error while deleting ticket'
            })
        }
        
        // Finds and delete the ticket corresponding with that id
        const deletedTicket = await Ticket.findByIdAndDelete(id)

        // Updates version control so other users
        // can know that there has been an update
        const update_id = await updateVersionControl(
            deletedTicket.project, 
            deletedTicket._id,
            "DELETE TICKET",
            uid
        )

        // Returns a positive response and the deleted ticket
        return res.status(200).json({
            ok: true,
            deletedTicket,
            update_id
        })

    } catch (error) {
        // Return error response if something else fails
        return res.status(500).json({
            ok: false,
            msg: 'Error while deleting ticket'
        })
    }
}

// Retrieves all tickets from a specific project
const readTickets = async(req, res = response) => {
    // Sets uid as the uid in the request, which was obtained
    // with the JWT
    const uid = req.uid

    // Get the project id from the Url
    const project_id = req.params.project_id

    // Tries to retrieve all tickets with a reference to that uid
    try {
        // Finds all tickets that match their the project
        const tickets = await Ticket.find({project:project_id}).exec()

        // Returns a positive response and an array of tickets found
        return res.status(200).json({
            ok: true,
            msg: tickets
        })

    } catch (error) {
        // Return an error if something went wrong
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Error while retrieving tickets"
        })   
    }
}

// Finds a ticket by id and updates it
const updateTicket = async(req, res = response) => {
    // Gets the uid from the uid in request, which was obtained
    // with the JWT
    const uid = req.uid

    if(req.body.update.type === 'COMMENT') {
        req.body.comments[0].user = {
            uid,
            name: req.name
        }
    }

    // Gets the id of the ticket from the parameters in the url
    const id = req.params.id

    // Assigns the filter that is going to be used to search for the ticket
    // In this case we will search for _id matching id
    const filter = {
        _id: id
    }

    // Defines what is going to be update
    const update = req.body

    // Tries to find the ticket and updated it
    try {
        // *** Checks if a ticket with that id exists
        // In  this case we use id and not _id because the method is 
        // already parsing it for us
        const ticket = await Ticket.findById(id)

        // If no ticket was found, then return an error response
        if(!ticket) {
            return res.status(404).json({
                ok: false,
                msg: "No ticket found with that id"
            })
        }


        // If ticket's project does not contain uid as the leader or a colleague
        // then return an error response
        const project = await Project.findById(ticket.project)

        // Leader and colleagues are stored as uid references only and not as
        // objects with the name
        const participants = [
            project.leader.toString(),
            ...project.colleagues.map(uid => uid.toString())
        ]

        if(!participants.includes(uid)) {
            return res.status(401).json({
                ok: false,
                msg: "User is not a team member"
            })
        }

        // Finds and update ticket
        await Ticket.findOneAndUpdate(filter, update)

        const updatedTicket = await addUpdateToStoryline(ticket, req)


        // Updates version control so other users
        // can know that there has been an update
        const update_id = await updateVersionControl(
            updatedTicket.project, 
            updatedTicket._id,
            "UPDATE TICKET",
            uid
        )


        // Returns positive response with the updated ticket in it
        return res.status(200).json({
            ok: true,
            updatedTicket,
            update_id
        })
        
    } catch (error) {
        // If something goes wrong, return an error response
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Error while updating ticket",
            error
        })
    }
}

module.exports = {
    createTicket,
    deleteTicket,
    readTickets,
    updateTicket
}