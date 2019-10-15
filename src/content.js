const contentful = require('contentful-management')

const client = contentful.createClient({
  accessToken: process.env.CON_KEY
})

const myCat = ["About", "Person", "Blog Post"]


const getAllTypes = async () => {
  try {
    const space = await client.getSpace(process.env.CONT_SPACE_ID)
    const res = await space.getContentTypes()
    return res.items.map((ele, index) => ele.sys.id)
  } catch (err) {
    console.log(err)
    throw err
  }
}




const toDelete = ["course"]

let mySpace




// client.getSpace(process.env.CONT_SPACE_ID)
//   .then((space) => space.getContentType('course'))
//   .then((contentType) => {
//     console.log(contentType)
//     contentType.unpublish()
//       .then(contentType => contentType.delete())
//   })
//   .then(() => console.log('Content type deleted.'))
//   .catch(console.error)


module.exports.getAllTypes = getAllTypes
  
if (process.env.NODE_ENV === 'DEBUG') {
  getAllTypes()
    .then(res => console.log(res))
  
  // client.getSpace(process.env.CONT_SPACE_ID)
  // .then(space => space.getContentTypes()
  // )
  // .then(response => {
  //   console.log(response.items)
  //   response.items.forEach(ele => {
  //     if (!myCat.includes(ele.name)) {
  //       console.log(ele.sys.id)
  //       toDelete.push(ele)
  //     }
  //   })
  // })
  //   .catch(console.error)
  
  
}

