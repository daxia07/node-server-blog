const contentful = require('contentful-management')
const axios = require("axios").default


const ctfAPI = axios.create({
  baseURL: 'https://api.contentful.com/spaces',
})

const getClient = () => contentful.createClient({
  accessToken: process.env.CON_KEY
})

const formatData = (data, loc = "en-US") => {
  let ret = {}
  Object.keys(data).forEach((key, index) => {
    ret = {
      ...ret,
      [key]: {
        [loc]: data[key]
      }
    }
  })
  return ret
}


// Actions
const deleteEntity = async (entity, filter = () => false) => {
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

const createOrUpdateProfile = async (profile, loc = "en-US", env_id = "master") => {
  let env, data, entry
  const { fullName, name, shortBio, socialLink } = profile
  try {
    const firstName = fullName.substr(0, fullName.indexOf(' '))
    const lastName = fullName.substr(fullName.indexOf(' ') + 1)
    data = formatData({ name,firstName,lastName, shortBio,socialLink})
    const space = await getClient().getSpace(process.env.CONT_SPACE_ID)
    env = await space.getEnvironment(env_id)
    entry = await env.createEntryWithId('person', name, { fields: data })
    console.log(`Type Person entry: ${entry.sys.id} created`)
    entry.publish().then(entry => console.log(`Entry ${entry.sys.id} published.`))

  } catch (err) {
    if (err.name === 'VersionMismatch' && env && true) {
      const entry = await env.getEntry(name)
      let fields = entry.fields
      fields = {
        ...fields,
        ...data
      }
      entry.fields = fields
      entry.update().then(entry => {
        console.log(`Type Person entry: ${entry.sys.id} updated`)
        entry.publish().then(entry => console.log(`Entry ${entry.sys.id} published.`))
      })
    }
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