const ResetToken = require('../models/ResetToken')
const bcrypt = require('bcrypt')

const FindResetTokenById = (userId) => {
    return new Promise(async (resolve, reject) =>{
        ResetToken.findOne({userId}, {})
        .then(resetToken => {
            if(!resetToken) { return resolve(null) }
            
            return resolve(resetToken)
        })
        .catch(error => {
            return reject({type: 'error', error})
        })
    })
}

const DeleteResetTokenById = (userId) => {
    return new Promise(async (resolve, reject) =>{
        ResetToken.deleteOne({userId})
        .then(() => {            
            return resolve()
        }).catch(error => {
            return reject({type: 'error', error})
        })
    })
}
const InsertResetToken = async (userId, resetToken, createdAt) => {
    const salt = await bcrypt.genSalt()
    const token = await bcrypt.hash(resetToken, salt);
    return new Promise(async (resolve, reject) =>{
        try{
            const newToken = await ResetToken.create({
                userId,
                token,
                createdAt
            }) 
            return resolve(newToken)
        } catch (error) {
            return reject({type: 'error', error}) 
        }
    })
}
module.exports = { FindResetTokenById, DeleteResetTokenById, InsertResetToken } 