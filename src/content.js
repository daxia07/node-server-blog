const contentful = require('contentful-management')

const client = contentful.createClient({
  accessToken: process.env.CON_KEY
})

const myCat = ["about", "blogPost", "person"]
const toDelete = []

// Actions
const deleteEntry = async (entry, filter)  => {
  try {
    if (filter(entry)) {
      const unpublishRes = await entry.unpublish()
      const deleteRes = await entry.delete()
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getAllTypes = async (action = () => {}) => {
  try {
    const space = await client.getSpace(process.env.CONT_SPACE_ID)
    const res = await space.getContentTypes()
    return res.items.forEach((ele, index) => action(ele))
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getAllEntries = async (action = ele => {}) => {
  try {
    const space = await client.getSpace(process.env.CONT_SPACE_ID)
    const response = await space.getEntries()
    response.items.forEach((ele, index) => {
      action(ele)
    })
    return response.items
  } catch (err) {
    throw err
  }
}



module.exports = {
  getAllTypes,
  getAllEntries,
  deleteEntry
}
  
if (process.env.NODE_ENV === 'DEBUG') {
  // getAllTypes(ele => console.log(ele.sys.id))
  //   .then(res => console.log(res))
  const action = ele => {
    deleteEntry(ele, ele => !myCat.includes(ele.sys.contentType.sys.id))
  }
  getAllEntries(action).then(res => console.log('done'))
}

