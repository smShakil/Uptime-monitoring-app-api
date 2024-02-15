/*
 * Title: Routes
 * Description: All app routes
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler')
const { notFoundHandler } = require('./handlers/routeHandlers/notFoundHandler')
const { userHandler } = require('./handlers/routeHandlers/userHandler')
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler')

const routes = {
  users: userHandler,
  tokens: tokenHandler,
  sample: sampleHandler,
  'not-found': notFoundHandler,
}

module.exports = routes
