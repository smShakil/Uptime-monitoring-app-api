/*
 * Title: Server
 * Description: Manages server & port listening
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Dependencies
const http = require('node:http')
const { handleRequest } = require('../handlers/handleReqRes')
const { mode, protocol, host, port } = require('../environments')

// Module scaffolding
const server = {}

// Configuration
server.config = {}

server.createNodeServer = () => {
  const instance = http.createServer((req, res) =>
    handleRequest({ protocol, port, host, req, res }),
  )
  instance.listen(port, host, () => {
    console.log(`App is running in ${mode} mode by listening to port ${port} ...`)
  })
}

module.exports = server
