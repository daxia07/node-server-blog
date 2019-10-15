const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const auth = require('./auth')
require('dotenv').config()

const PORT = process.env.PORT || 8080

const app = express()

const jsonParser = bodyParser.json()

const authConfig = {
  domain: "alienz.au.auth0.com",
  audience: "https://www.prawn-dumpling.com/api"
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
  res.send("hi");
})

app.get("/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your Access Token was successfully validated"
  })
})


app.get("/users", (req, res) => {
  res.json([
    { name: "William", location: "Abu Dhabi" },
    { name: "Chris", location: "Vegas" }
  ])
})

// TODO: need authentication
app.post("/user", jsonParser, async (req, res) => {
  console.log(req.body)
  const { name, location } = req.body
  console.log(req)
  const token = await auth.getToken()
  // deal with user info
  // 1. create unique user name
  // 2. create user profile in contentful
  // 3. update app_metadata
  res.send({ status: "User created", name, location });
});



app.listen(PORT, () => console.log(`API on PORT: ${PORT}`));
