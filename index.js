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
      console.log(`sending users:\n${users.toString()}`)
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



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
