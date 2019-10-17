const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const auth = require('./auth')
const cors = require('cors')
const ctf = require('./content')
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
  res.send(`Hi there`)
})

app.get("/external", checkJwt, (req, res) => {
  // console.log(req.user)
  res.send({
    msg: "Your Access Token was successfully validated"
  })
})


app.post("/user", checkJwt, jsonParser, async (req, res) => {
  const { userName: name, ...rest } = req.body
  try {
    const token = await auth.getToken()
    const users = await auth.getUserByName(token, name)
    if (typeof users !== 'undefined' && Array.isArray(users) && users.length) {
      res.send({
        status: 404,
        name,
        msg: "username already taken, try a new one"
      })
    } else {
      // deal with user info, try create new profile with unique id
      // 1. create unique user name
      // 2. create user profile in contentful
      await ctf.createOrUpdateProfile({
        name,
        ...rest
      })
      // 3. update app_metadata
      const userId = req.user.sub
      await auth.setAppMetaData(token, userId, {
        "app_metadata": {
        username: name
      }})
      res.send({
        status: 200,
        name,
        msg: `username ${name} setup!`
      })
    }
  } catch (err) {
    console.log(err)
    res.send({
      status: 500,
      name,
      msg: "Internal error, try again later"
    })
  }
})

app.post("/article", checkJwt, jsonParser, async (req, res) => {
  const { userName: name, ...rest } = req.body
  try {
    const token = await auth.getToken()
    const users = await auth.getUserByName(token, name)
    if (typeof users !== 'undefined' && Array.isArray(users) && users.length) {
      res.send({
        status: 404,
        name,
        msg: "username already taken, try a new one"
      })
    } else {
      // deal with user info, try create new profile with unique id
      // 1. create unique user name
      // 2. create user profile in contentful
      await ctf.createOrUpdateProfile({
        name,
        ...rest
      })
      // 3. update app_metadata
      const userId = req.user.sub
      await auth.setAppMetaData(token, userId, {
        "app_metadata": {
        username: name
      }})
      res.send({
        status: 200,
        name,
        msg: `username ${name} setup!`
      })
    }
  } catch (err) {
    console.log(err)
    res.send({
      status: 500,
      name,
      msg: "Internal error, try again later"
    })
  }
})


app.listen(PORT, () => console.log(`API on PORT: ${PORT}`));
