const Joi = require('joi')
const User = require('../models/User')
const ResetToken = require('../models/ResetToken')
const bcrypt = require('bcrypt')

const dateNow = new Date()

const registerSchema =  Joi.object({
    userName: Joi.string().min(6).max(20).trim().required().label('User Name'),
    firstName: Joi.string().min(3).max(20).trim().required().label('First Name'),
    lastName: Joi.string().min(3).max(20).trim().required().label('Last Name'),
    emailAddress: Joi.string().max(50).trim().email().lowercase().required().label('Email Address'),
    password: Joi.string().min(6).trim().required().label('Password'),
    confirmPassword: Joi.any().equal(Joi.ref('password')).required().label('Confirm Password').options({ messages: { 'any.only': '{{#label}} does not match'} })
})

const profilePatchSchema =  Joi.object({
    userName: Joi.string().min(6).max(20).trim().label('User Name'),
    firstName: Joi.string().min(3).max(20).trim().label('First Name'),
    lastName: Joi.string().min(3).max(20).trim().label('Last Name'),
    emailAddress: Joi.string().max(50).trim().email().lowercase().label('Email Address'),
    password: Joi.string().min(6).trim().label('Password'),
})

const passwordPatchSchema =  Joi.object({
    password: Joi.string().min(6).trim().required().label('Password'),
    newPassword: Joi.string().min(6).trim().required().label('New Password'),
    confirmNewPassword: Joi.any().equal(Joi.ref('newPassword')).required().label('Confirm New Password').options({ messages: { 'any.only': '{{#label}} does not match'} })
})

const loginSchema =  Joi.object({
    userName: Joi.string().min(6).max(20).trim().required().label('User Name'),
    password: Joi.string().min(6).trim().required().label('Password'),
})

const resetPasswordSchema =  Joi.object({
    userId: Joi.string().min(6).trim().required().label('User ID'),
    token: Joi.string().trim().required().label('Reset Token'),
    password: Joi.string().min(6).trim().required().label('Password'),
})

const otherRoomSchema = Joi.object({
    name: Joi.string().trim().required().label('Room Name'),
    count: Joi.number().min(1).required().label('Count')
})


const ValidateRegistration = (userData) => {
    const {userName, emailAddress} = userData
    
    return new Promise(async (resolve, reject) =>{

        const { error, value } = registerSchema.validate(userData, {abortEarly: false})
        if(error) { 
            const errors = error.details.map(error => { return {type: error.context.label, message: error.message} })
            console.log(errors)
            return reject(errors)
        } else {
            const userNameCheck = await User.findOne({userName: userName.trim()})
            if(userNameCheck){ return reject([{type: "User Name", message: "User Name already exists"}]) }
            const emailAddressCheck = await User.findOne({emailAddress: emailAddress.trim()})
            if(emailAddressCheck){ return reject([{type: "Email Address", message: "Email Address is already in use"}]) }
        }
        return resolve(value)
        
    })    
}

const ValidateResetPassword = (resetData) => {
    const {userId, token} = resetData
    console.log(resetData)
    
    return new Promise(async (resolve, reject) =>{

        const { error, value } = resetPasswordSchema.validate(resetData, {abortEarly: false})
        if(error) { 
            const errors = error.details.map(error => { return {type: error.context.label, message: error.message} })
            console.log(errors)
            return reject(errors)
        } else {
            const resetToken = await ResetToken.findOne({userId})
            if(!resetToken){ return reject([{type: "Token", message: "Invalid or expired password reset token"}]) }
            const isValid = await bcrypt.compare(token, resetToken.token)
            if(!isValid){ return reject([{type: "Token", message: "Invalid or expired password reset token"}]) }
        }
        return resolve(value)
        
    })    
}

const ValidateLogin = (userData) => {
    return new Promise((resolve, reject) =>{
        const { error, value } = loginSchema.validate(userData, {abortEarly: false})

        if(error) { 
            const errors = error.details.map(error => { return {type: error.context.label, message: error.message} })
            return reject(errors)
        } else {
            return resolve(value)
        }
    })
}


const ValidateProfilePatch = (_id, profileData) => {
    return new Promise(async (resolve, reject) =>{
        const { error, value } = profilePatchSchema.validate(profileData, {abortEarly: false})

        if(error) { 
            const errors = error.details.map(error => { return {type: error.context.label, message: error.message} })
            return reject(errors)
        } else {
            const { password } = profileData
            User.findById(_id, '_id userName firstName lastName password emailAddress')
            .then(user => {
                if(!user) { return reject([{type: "User", message: "User not found"}]) }
                bcrypt.compare(password, user.password)
                .then(auth => {
                    delete value.password
                    if(auth) { return resolve(value) }
                    return reject([{type: "Password", message: "Incorrect password"}]) 
                })

            })
            .catch(error => {
                return reject(error)
            })
        }
    })
}

const ValidatePasswordPatch = (_id, passwordData) => {
    return new Promise(async (resolve, reject) =>{
        const { error, value } = passwordPatchSchema.validate(passwordData, {abortEarly: false})

        if(error) { 
            const errors = error.details.map(error => { return {type: error.context.label, message: error.message} })
            return reject(errors)
        } else {
            const { password } = passwordData
            User.findById(_id, '_id userName firstName lastName password emailAddress')
            .then(user => {
                if(!user) { return reject([{type: "User", message: "User not found"}]) }

                bcrypt.compare(password, user.password)
                .then(auth => {
                    // if(password === user.password){
                    //     return resolve(value)
                    // }
                    if(auth) { return resolve(value) }
                    return reject([{type: "Password", message: "Incorrect password"}]) 
                })
                .catch(error => { return reject({message: error}) })
            })
            .catch(error => {
                return reject(error)
            })
        }
    })
}



module.exports = { ValidateRegistration, ValidateLogin,  ValidateResetPassword, ValidateProfilePatch, ValidatePasswordPatch } 