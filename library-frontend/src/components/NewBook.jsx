import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ADD_BOOK, ALL_AUTHORS, ALL_GENRES } from '../queries'
import { addBookToCache } from '../cache'

const NewBook = ({ show, setError, onBookAdded }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    // Los autores y los géneros se vuelven a pedir; las listas de libros se actualizan en la caché
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_GENRES }],
    update: (cache, response) => {
      addBookToCache(cache, response.data.addBook)
    },
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    // Se apunta el título para no avisar de un libro que acaba de añadir este mismo usuario
    onBookAdded(title)
    try {
      await addBook({
        variables: { title, author, published: Number(published), genres },
      })
    } catch (error) {
      setError(error.message)
      return
    }

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        {/* Las etiquetas permiten que las pruebas E2E encuentren cada campo */}
        <div>
          <label>
            title
            <input value={title} onChange={({ target }) => setTitle(target.value)} />
          </label>
        </div>
        <div>
          <label>
            author
            <input value={author} onChange={({ target }) => setAuthor(target.value)} />
          </label>
        </div>
        <div>
          <label>
            published
            <input
              type="number"
              value={published}
              onChange={({ target }) => setPublished(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            genre
            <input value={genre} onChange={({ target }) => setGenre(target.value)} />
          </label>
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
