/*
 * Title: Handle Request Response
 * Description: Handle Request & Response from API
 * Author: S.M. Shakil
 * Date: 31/01/2024
 */

// Dependencies
const { URL } = require('node:url')
const { StringDecoder } = require('node:string_decoder')
const { parseJSON } = require('../helpers/utilities')
const routes = require('../routes')

// Module scaffolding
const handler = {}

const decoder = new StringDecoder('utf-8')
handler.handleRequest = ({ protocol, port, host, req, res }) => {
  const fullUrl = `${protocol}://${host}:${port}${req.url}`
  const pathObj = new URL(fullUrl)
  const trimmedPath = pathObj?.pathname.replace(/^\/+|\/+$/g, '')
  const queryObj = pathObj.searchParams
  const method = req.method.toLowerCase()
  const headerObj = req.headers
  const requestProps = {
    fullUrl,
    path: trimmedPath,
    queryObj,
    method,
    headerObj,
  }

  const choosenHandler = routes[trimmedPath] || routes['not-found']

  let data = ''
  req.on('data', (buffer) => {
    data += decoder.write(buffer)
  })
  req.on('end', () => {
    data += decoder.end()
    choosenHandler({
      props: requestProps,
      body: data ? parseJSON(data) : {},
      callback: (statusCode, payload) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 500
        payload = typeof payload === 'object' ? payload : {}

        const payloadString = JSON.stringify(payload)

        res.setHeader('Content-Type', 'application/json')
        res.writeHeader(statusCode)
        res.end(payloadString)
      },
    })
  })
}

module.exports = handler
