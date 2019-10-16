const contentful = require('contentful-management')
const axios = require("axios").default


const ctfAPI = axios.create({
  baseURL: 'https://api.contentful.com/spaces',
})

const getClient = () => contentful.createClient({
  accessToken: process.env.CON_KEY
})


// Actions
const deleteEntity = async (entity, filter = () => false)  => {
  try {
    if (filter(entity)) {
      console.log(entity)
      const unpublishRes = await entity.unpublish()
      const deleteRes = await entity.delete()
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getAllTypes = async (action = () => {}) => {
  try {
    const space = await getClient().getSpace(process.env.CONT_SPACE_ID)
    const res = await space.getContentTypes()
    res.items.forEach((ele, index) => action(ele))
    return res.items
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getAllEntries = async (action = ele => {}) => {
  try {
    const space = await getClient().getSpace(process.env.CONT_SPACE_ID)
    const response = await space.getEntries()
    response.items.forEach((ele, index) => action(ele))
    return response.items
  } catch (err) {
    throw err
  }
}

const createOrUpdateProfile = async (profile, loc="en-US", env_id="master") => {
  const {fullName, userName, shortBio, socialLink} = profile
  const firstName = fullName.substr(0, fullName.indexOf(' '))
  const lastName = fullName.substr(fullName.indexOf(' ') + 1)
  console.log(process.env)

  let space
  try {
    // create
    const config = {
      method: 'put',
      url: `/${process.env.CONT_SPACE_ID}/environments/${env_id}/entries/${userName}/`,
      headers: {
        'Content-type': 'application/vnd.contentful.management.v1+json',
        'X-Contentful-Content-Type': 'person',
        'Authorization': 'Bearer ' + process.env.CON_KEY
      },
      data: {
        fields: {
          name: { [loc]: userName },
          firstName: {[loc]: firstName},
          lastName: {[loc]: lastName},
          shortBio: {[loc]: shortBio},
          socialLink: {[loc]: socialLink}
        }
      }
    }
    const res = await ctfAPI(config)
    console.log(res.data)

  } catch (err) {
    console.log(err)
    try {
      // space = space && getClient().getSpace()
    } catch (err) {
      console.log(err)
      throw err
    }
  }
  try {
    // publish
  } catch (err) {
    console.log(err)
    throw err
  }
}



module.exports = {
  getAllTypes,
  getAllEntries,
  deleteEntity,
  createOrUpdateProfile
}
  
if (process.env.NODE_ENV === 'DEBUG') {
  // const myCat = ["about", "blogPost", "person"]
  // const action = ele => {
  //   deleteAction(ele, ele => !myCat.includes(ele.sys.id))
  // }
  // getAllTypes(action)
  //   .then(res => console.log('done'))
  const mockProfile = {
    "fullName": "Mingxia Li",
    "shortBio": "aaaaaaaaaaaaaaaaaaaaaa",
    "socialLink": "",
    "userName": "u"
  }
  createOrUpdateProfile(mockProfile)
}

