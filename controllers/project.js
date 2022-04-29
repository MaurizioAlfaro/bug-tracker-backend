const { response } = require("express");
const { formatProject } = require("../helpers/user");
const Project = require("../models/Project");
const User = require("../models/User");

// Creates a new project with the leader set to the user
const createProject = async(req, res = response) => {
    // Create a new project with the information inside the request's body

    const project = new Project(req.body)   

    // Tries to save the project
    try {
        // Sets the project leader as the current user
        // Obtained from the JWT
        project.leader = req.uid

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
            projects: {
                asLeader: asLeaderFormatted,
                asColleague: asColleagueFormatted
            }
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
            updatedProject
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

        if(project.password !== password) {
            return res.status(401).json({
                ok: false,
                msg: 'Error while joining project'
            })
        }
        
        const update = {
            colleagues: [
                ...project.colleagues,
                uid
            ]
        }

        const joinedProject = await Project.findOneAndUpdate(filter, update, {
            new: true
        }) 

        // Format project to return leader's and colleagues' name
        joinedProject = await formatProject(joinedProject)

        return res.status(200).json({
            ok: true,
            joinedProject
        })

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error while joining project'
        })
    }
}

// Export CRUD functions for projects
module.exports = {
    createProject,
    readProjects,
    updateProject,
    deleteProject,
    joinProject
}