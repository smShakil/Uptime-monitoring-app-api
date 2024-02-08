/*
 * Title: Sample handler
 * Description: Sample handler
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Module scaffolding
const handler = {}

handler.notFoundHandler = ({ callback }) => {
  callback(404, {
    error: 'Your requested URL was not found!',
  })
}

module.exports = handler
