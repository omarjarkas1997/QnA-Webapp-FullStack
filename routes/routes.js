'use strict';

var express = require('express');
var router = express.Router();
const  Question  = require('../models').Question;

// Whenever qId is present this following function will be executed
// the fallback function has the same paramters as the middlware expect the id 
// the id the the variable to will store the route qID
router.param("qID", function(req,res,next,id){
        Question.findById(id, function(err,doc){
        if(err) return next(err);
        if(!doc) {
            err = new Error("not Found");
            err.status = 404;
            return next(err);
        }
        req.question = doc;
        return next();
    });
});

router.param("aID", function(req,res,next,id){
    req.answer = req.question.answers.id(id);
    if(!req.answer) {
        err = new Error("Not Found");
        err.status = 404;
        return next(err);
    }
    next();
});

// GET /questions
// return all question
router.get('/',function(req,res,next){
    // getting all the questions 
    // the second parameter is for restricting the value
    // since we want all the values 
    // we pass null
    // sorted with the most recent dates desending order

    // FIRST WAY
    // Question.find({},null, {sort: {createdAt:-1}}, function(err,questions){
    //     if(err) return next(err);
    //     res.json(questions);
    // });

    //  SECOND WAY another preffered way
    // this way we first perform the query
    // then we sort it by votes
    // then execute the fallback function which will return the response with the questions in json
    Question.find({}).sort({createdAt:-1})
                        .exec(function(err, question){
                            if (err) return next(err);
                            res.json(question);
                        });
});

// POST /questions

router.post('/',function(req,res){
    // to create a question we can easily pass it to the model constructor
    // call the save method on it
    var question = new Question(req.body);
    question.save(function(err, question){
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
});

// GET /questions/:qID
// route for specific questions
router.get('/:qID',function(req, res, next){

    // FIRST WAY
    // Question.findById(req.params.qID, function(err,doc){
    //     if(err) return next(err);
    //     res.json(doc);
    // });

    // SECOND WAY // i PERSONALLY PREFFERED THE FIRST, ITS LESS COMPLICATED
    res.json(req.question);
});

// POST /questions/:qID/answer
// Create an answer to a specific question
router.post('/:qID/answers',function(req,res,next){
    req.question.answers.push(req.body);
    req.question.save(function(err, question){
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
});

// PUT /questions/:qID/answer/:aID
// Update an answer on a specific route
router.put('/:qID/answers/:aID',function(req,res,next){
    req.answer.update(req.body, function(err,result){
        if (err) return next(err);
        res.json(result);
    });
});

// DELETE /questions/:qID/answer/:aID
// Delete an answer on a specific route
router.delete('/:qID/answers/:aID',function(req,res){
    req.answer.remove(function(err){
        req.question.save(function(err, question){
            if(err) return next(err);
            res.json(question);
        });
    });
});


// VOTING ON ANSWERS

// POST /questions/:qID/answer/:aID/vote-up
// POST /questions/:qID/answer/:aID/vote-down
// Vote on an specific answer 
router.post('/:qID/answers/:aID/vote-:dir',function(req,res,next){
    // function for validating the URL first
    // We only want Up or down 
    // Anything else is an error
    if(req.params.dir.search(/^(up|down)$/) === -1){
        var err = new Error("Not Found");
        err.status = 404;
        next(err); // to trigger the error handler
    } else {
        req.vote = req.params.dir;
        next(); // for executing the below function
    }
    },function(req,res,next){
        req.answer.vote(req.vote,function(err,question){
            if(err) return next(err);
            res.json(question);
        });
});



module.exports = router;