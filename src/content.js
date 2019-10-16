const contentful = require('contentful-management')

const client = contentful.createClient({
  accessToken: process.env.CON_KEY
})


// Actions
const deleteAction = async (entity, filter = () => false)  => {
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
    const space = await client.getSpace(process.env.CONT_SPACE_ID)
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
    const space = await client.getSpace(process.env.CONT_SPACE_ID)
    const response = await space.getEntries()
    response.items.forEach((ele, index) => action(ele))
    return response.items
  } catch (err) {
    throw err
  }
}


module.exports = {
  getAllTypes,
  getAllEntries,
  deleteEntry: deleteAction
}
  
if (process.env.NODE_ENV === 'DEBUG') {
  // const myCat = ["about", "blogPost", "person"]
  // const action = ele => {
  //   deleteAction(ele, ele => !myCat.includes(ele.sys.id))
  // }
  // getAllTypes(action)
  //   .then(res => console.log('done'))
}

