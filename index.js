/*
 * Title: App entry file
 * Description: Entry file for the Uptime Monitor App
 * Author: S.M. Shakil
 * Date: 04/01/2024
 */

// Dependencies
const { startServer } = require('./libs/server')
const { startWorker } = require('./libs/worker')

// Start server
startServer()
// Start worker
startWorker()
