import express from 'express'
import cors from 'cors'

let todoLists = {}

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001
app.get('/', (_req, res) => {
  res.send(todoLists)
})

app.post('/', (req, res) => {
  const body = req.body
  if (body.type === 'setTodoLists') {
    todoLists = body.todoLists
  }

  res.send()
})
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))
