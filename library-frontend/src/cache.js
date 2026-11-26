import { ALL_BOOKS } from './queries'

// Añade un libro a las listas de libros que ya estén en la caché: la de todos los
// géneros y la de cada uno de sus géneros. Si ya estaba (mismo id), no lo repite.
export const addBookToCache = (cache, addedBook) => {
  const genres = [null, ...addedBook.genres]

  genres.forEach((genre) => {
    cache.updateQuery({ query: ALL_BOOKS, variables: { genre } }, (data) => {
      if (!data) {
        return data
      }
      if (data.allBooks.some((b) => b.id === addedBook.id)) {
        return data
      }
      return { allBooks: data.allBooks.concat(addedBook) }
    })
  })
}
