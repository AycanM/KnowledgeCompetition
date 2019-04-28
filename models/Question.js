const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionSchema = new Schema({
    text : {
        type:String,
        required:true
    },
    a : {
        type:String,
        required:true
    },
    b : {
        type:String,
        required:true
    },
    c: {
        type:String,
        required:true
    },
    d : {
        type:String,
        required:true
    },
    trueOption : {
        type:String,
        required:true
    },
});

module.exports = mongoose.model('questions', QuestionSchema);