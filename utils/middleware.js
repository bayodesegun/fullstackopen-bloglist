const morgan = require('morgan')
const logger = require('./logger')

const requestLogger = (request, response) => {
  morgan.token('data', (req, res) => (req.method === 'POST' ? JSON.stringify({...req.body, password: undefined}) : ''))
  return morgan(':method :url :status :res[content-length] - :response-time ms :data')
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'SyntaxError') {
    return response.status(400).json({ error: 'Malformed request' })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired'})
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}