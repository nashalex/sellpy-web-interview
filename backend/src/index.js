import express from 'express'
import cors from 'cors'

let todos = {
  '0000000001': {
    id: '0000000001',
    title: 'First List',
    todos: ['First todo of first list!'],
  },
  '0000000002': {
    id: '0000000002',
    title: 'Second List',
    todos: ['First todo of second list!'],
  },
}

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001
app.get('/', (req, res) => {
  console.log(req.query)
  const list_idx = req.query.list_idx
  const todo_idx = req.query.todo_idx
  switch (req.query.type) {
    case 'get':
      res.send(todos)
      break
    case 'set_text':
      todos[list_idx].todos[todo_idx] = req.query.text
      console.log(`updated todos[${list_idx}][${todo_idx}] to ${todos[list_idx].todos[todo_idx]}`)
      break

    default:
      console.log(`ERROR: Unsupported request type: ${req.params.type}`)
  }
})
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
