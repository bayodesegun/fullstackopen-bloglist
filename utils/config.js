require('dotenv').config()

const {MONGO_URL, TEST_MONGO_URL, PORT} = process.env

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? TEST_MONGO_URL
  : MONGO_URL

module.exports = {MONGODB_URI, PORT}
