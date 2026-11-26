import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import BookTable from './BookTable'

const Books = ({ show }) => {
  const [genre, setGenre] = useState(null)

  // El filtro por género lo hace el servidor (8.21). Con cache-and-network,
  // al pulsar un género se pide de nuevo la lista y sale al día (8.22)
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre },
    fetchPolicy: 'cache-and-network',
    skip: !show,
  })
  const genresResult = useQuery(ALL_GENRES, { skip: !show })

  if (!show) {
    return null
  }
  if (!booksResult.data || !genresResult.data) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <p>
          in genre <b>{genre}</b>
        </p>
      )}
      <BookTable books={booksResult.data.allBooks} />
      <div>
        {genresResult.data.allGenres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
