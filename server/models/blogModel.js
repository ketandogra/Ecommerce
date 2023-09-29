const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true

    },
    category:{
        type:String,
        required:true

    },
    numViews:{
        type:Number,
        default:0
    },

    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    image:{
        type:String,
        default:"https://cdn.smallseotools.com/blog-images-s3/1_blog1.jpg"
    },
    author:{
        type:String,
        default:"Admin"

    }

},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);