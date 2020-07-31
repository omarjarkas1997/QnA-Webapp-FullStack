'use strict';


var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sortAnswers = function(a,b){
    // -ve if a before b
    //  0 no change
    // +ve a after b
    if (a.votes === b.votes){
        return b.votes - a.votes;
    }
    return b.votes - a.votes;
}
// creating our Answer schema
var AnswerSchema = new Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    votes: { type: Number, default:0 }
});

AnswerSchema.method("update", function(update,callback){
    Object.assign(this,update,{updatedAt: new Date()});
    this.parent().save(callback);
});

AnswerSchema.method("vote", function(vote,callback){
    if(vote == "up"){
        this.votes += 1;
    } else {
        this.votes -= 1;
    }
    this.parent().save(callback);
});

// creating our Question schema and nesting Answer schema inside
var QuestionSchema = new Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    answers: [AnswerSchema]
});


QuestionSchema.pre("save", function(next){
	this.answers.sort(sortAnswers);
	next();
});

var Question = mongoose.model("Question", QuestionSchema);


module.exports.Question = Question;