const Project = require("../models/Project")

const updateVersionControl = async( project_id, ticket_id, type, uid ) => {
    const project = await Project.findById(project_id)
    const { version_control } = project 
    
    await Project.findByIdAndUpdate(
        project_id,
        {
            version_control: [
                {
                    update_id: version_control[0].update_id + 1,
                    update_type: type,
                    update_user: uid,
                    ticket_id,
                    
                },
                ...version_control,
            ]
        }
        )
        
    return version_control[0].update_id + 1
}

module.exports = {
    updateVersionControl
}