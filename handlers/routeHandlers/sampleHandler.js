/*
 * Title: Sample handler
 * Description: Sample handler
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */
const fs = require('fs-extra')

// Module scaffolding
const handler = {}

handler.sampleHandler = ({ callback }) => {
  const file = `${__dirname}/../../.data/demo.json`
  // fs.ensureFile(file, (err) => {
  //   console.log(err) // => null
  //   // file has now been created, including the directory it is to be placed in
  // })

  fs.writeJson(file, { name: 'fs-extra package' }, (err) => {
    if (err) return console.error(err)
    console.log('success!')
  })

  callback(200, {
    message: 'file has now been created in' + file,
  })
}

module.exports = handler
