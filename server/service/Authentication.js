const User = require('../models/User')
const bcrypt = require('bcrypt')

const InsertUser = async (userData) => {
    const {userName, firstName, lastName, emailAddress, password} = userData

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password.trim(), salt)

    return new Promise(async (resolve, reject) =>{
        try{
            const user = await User.create({
                userName: userName.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                emailAddress: emailAddress.trim().toLowerCase(),
                password: hashedPassword,
                refreshToken: null,
            }) 
            const foundUser = { _id: user._id, userName: user.userName, firstName: user.firstName, lastName: user.lastName, emailAddress: user.emailAddress }
            return resolve(foundUser)

        
        } catch (error) {
            return reject(error)
        }
    })
}

const UpdateTokenById = async (_id, refreshToken) => {
    
    return new Promise((resolve, reject) =>{
        User.findByIdAndUpdate(_id, { refreshToken })
        .then(user => {
            return resolve({message: "Refresh Token Updated"})
        })
        .catch(error => {
            if(error) { return reject(error) }
        })
    })
}

const QueryLogin = async (userData) => {
    return new Promise((resolve, reject) =>{
        const {userName, password} = userData

        User.findOne({ userName }, '_id userName firstName lastName password emailAddress')
        .then(user => {
            if(!user) { return reject([{type: "Login Credentials", message: "Invalid Username/Password Combination"}]) }
            bcrypt.compare(password, user.password)
            .then(auth => {
                if(auth) { return resolve({_id: user._id, userName: user.userName, firstName: user.firstName, lastName: user.lastName, emailAddress: user.emailAddress}) }
                return reject([{type: "Login Credentials", message: "Invalid Username/Password Combination"}])
            })
            .catch(error => reject({message: error}))
        })
        .catch(error => {
            return reject(error) 
        })
    })
}

const QueryByRefreshToken = (refreshToken) => {
    return new Promise(async (resolve, reject) =>{

        User.findOne({ refreshToken }, '_id userName firstName lastName emailAddress')
        .then(user => {
            if(!user) { return resolve(null) }
            return resolve(user)
        })
        .catch(error => {
            return resolve(null)
        })
    })
}

module.exports = { InsertUser, QueryLogin, UpdateTokenById, QueryByRefreshToken } 