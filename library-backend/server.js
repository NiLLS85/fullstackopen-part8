const http = require('http')
const cors = require('cors')
const express = require('express')
const jwt = require('jsonwebtoken')
const { ApolloServer } = require('@apollo/server')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@as-integrations/express5')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

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

// Express sirve las consultas HTTP y un servidor WebSocket las suscripciones (8.23)
const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        currentUser: await getCurrentUser(req.headers.authorization),
      }),
    }),
  )

  httpServer.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}`)
  })
}

module.exports = startServer
