/*
 * Title: Sample handler
 * Description: Sample handler
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Module scaffolding
const handler = {}

handler.sampleHandler = ({ callback }) => {
  callback(200, { message: 'This is a sample route' })
}

module.exports = handler
