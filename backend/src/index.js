import express from 'express'
import cors from 'cors'

const todoLists = {
  '0000000001': {
    id: '0000000001',
    title: 'First List',
    todos: [{ text: 'First todo of first list!', done: false }],
  },
  '0000000002': {
    id: '0000000002',
    title: 'Second List',
    todos: [{ text: 'First todo of second list!', done: false }],
  },
}

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001
app.get('/', (_req, res) => {
  res.send(todoLists)
})

app.post('/', (req, res) => {
  const body = req.body
  if (body.type === 'setTodos') {
    todoLists[body.listId].todos = body.todos
  }

  res.send()
})
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))
