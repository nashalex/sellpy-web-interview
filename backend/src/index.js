import express from 'express'
import cors from 'cors'

let todoLists = {
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
app.get('/', (req, res) => {
  console.log(req.query)
  switch (req.query.type) {
    case 'get': {
      res.send(todoLists)
      break
    }
    case 'set': {
      const { listId, todos } = req.query
      todoLists[listId] = todos
      break
    }
    default:
      console.log(`ERROR: Unsupported request type: ${req.params.type}`)
  }
  return
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
