const mongoose = require('mongoose')


const db = ()=>{

    try{
        const dbConnect = mongoose.connect(process.env.MONGODB_URL)
        console.log('Database Connected Successfully!');
    }catch(error){
        console.log('Database error');
    }
}


module.exports = db

