import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'
import BookTable from './BookTable'

// Libros del género favorito del usuario que ha entrado (8.20)
const Recommend = ({ show }) => {
  const meResult = useQuery(ME, { skip: !show })
  const favoriteGenre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    fetchPolicy: 'cache-and-network',
    skip: !show || !favoriteGenre,
  })

  if (!show) {
    return null
  }
  if (!booksResult.data) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>
      <BookTable books={booksResult.data.allBooks} />
    </div>
  )
}

export default Recommend
