const jwt = require('jsonwebtoken')
const { QueryUserById } = require('../service/Users')

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] 
    if(!authHeader?.startsWith('Bearer ')) { return res.status(401).json({ message: "User not logged in" })}
    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, async (error, decodedToken) => {
        if (error) { return res.status(403).json({ message: "Invalid token"}) }
        req._id = decodedToken._id
        req.roles = decodedToken.roles
        next()
    })
}

module.exports = { requireAuth }