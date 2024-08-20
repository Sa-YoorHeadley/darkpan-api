const User = require('../models/User')
const bcrypt = require('bcrypt')


const QueryAllUsers = () => {
    return new Promise(async (resolve, reject) =>{
        User.find({}, '_id userName firstName lastName emailAddress')
        .then(users => {
            if(users.length === 0) { return reject() }
            
            return resolve(users)

        })
        .catch(error => {
            return reject(error)
        })
    })
}

const QueryUserById = (_id) => {
    return new Promise(async (resolve, reject) =>{
        User.findById(_id, '_id userName firstName lastName emailAddress')
        .then(user => {
            if(!user) { return resolve(null) }
            
            return resolve(user)
        })
        .catch(error => {
            return reject(error)
        })
    })
}

const QueryUserByEmailAddress = (emailAddress) => {
    return new Promise(async (resolve, reject) =>{
        User.findOne({emailAddress}, {})
        .then(user => {
            if(!user) { return resolve(null) }
            
            return resolve(user)
        })
        .catch(error => {
            return reject(error)
        })
    })
}

const UpdatePasswordById = (_id, password) => {
    console.log(password)
    return new Promise(async (resolve, reject) =>{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password.trim(), salt)
    
        User.findByIdAndUpdate(_id, { $set: { password: hashedPassword } }, { new: true })
        .then(user => {
            if(!user) { return resolve(null) }            
            return resolve({_id: user._id, userName: user.userName, firstName: user.firstName, lastName: user.lastName, emailAddress: user.emailAddress}) 
        })
        .catch(error => {
            return reject(error)
        }) 
    })
}

const UpdateUserById = (_id, profileData) => {
    return new Promise(async (resolve, reject) =>{    
        User.findByIdAndUpdate(_id, { $set: { ...profileData } }, { new: true })
        .then(user => {
            if(!user) { return reject(null) }            
            return resolve({_id: user._id, userName: user.userName, firstName: user.firstName, lastName: user.lastName, emailAddress: user.emailAddress}) 
        })
        .catch(error => {
            if(error) { return reject(error) }
        })
    })
}

module.exports = { QueryAllUsers, QueryUserById, QueryUserByEmailAddress, UpdatePasswordById, UpdateUserById } 