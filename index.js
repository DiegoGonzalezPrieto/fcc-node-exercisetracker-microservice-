const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require ('./persistence')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


/* Middleware */

app.use(bodyParser.urlencoded({extended: false}))

// check empty date, invalid date, or return casted to Date
const dateCheck = (date)=>{
  let d = new Date(date)

  if (!date) return new Date()
  if (d.toString() == "Invalid Date") throw "Invalid date"
  return d
}

/* Endpoints */

app.route('/api/users')
  .get((req, res)=>{
    db.getUsers((err, users)=>{
      if (err) return res.json({
        "error" : "Could not fetch users",
        "cause" : err
      })
      res.json(users)
    })
  })
  .post((req, res)=>{
    let username = req.body.username
    db.createUser(username, (err, data)=>{
      if (err) return res.json({
        "error" : "Could not create user",
        "cause" : err
      })
      res.json({"_id": data._id, "username": data.username})

    })
  })


// Create exercise
app.post('/api/users/:id/exercises', (req, res)=>{
  let userId = req.params.id
  let exercise = new db.Exercise({
    description : req.body.description,
    duration : req.body.duration,
    date : dateCheck(req.body.date)
  })
  db.createExercise(exercise, userId, (err, doc)=>{
    if (err) return res.json({
      "error" : "Could not save exercise.",
      "cause" : err
    })
    let lastEx = doc.log.pop()
    let result = {
      "_id" : doc._id,
      "username" : doc.username,
      "description" : lastEx.description,
      "duration" : lastEx.duration,
      "date" : lastEx.date.toDateString()
    }
    res.json(result)
  })

})

// Get logs
app.get('/api/users/:_id/logs', (req, res)=>{
  let from = req.query.from ? new Date(req.query.from) : new Date(0);
  let to = req.query.to ? new Date(req.query.to) : new Date();
  let limit = req.query.limit ? - parseInt(req.query.limit) : 0;

  db.readLogs(req.params._id, from, to, limit,
    (err, user)=>{
      if (err) return res.json({
        "error" : "Couldn't fetch logs.",
        "cause" : err
      })
      let result = user[0]
      result.log.forEach(ex=>{
        ex.date = ex.date.toDateString()
      })
      res.json(result)
    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
