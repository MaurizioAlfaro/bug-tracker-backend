const { response } = require("express");
const { formatProject } = require("../helpers/user");
const Project = require("../models/Project");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// Creates a new project with the leader set to the user
const createProject = async(req, res = response) => {
    // Create a new project with the information inside the request's body
    const project = new Project(req.body)   

    // Get uid from request
    const uid = req.uid

    // Tries to save the project
    try {
        // Sets the project leader as the current user
        // Obtained from the JWT
        project.leader = req.uid

        // Initialize the ticket counter to 0
        project.ticket_count = 0

        // Initialize version control to 0
        project.version_control = [{
            update_id: 0,
            update_type: 'MAIN',
            update_user: uid,
            read_by: [uid]
        }]

        // Tries to save project into db
        let savedProject = await project.save()

        // Formats project to return leader's and colleagues' names
        savedProject = await formatProject(savedProject)

        // Returns successful response with saved project embedded
        return res.status(200).json({
            ok: true,
            savedProject
        })

    } catch (error) {
        // If anything goes wrong, return an error response
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error while creating project'
        })
    }
}

// Read and retrieve all projects matching a uid either on the
// leader field or in the colleagues array 
const readProjects = async(req, res = response) => {
    // Get uid from the request body, which was retrieved
    // from the JWT
    const uid = req.uid

    // Try to find projects matching that uid
    try {
        // Find projects where user is the leader
        const asLeader = await Project.find({leader: uid}).exec()

        const asLeaderFormatted = []

        for(let i = 0; i < asLeader.length; i++) {
            await asLeaderFormatted.push(await formatProject(asLeader[i]))
        }

        // Find projects where user is a colleague
        const asColleague = await Project.find({colleagues: uid}).exec()
        const asColleagueFormatted = []

        for(let i = 0; i < asColleague.length; i++) {
            await asColleagueFormatted.push(await formatProject(asColleague[i]))
        }

        // Return successful response with found projects embedded
        // If there are no projects, it will return an empty array
        return res.status(200).json({
            ok: true,
            projects: [
                ...asLeaderFormatted,
                ...asColleagueFormatted
            ]
        })

    } catch (error) {
        // If anything goes wrong, return an error response
        return res.status(500).json({
            ok: false,
            msg: 'Error while reading projects'
        })
    }
}

// Find and update a project matching with an id
const updateProject = async(req, res = response) => {
    // Retrieve id from url parameters and save it in a local variable
    const id = req.params.id

    // Get uid and name from the request body, 
    // which was retrieved from the JWT
    const uid = req.uid

    // Assigns the filter that is going to be used to search for the project
    // In this case we will search for _id matching id
    const filter = {
        _id: id
    }

    // Defines what is going to be update
    const update = req.body

    // Try to find a matchin project and update it
    try {
        // Executes a search by id on all projects
        const project = await Project.findById(id)

        // IF no project matched the search, return an error response
        if(!project) {
            return res.status(404).json({
                ok: false,
                msg: 'Error while updating project'
            })
        }

        // If found project does not belong to the user or user is not
        // in the colleagues array, return error response
        if(project.leader.toString() !== uid && !project.colleagues.some(user => user.toString() === uid)) {
            return res.status(401).json({
                ok: false,
                msg: 'Error while updating project'
            })
        }

        // Finds and update project (We already know it exists)
        let updatedProject = await Project.findOneAndUpdate(filter, update, {
            // Returns the new project state instead of the previous one
            new: true
        })

        // Format project to return leader's and colleagues' name
        updatedProject = await formatProject(updatedProject)

        // Return successful response with the updated project embedded
        return res.status(200).json({
            ok: true,
            // Right now we don't need to know the new state of the project
            // updatedProject
        })
    } catch (error) {
        // If anything goes wrong, return an error response
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error while updating project'
        })
    }
}

// Finds and deletes a project matching an id
const deleteProject = async(req, res = response) => {
    // Retrieve id from url paremeters
    const id = req.params.id

    // Retrieve uid and name from request 
    // (Which was passed in via the JWT
    const uid = req.uid

    // Try to find a matching project and delete it
    try {
        // Look for a project matching the id
        const project = await Project.findById(id)
        
        // If no project was found, return an error response
        if(!project) {
            return res.status(404).json({
                ok: false,
                msg: 'Error while deleting project'
            })
        }

        // If project was found but user is not the leader of the project
        if(project.leader.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'Error while deleting project'
            })
        }
        

        // Find and delete project (We know it exists and user has autorization)
        let deletedProject = await Project.findByIdAndDelete(id)

        // Format project to return leader's and colleagues' name
        deletedProject = await formatProject(deletedProject)

        // Return successful response with the deleted project embedded
        return res.status(200).json({
            ok: true,
            deletedProject
        })

    } catch (error) {
        // If anything goes wrong, return an error response
        return res.status(500).json({
            ok: false,
            msg: 'Error while deleting project'
        })
    }

}

