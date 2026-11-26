require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const startServer = require('./server')

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000

const main = async () => {
  console.log('connecting to', MONGODB_URI)
  await mongoose.connect(MONGODB_URI)
  console.log('connected to MongoDB')

  startServer(PORT)
}

main()
