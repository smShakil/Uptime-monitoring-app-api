/*
 * Title: Routes
 * Description: All app routes
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler')
const { notFoundhandler } = require('./handlers/routeHandlers/notFoundHandler')

const routes = {
  sample: sampleHandler,
  'not-found': notFoundhandler,
}

module.exports = routes
