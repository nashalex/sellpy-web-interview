import express from 'express'
import cors from 'cors'

let todos = {
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
  if (req.query.type === 'get') {
    res.send(todos)
    return
  }
  // Which list is it?
  const list_id = req.query.list_id
  // Which item in the list is it?
  const index = parseInt(req.query.index)

  const list = todos[list_id]
  if (!list) {
    console.log(`ERROR: list ${list_id} does not exist!`)
    return
  }
  if (!list.todos[index]) {
    console.log(
      `DEBUG: list ${list_id} did not contain an item with index ${index}. creating it...`
    )
    list.todos[index] = { text: '', done: false }
  }
  const done = req.query.done === 'true'
  switch (req.query.type) {
    case 'set_text':
      list.todos[index].text = req.query.text
      console.log(`updating text:  "${list.todos[index].text}" => "${req.query.text}"`)

      break
    case 'set_done':
      todos[list_id].todos[index].done = done
      console.log(`marking "${list.todos[index].text}" as ${done ? 'done' : 'not done'}`)
      break
    default:
      console.log(`ERROR: Unsupported request type: ${req.params.type}`)
  }
})
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
