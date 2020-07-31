'use strict';

var express = require('express');
var app = express();
var routes = require('./routes/routes');

var mongoose = require('mongoose');

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/qa");

// reffernce for the db connection
var db = mongoose.connection;

db.on("error",function(err){
    console.error('Connection error:',err);
});

db.once("open",function(){
    console.log('Db connection successfull');
    // All database communication goes here
});

// PASRING JSON INCOMING REQUESTS
var jsonParser = require('body-parser').json;
app.use(jsonParser());

var logger = require('morgan');
const { json } = require('body-parser');
app.use(jsonParser());


app.use(function(req,res,next){
    // Used to restricts the domain the API can respond to
    // in this case an astrix no restricted domains(all domains)
    res.header("Access-Control-Allow-Origin","*");
    // tells the client which headers are permintted in the request
    res.header("Access-Control-Allow-Headers", "Origin, X-REquested-With, Content-Type, Accept");
    if(req.method == "OPTIONS"){
        res.header("Access-Control-Allow-Methods","PUT,POST,DELETE");
        return res.status(200).json({});
    }
    next();
});

// routing the the files routes
app.use('/questions', routes);

//catch 404 error and forward it to the error hander
app.use(function(req,res,next){
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Error Handler

app.use(function(err,req,res,next){
    res.status(err.status || 500);
    res.json({
        error: err.message
    })
});
var port = process.env.PORT || 3000;



app.listen(port,()=>{
    console.log('Listening at port ',port);
});
