require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000

const getCurrentUser = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }
  try {
    const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
    return await User.findById(decodedToken.id)
  } catch {
    return null
  }
}

const start = async () => {
  console.log('connecting to', MONGODB_URI)
  await mongoose.connect(MONGODB_URI)
  console.log('connected to MongoDB')

  const server = new ApolloServer({ typeDefs, resolvers })

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => ({
      currentUser: await getCurrentUser(req.headers.authorization),
    }),
  })
  console.log(`Server ready at ${url}`)
}

start()
