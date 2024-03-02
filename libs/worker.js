/*
 * Title: Worker
 * Description: Worker which checks all the monitors & verify the status
 * Author: S.M. Shakil
 * Date: 01/03/2024
 */

// Dependencies
const nodeFS = require('node:fs')
const { URL } = require('node:url')
const http = require('node:http')
const https = require('node:https')
const fs = require('fs-extra')
const validator = require('chainable-simple-validator')

// Module scaffolding
const worker = {}

// Configuration
worker.config = {
  dir: `${__dirname}/../.data/monitors`,
  checkInterval: 1000 * 60,
  acceptedStatus: ['up', 'down'],
}

worker.processMonitorOutcome = (userData, outcome) => {
  const status =
    !outcome.error && userData.successCodes.includes(outcome.responseCode) ? 'up' : 'down'
  const payload = {
    ...userData,
    status,
    lastChecked: Date.now(),
  }
  // Update the monitor file with check status
  fs.writeJson(`${worker.config.dir}/${userData.id}.json`, payload, (err) => {
    if (err) console.log('Error: updating monitor data of', userData.id)
    else console.log(`Status of ${userData.url} for user ${userData.phone} is: ${status}`)
  })
}

worker.performMonitoring = (data) => {
  const parsedUrl = new URL(data.url)
  let outcomeSent = false
  const mointorOutcome = {
    error: false,
    responseCode: false,
  }
  const payload = {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    method: data.method.toUpperCase(),
    path: parsedUrl.pathname + parsedUrl.search,
    timeout: data.timeoutInSeconds * 1000,
  }
  const protocols = {
    http,
    https,
  }
  const req = protocols[parsedUrl.protocol.replace(':', '')].request(payload, (res) => {
    if (!outcomeSent) {
      mointorOutcome.responseCode = res.statusCode
      mointorOutcome.error = false
      outcomeSent = true
      worker.processMonitorOutcome(data, mointorOutcome)
    }
  })
  req.on('clientError', (err) => {
    if (!outcomeSent) {
      mointorOutcome.error = err
      outcomeSent = true
      worker.processMonitorOutcome(data, mointorOutcome)
    }
  })
  req.on('timeout', () => {
    if (!outcomeSent) {
      mointorOutcome.error = 'timeout'
      outcomeSent = true
      worker.processMonitorOutcome(data, mointorOutcome)
    }
  })
  req.end()
}

worker.validateMonitorData = (payload) => {
  const data = { ...payload }
  const { errors: idErrors } = validator(data.id).type('string')
  const { errors: statusErrors } = validator(data.status)
    .nullable()
    .type('string')
    .custom((el) => worker.config.acceptedStatus.includes(el.toLowerCase()), 'Status not accepted')
  const { errors: lcErrors } = validator(data.lastChecked)
    .type('number')
    .custom((el) => el > 0, 'Check time not valid')

  if (!idErrors?.length) {
    if (statusErrors?.length) data.status = 'down'
    if (lcErrors?.length) data.lastChecked = false
    if (!data.url.startsWith('http')) data.url = `http://${data.url}`
    worker.performMonitoring(data)
  } else console.log('Error: monitor data is not valid')
}

worker.readMonitors = (files) => {
  files.forEach((file) => {
    fs.readJson(`${worker.config.dir}/${file}`, (err, data) => {
      if (!err) {
        worker.validateMonitorData(data)
      } else {
        console.log('Error reading one of the monitors', err)
      }
    })
  })
}

worker.gatherAllMonitors = () => {
  nodeFS.readdir(worker.config.dir, (err, files) => {
    if (!err) {
      if (files?.length) {
        worker.readMonitors(files)
      } else {
        console.log('No monitors found to check uptime')
      }
    } else {
      console.log('Error reading monitors directory', err)
    }
  })
}

worker.loop = () => {
  setInterval(() => {
    worker.gatherAllMonitors()
  }, worker.config.checkInterval)
}

worker.startWorker = () => {
  worker.gatherAllMonitors()
  worker.loop()
}

module.exports = worker
