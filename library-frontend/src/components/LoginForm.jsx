import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setError, onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login] = useMutation(LOGIN)

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      const result = await login({ variables: { username, password } })
      const token = result.data.login.value
      localStorage.setItem('library-user-token', token)
      setToken(token)
      setUsername('')
      setPassword('')
      onLogin()
    } catch (error) {
      setError(`login failed: ${error.message}`)
    }
  }

  return (
    <div>
      <h2>login</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            username
            <input value={username} onChange={({ target }) => setUsername(target.value)} />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
