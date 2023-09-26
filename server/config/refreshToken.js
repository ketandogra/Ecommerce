const jwt = require('jsonwebtoken')

//function to generate refresh token
const generateRefreshToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'3d'})
}

module.exports = {generateRefreshToken}