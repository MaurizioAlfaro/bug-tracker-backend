const Ticket = require("../models/Ticket")
const User = require("../models/User")

const formatProject = async(project) => { 

    let formattedColleagues = []

    for (let i = 0; i < project.colleagues.length; i++) {
        formattedColleagues.push({
            uid: project.colleagues[i],
            name: (await User.findById(project.colleagues[i])).name
        })
    }

    const tickets = await Ticket.find({project: project._id})

    return {
        ...project._doc,
        leader: {
            name: (await User.findById(project.leader)).name,
            uid: project.leader
        },
        colleagues: formattedColleagues,
        tickets
    }
}

module.exports = {
    formatProject
}