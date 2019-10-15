const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const PORT = process.env.PORT || 8080;

const app = express();

const authConfig = {
  domain: "alienz.au.auth0.com",
  audience: "https://www.prawn-dumpling.com/api"
};

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
});

app.get("/", (req, res) => {
  res.send("hi");
})

app.get("/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your Access Token was successfully validated"
  });
});


app.get("/users", (req, res) => {
  res.json([
    { name: "William", location: "Abu Dhabi" },
    { name: "Chris", location: "Vegas" }
  ]);
});

app.post("/user", (req, res) => {
  const { name, location } = req.body;

  res.send({ status: "User created", name, location });
});



app.listen(PORT, () => console.log(`API on PORT: ${PORT}`));
