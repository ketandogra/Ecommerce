const jwt = require('jsonwebtoken')

//function to return jwt token 
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'1d'})
}

module.exports = {generateToken}