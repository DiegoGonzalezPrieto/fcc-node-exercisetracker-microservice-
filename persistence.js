// crud.js

const mongoose = require('mongoose')
require('dotenv').config()


// Database connection
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

// Schemas and models

let exerciseSchema = mongoose.Schema({
  description : {type : String, required : true},
  duration : {type : Number, required : true},
  date : Date
})

let userSchema = mongoose.Schema({
  username: {type : String, required: true},
  count: Number,
  log: [exerciseSchema]
});


let User = mongoose.model('User', userSchema)
let Exercise = mongoose.model('Exercise', exerciseSchema)

// CRUD

// Get All Users
const getUsers = (done)=>{
  User.find({}, 'username', (err, users)=>{
    if (err) return done(err)
    done(null, users)
  })
}

// Find user by id

const findUserById = (id, done)=>{
  User.findById(id,(err, user)=>{
    if (err) return done(err)
    done(null, user)
  })
}

// Create a user
const createUser = (username, done)=>{
  let user = new User({
    username: username,
    count : 0
  })
  user.save((err, data)=>{
    if (err) return done(err)
    done(null, data)
  })
}

// Create an exercise
const createExercise = (exercise, userId, done)=>{
  findUserById(userId, (err, foundUser)=>{
    if (err) return done(err)
    let user = foundUser
    // add new exercise to user's log
    user.log.push(exercise)
    // update user with new exercise
    user.save((err, doc)=>{
      if (err) return done(err)
      done(null, doc)
    })
  })
}



// Expose CRUD operations and Models (if needed)
exports = module.exports

exports.User = User
exports.Exercise = Exercise

exports.getUsers = getUsers
exports.createUser = createUser

exports.createExercise = createExercise
