const axios = require("axios").default;

const token_inst = axios.create({
  baseURL: 'https://alienz.au.auth0.com/oauth/token',
  headers: {
    'content-type': 'application/json'
  }
});

const getToken = async () => {
  try {
    let res = await token_inst({
      method: 'post',
      url: '',
      data: {
        "client_id": "1z3xiMMJQiOBIKdgT7iV6JczC61zXu4U",
        "client_secret":process.env.AUTH0_NODE_SECRET,
        "audience": "https://alienz.au.auth0.com/api/v2/",
        "grant_type": "client_credentials"
      }
    });
    return res.data.access_token
  } catch (err) {
    console.log(err)
    return err
  }
}

module.exports.getToken = getToken


