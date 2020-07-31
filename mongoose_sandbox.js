'use strict';

var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/sandbox");

// reffernce for the db connection
var db = mongoose.connection;

db.on("error",function(err){
    console.error('Connection error:',err);
});

db.once("open",function(){
    console.log('Db connection successfull');
    // All database communication goes here

    var Schema = mongoose.Schema;
    
    // scheme to define the attributes we want
    var AnimalSchema = new Schema({
        type: {type: String, default: "gold"},
        size: String,
        color: {type: String, default: 'golden'},
        mass: {type: Number, default: 0.006},
        name: {type: String, default: 'Angela'}    
    });

    // putting a query that is used alot in a static method
    AnimalSchema.statics.findSmall = function(callback){
        return this.find({size:"small"},callback);
    };

    AnimalSchema.statics.findSize = function(size,callback){
        return this.find({size: size},callback);
    };

    // data based on document we already have
    // if we want to find an animal than we want to find more animals with the same color
    // instant methods



    // pre hook middleware to change data before they get inserted into the db
    AnimalSchema.pre("save",function(next){
        if (this.mass >= 100){
            this.size = "big";
        } else if ( this.mass >= 5 && this.mass < 100){
            this.size = "medium";
        }else {
            this.size = "small";
        }
        next();
    });
    var Animal = mongoose.model("Animal", AnimalSchema);
    var animal = new Animal({}); // GoldFish
    var elephant = new Animal({
        type:'Elephant',
        color:'gray',
        mass: 6000,
        name: 'Lawrance'
    });

    var whale = new Animal({
        type: "Whale",
        mass:190500,
        name: "Fig"
    });
	AnimalSchema.methods.findSameColor = function(callback) {
		//this == document
		return this.model("Animal").find({color: this.color}, callback);
	}
    var animalData = [
        {
            type: "mouse",
            color: "gray",
            mass: 0.035,
            name: "Marvin"
        },
        {
            type: "Nutira",
            color: "brown",
            mass: 0.35,
            name: "Grentchen"
        },
        {
            type: "Wold",
            color: "gray",
            mass: 56,
            name: "Alice"
        },
        elephant,
        whale,
        animal
    ];



    // we can remove all the object from the collection by passing in 
    // the empty object as parameter

	Animal.remove({}, function(err) {
		if (err) console.error(err);
		Animal.create(animalData, function(err, animals){
			if (err) console.error(err);
			Animal.findOne({type: "elephant"}, function(err, elephant) {
				elephant.findSameColor(function(err, animals){
					if (err) console.error(err);
					animals.forEach(function(animal){
						console.log(animal.name + " the " + animal.color + 
							" " + animal.type + " is a " + animal.size + "-sized animal.");
					});
					db.close(function(){
						console.log("db connection closed");
					});
				});
			});
		});
	});
    });
