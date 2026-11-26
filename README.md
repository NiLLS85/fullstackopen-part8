# Full Stack Open, parte 8: GraphQL

Ejercicios de la parte 8 (GraphQL) del curso [Full Stack Open](https://fullstackopen.com/) de la Universidad de Helsinki, que ahora se hace en [MOOC.fi](https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql).

Es una pequeña biblioteca: un servidor GraphQL con Apollo Server y MongoDB, y un frontend en React con Apollo Client.

| Carpeta | Contenido |
|---|---|
| `library-backend` | Servidor GraphQL: Apollo Server 5 sobre Express, Mongoose, login con JWT y suscripciones por WebSocket |
| `library-frontend` | Frontend en React (Vite) con Apollo Client 4 |
| `tests-chapter4` | Pruebas automáticas del backend (del repositorio base del curso) |
| `tests-chapter5` | Pruebas E2E con Playwright (del repositorio base del curso) |
| `.github/workflows` | GitHub Actions que pasan las dos baterías de pruebas en cada push |

## Cómo arrancarlo

Hace falta un MongoDB. En local basta con Docker:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7

cd library-backend
cp .env.example .env     # MONGODB_URI, JWT_SECRET y PORT
npm install
npm run seed             # carga los autores y libros del enunciado
npm run dev              # http://localhost:4000 (también WebSocket para las suscripciones)

cd ../library-frontend
npm install
npm run dev              # http://localhost:5173
```

Para entrar hay que crear antes un usuario con la mutación `createUser`. Como en el material del curso, la contraseña de todos es `secret`.

## Capítulo 2: servidor GraphQL (8.1 a 8.7)

Datos en memoria. Consultas `bookCount`, `authorCount`, `allBooks` (con filtros opcionales `author` y `genre`, que se pueden combinar) y `allAuthors` con el número de libros de cada autor. Mutaciones `addBook` (si el autor no existe, se crea) y `editAuthor` para poner el año de nacimiento.

## Capítulo 3: React y GraphQL (8.8 a 8.12)

Vistas de autores y de libros con `useQuery`, formulario para añadir libros con `useMutation` (las listas se vuelven a pedir después) y formulario para el año de nacimiento con un `select` de los autores que existen.

## Capítulo 4: base de datos y usuarios (8.13 a 8.16)

- El código se separa en `schema.js`, `resolvers.js` y `models/`, y los datos pasan a MongoDB. `npm run seed` carga los datos del enunciado.
- `allBooks` filtra por autor y por género en la base de datos; el autor de un libro es ahora un objeto.
- Los errores de validación de Mongoose (título o nombre demasiado cortos, duplicados) se devuelven como `GraphQLError` con un mensaje claro. El libro se valida antes de crear un autor nuevo, para no dejar autores sin libros.
- Usuarios: `createUser`, `login` (devuelve un token) y `me`. `addBook` y `editAuthor` solo funcionan con un token válido.

## Capítulo 5: login y caché (8.17 a 8.22)

- La lista de libros muestra el nombre del autor.
- Login en el frontend: el token se guarda en `localStorage` y se envía en cada petición. Con sesión, el menú muestra "add book", "recommend" y "logout"; el formulario del año solo se ve con sesión.
- Filtro por género con botones. El filtro lo hace el servidor (`allBooks(genre: ...)`), no React.
- "Recommend" muestra los libros del género favorito del usuario (`me`).
- Caché al día: al añadir un libro se mete en las listas de la caché de todos los géneros que tiene, y las consultas por género usan `cache-and-network`, así que al pulsar un género la lista se vuelve a pedir.

## Capítulo 6: fragmentos y suscripciones (8.23 a 8.26)

- Fragmento `BookDetails` para no repetir los campos de un libro.
- Servidor: Express más un servidor WebSocket (`graphql-ws`) y la suscripción `bookAdded`, que se publica al añadir un libro.
- Cliente: las suscripciones van por WebSocket. Cuando llega un libro nuevo se añade a la caché sin repetirlo, así que la lista se actualiza en todas las pestañas abiertas, y se muestra un aviso si el libro lo ha añadido otra persona u otra pestaña.
- Problema n+1: `allAuthors` cuenta los libros de todos los autores con una sola agregación de MongoDB, en lugar de una consulta por autor.

## Pruebas automáticas

La versión del curso en MOOC.fi trae un repositorio base ([fs-graphql](https://github.com/fullstack-hy2020/fs-graphql)) con dos carpetas de pruebas, que se copiaron tal cual. Las dos usan una base de datos MongoDB en memoria, así que no tocan la base de datos normal.

```bash
# Backend (capítulo 4): consultas y mutaciones con node --test
cd tests-chapter4 && npm install && npm test

# E2E (capítulo 5): arrancan solos el backend en modo test y el frontend
cd tests-chapter5 && npm install && npx playwright install chromium && npx playwright test
```

Para las pruebas E2E el backend tiene la mutación `_resetDatabase`, que vacía la base de datos y solo funciona con `NODE_ENV=test`. Los campos de los formularios llevan etiquetas (`title`, `author`, `published`, `genre`, `username`, `password`, `born`) para que Playwright los encuentre. En `tests-chapter5` se subió `@playwright/test` a la 1.65, porque las versiones anteriores no instalan el navegador en el runner actual de GitHub.

## Uso de IA

Estos ejercicios se hicieron con ayuda de un asistente de IA (Claude, de Anthropic), bajo mi dirección. El asistente escribió la mayor parte del código y lo comprobó con un MongoDB en Docker y con Playwright.