const joinProject = async(req, res = response) => {
    const project_id = req.params.id
    const password = req.body.password
    const uid = req.uid

    const filter = {
        project_id
    }

    try {
        const project = await Project.findOne(filter)

        // Check if project exists
        if(!project) {
            return res.status(404).json({
                ok: false,
                msg: 'Error while joining project. No project matching that id.'
            })
        }

        // Check if passwords match
        if(project.password !== password) {
            return res.status(401).json({
                ok: false,
                msg: 'Error while joining project. Passwords do not match.'
            })
        }
        
        // Check if user is leader of the project
        if(project.leader.toString() === uid) {
            return res.status(412).json({
                ok: false,
                msg: 'Error while joining project. You can not join a project you own.'
            })
        }

        // Check if user is a colleague on the project
        if(project.colleagues.toString().includes(uid)) {
            return res.status(412).json({
                ok: false,
                msg: 'Error while joining project. You are already a colleague on that project.'
            })
        }
        
        const update = {
            colleagues: [
                ...project.colleagues,
                uid
            ]
        }
        
        let joinedProject = await Project.findOneAndUpdate(filter, update, {
            new: true
        }) 
        
        // Format project to return leader's and colleagues' name
        joinedProject = await formatProject(joinedProject)
        
        return res.status(200).json({
            ok: true,
            joinedProject
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error while joining project'
        })
    }
}

// Handles version control of the project to see if it 
// has been updated or not. If it has it returns all the
// tickets that were updated.

// For now it just returns all tickets from project tho
const compareProject = async(req, res = response) => {

    const _id = req.params.project_id
    const version_control = Number(req.params.version_control)

    try {
        const project = await Project.findById({_id})

        const version_diff = Math.abs(version_control - project.version_control[0].update_id)
        if(version_diff === 0) {
            return res.status(200).json({
                ok: true,
                has_updated: false
            })
        }

        
        let version_control_updates = [];
        let tickets = []
        let ticket_deletes = []

        for (let i = 0; i < version_diff; i++) {
            version_control_updates.push(project.version_control[0 + i])

            tickets.push(version_control_updates[i].ticket_id)
            if(version_control_updates[i].update_type === "DELETE TICKET") {
                ticket_deletes.push(version_control_updates[i].ticket_id)
            }
        }

        const ticket_ids = new Array(...new Set(tickets))

        const ticket_updates = await Ticket.find({
            _id: ticket_ids
        })


        return res.status(200).json({
            ok: true,
            has_updated: true,
            ticket_updates,
            version_control_updates,
            ticket_deletes
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error while doing version control'
        })
    }
}

const readNotification = async(req, res = response) => {
    const project_id = req.params.project_id
    const update_id = Number(req.params.update_id)
    const uid = req.uid

    try {
        const project = await Project.findById(project_id)

        // Check if project exists
        if (!project) {
            return res.status(404).json({
                ok: false,
                msg: "Error while reading notification. No such project found"
            })
        }

        // Check is user is the project leader or a colleague
        if(project.leader.toString() !== uid && project.colleagues.filter(colleague => {
            return colleague.toString() === uid
        }).length === 0) {
            return res.status(401).json({
                ok: false,
                msg: "Error while reading notification. You are not autorized."
            })
        }

        const update = project.version_control.filter(update => {
                return update.update_id === update_id
            })

            
        // Check if there is an update with that id
        if (update.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: "Error while reading notification. No update with that id"
            })
        }

        // Check if user has already read a notification
        if (update[0].read_by.includes(uid)) {
            return res.status(400).json({
                ok: false,
                msg: "Error while reading notification. You already read that update"
            })
        }

        // Generate new version to update project with
        const newUpdateState = project.version_control.map(update => {
            return update.update_id === update_id ? {
                ...update._doc,
                read_by: [
                    ...update._doc.read_by,
                    uid
                ] 
            } : update
        })

        // Find project and update it
        await Project.findByIdAndUpdate(project_id, {version_control: newUpdateState})
            
        // Return a successful response
        return res.status(200).json({
            ok: true,
            newUpdateState,
        })

        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Error while reading notification"
        })
    }
}

// Export CRUD functions for projects
module.exports = {
    createProject,
    readProjects,
    updateProject,
    deleteProject,
    joinProject,
    compareProject,
    readNotification
}