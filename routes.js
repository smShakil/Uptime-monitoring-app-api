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

const routes = {
  users: userHandler,
  sample: sampleHandler,
  'not-found': notFoundHandler,
}

module.exports = routes
