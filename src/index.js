const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const auth = require('./auth')
const cors = require('cors')
require('dotenv').config()


const PORT = process.env.PORT || 8080

const app = express()

app.use(cors())

const jsonParser = bodyParser.json()

const authConfig = {
  domain: "alienz.au.auth0.com",
  // audience: "https://www.prawn-dumpling.com/api"
  audience: "https://alienz.au.auth0.com/api/v2/"
}


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ["RS256"]
})

app.get("/", (req, res) => {
  res.send(`${process.env.cont_space_id}`)
})

app.get("/external", checkJwt, (req, res) => {
  console.log(req.user)
  res.send({
    msg: "Your Access Token was successfully validated"
  })
})


app.post("/user", checkJwt, jsonParser, async (req, res) => {
  const { userName: userName, ...rest } = req.body
  console.log(req.body)
  try {
    const token = await auth.getToken()
    const users = await auth.getUserByName(token, userName)
    if (typeof users !== 'undefined' && Array.isArray(users) && users.length) {
      res.send({
        status: 404,
        name: userName,
        msg: "username already taken, try a new one"
      })
    } else {
      // deal with user info, try create new profile with unique id
      
      // 1. create unique user name
      // 2. create user profile in contentful
      // 3. update app_metadata
      res.send({
        status: 200,
        name: userName,
        msg: `username ${userName} setup!`
      })
    }
  } catch (err) {
    res.send({
      status: 500,
      name: userName,
      msg: "Internal error, try again later"
    })
  }


})



app.listen(PORT, () => console.log(`API on PORT: ${PORT}`));
