import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import Notify from './components/Notify'
import { BOOK_ADDED } from './queries'
import { addBookToCache } from './cache'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() => localStorage.getItem('library-user-token'))
  const [notification, setNotification] = useState(null)
  const client = useApolloClient()

  const notify = (message, type = 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Aviso y caché al día cuando el servidor anuncia un libro nuevo (8.24 y 8.25),
  // también si lo ha añadido otra persona u otra pestaña
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      notify(`New book added: ${addedBook.title} by ${addedBook.author.name}`, 'info')
      addBookToCache(client.cache, addedBook)
    },
  })

  const logout = () => {
    setToken(null)
    localStorage.removeItem('library-user-token')
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Notify notification={notification} />

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} setError={notify} />

      <Recommend show={page === 'recommend'} />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setError={notify}
        onLogin={() => setPage('books')}
      />
    </div>
  )
}

export default App
