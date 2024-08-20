const { QueryAllUsers, QueryUserById, UpdateUserById, UpdatePasswordById  } = require("../service/Users");
const { ValidateProfilePatch, ValidatePasswordPatch } = require("../service/Validation");

const GetAllUsers = async (req, res) => {
    try{
        let results = await QueryAllUsers()
        res.status(200).json({data: results})
    } catch(error){     
        console.log(error)
        res.status(500)
    }
}

const GetUser = async (req, res) => {
    const { id } = req.params
    try{
        let results = await QueryUserById(id)
        res.status(200).json({data: results})
    } catch(error){
        console.log(error)
        res.status(500)
    }
}

const PatchProfile = async (req, res) => {
    const profileData = req.body
    const { _id } = req.params
    ValidateProfilePatch(_id, profileData).then(profileData => {
        UpdateUserById(_id, profileData).then(user => {
            return res.status(200).json({user, message: 'User updated successfully'})
        }).catch(error => {
            console.log(error)
            return res.status(500).json({message: error})
        })
    }).catch(error => {
        console.log(error)
        return res.status(500).json({message: error})
    })
}

const PatchPassword = async (req, res) => {
    const passwordData = req.body
    const { _id } = req.params
    ValidatePasswordPatch(_id, passwordData).then(passwordData => {
        UpdatePasswordById(_id, passwordData.newPassword).then(user => {
            return res.status(200).json({user, message: 'Password updated successfully'})
        }).catch(error => {
            console.log(error)
            return res.status(500).json({message: error})
        })
    }).catch(error => {
        console.log(error)
        return res.status(500).json({message: error})
    })
}



module.exports = { GetAllUsers, GetUser, PatchProfile, PatchPassword };  