const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const requireUser = (currentUser) => {
  if (!currentUser) {
    throw new GraphQLError('not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
}

// Convierte un error de validación de Mongoose en un GraphQLError con un mensaje claro (8.15)
const runOrThrow = async (operation, invalidArgs) => {
  try {
    return await operation()
  } catch (error) {
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors).map((e) => e.message).join(', ')
      : error.code === 11000
        ? `${Object.keys(error.keyValue).join(', ')} must be unique`
        : error.message
    throw new GraphQLError(`Saving failed: ${message}`, {
      extensions: { code: 'BAD_USER_INPUT', invalidArgs, error },
    })
  }
}

const saveOrThrow = (doc, invalidArgs) => runOrThrow(() => doc.save(), invalidArgs)
const validateOrThrow = (doc, invalidArgs) => runOrThrow(() => doc.validate(), invalidArgs)

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }
      if (args.genre) {
        // En un array, { genres: 'x' } encuentra los libros cuyo array contiene 'x'
        filter.genres = args.genre
      }
      return Book.find(filter).populate('author')
    },
    allAuthors: async () => Author.find({}),
    allGenres: async () => Book.distinct('genres'),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      requireUser(currentUser)

      let author = await Author.findOne({ name: args.author })
      const isNewAuthor = !author
      if (isNewAuthor) {
        author = new Author({ name: args.author })
      }
      const book = new Book({ ...args, author: author._id })

      // Se valida el libro antes de guardar un autor nuevo, para no dejar autores sin libros
      await validateOrThrow(book, args.title)
      if (isNewAuthor) {
        await saveOrThrow(author, args.author)
      }
      await saveOrThrow(book, args.title)
      return book.populate('author')
    },
    editAuthor: async (root, args, { currentUser }) => {
      requireUser(currentUser)

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return saveOrThrow(author, args.setBornTo)
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return saveOrThrow(user, args.username)
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      // Como en el material del curso, todos los usuarios tienen la misma contraseña
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const userForToken = { username: user.username, id: user._id }
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
}

module.exports = resolvers
