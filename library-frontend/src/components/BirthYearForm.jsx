import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EDIT_AUTHOR } from '../queries'

// Cambiar el año de nacimiento eligiendo un autor que ya existe (8.11 y 8.12)
const BirthYearForm = ({ authors }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR)

  const submit = async (event) => {
    event.preventDefault()
    // La consulta de autores se actualiza sola: Apollo guarda el autor por su id
    await editAuthor({ variables: { name, setBornTo: Number(born) } })
    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value="" disabled>
              select author
            </option>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit" disabled={!name || !born}>
          update author
        </button>
      </form>
    </div>
  )
}

export default BirthYearForm
