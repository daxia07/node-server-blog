const contentful = require('contentful-management')


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
    entry = await env.createEntry('person', { fields: data })
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


// article CRUD

const createOrUpdateArticle = async (article, loc = "en-US", env_id = "master") => {
  let artEnt, appendData = {}
  const { authorName, id, userId, ...rest } = article
  if (typeof authorName === 'undefined' || typeof userId === 'undefined') {
    throw new Error(`please provide author info`)
  } 
  const space = await getClient().getSpace(process.env.CONT_SPACE_ID)
  const env = await space.getEnvironment(env_id)
  const user = await env.getEntry(userId)
  if (!user) {
    throw new Error('user not defined!')
  }
  if (typeof id !== 'undefined') {
    artEnt = await env.getEntry(id)
  } else {
    artEnt = await env.createEntry('blogPost', {})
    appendData = {
      author: {
        [loc]: {
          sys: {
            id: user.sys.id,
            linkType: "Entry",
            type: "Link"
          }
        }
      },
      publishDate: {
        [loc]: new Date().toISOString()
      }
    }
  }
  const name = user.fields.name[loc] 
  if (name !== authorName) {
    throw new Error(`unauthorized author for blog ${id}`)
  }
  // deal with asset
  if (Object.keys(article).includes('heroImage')) {
    const fileEx = article.heroImage.slice(article.heroImage.lastIndexOf('.') + 1)
    const meta = {
      description: `heroImage for article ${artEnt.sys.id}`,
      title: `image title for ${artEnt.sys.id}`,
      file: {
        contentType: `image/${fileEx}`,
        fileName: `heroImage.${fileEx}`,
        upload: article.heroImage
      }
    }
    const newImage = await env.createAsset({
      fields: formatData(meta)
    })
    let newAsset = await env.createAsset(newImage)
    newAsset = await newAsset.processForLocale(loc)
    await newAsset.publish()
    artEnt.fields.heroImage = {
      [loc]: {
        "sys": {
          "type": "Link",
          "linkType": "Asset",
          "id": newAsset.sys.id
        }
      }
    }
    delete rest.heroImage
  }

  let data = formatData(rest, loc)
  data = {
    ...artEnt.fields,
    ...data,
    ...appendData
  }
  artEnt.fields = data
  artEnt = await artEnt.update()
  if (!artEnt.fields.draft[loc]) {
    artEnt = await artEnt.publish()
  }
  return artEnt
  
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
  // const mockProfile = {
  //   "fullName": "Mingxia Li",
  //   "shortBio": "aaaaaaaaaaaaaaaaaaaaaa",
  //   "socialLink": "",
  //   "userName": "uuuuuu"
  // }
  // createOrUpdateProfile(mockProfile)
  const mockArticle = {
    authorName: "uuuuuuu1uuu", // should equal to fields.author[loc].sys.id
    // id: "6CTZL6hWc6GfMXCOeU9NK9", // only when update, generated automatically on create
    userId: "48oSuihma1l4U2ydjknXmT", // test field, to modify user id
    body: "##TEST ", //md plain text
    category: "development", //only allowed text
    description: "this is a test blog", // plain text
    draft: false, // if false publish
    // publish date and update date
    heroImage: 'https://images2.minutemediacdn.com/image/upload/c_crop,h_1193,w_2121,x_0,y_64/f_auto,q_auto,w_1100/v1565279671/shape/mentalfloss/578211-gettyimages-542930526.jpg', //should choose between upload or link
    tags: ['a', 'b'],
    title: 'test blog',
  }
  createOrUpdateArticle(mockArticle)
    .then(console.log)
    .catch(err => {
      console.error(err)
    })
}