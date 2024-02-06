/*
 * Title: Sample handler
 * Description: Sample handler
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Module scaffolding
const handler = {}

handler.notFoundhandler = ({ callback }) => {
  callback(404, {
    message: 'Your requested URL was not found!',
  })
}

module.exports = handler
