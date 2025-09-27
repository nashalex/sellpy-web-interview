import React, { useReducer } from 'react'
import { TextField, Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

export const TodoListForm = ({ todoList, saveTodoList, doneItemsUpdated = () => {} }) => {
  // const [todos, setTodos] = useState(todoList.todos)

  const todosReducer = (todos, action) => {
    let newTodos
    switch (action.type) {
      case 'createTodo': {
        newTodos = [...todos, { text: '', done: false }]
        break
      }
      case 'delete': {
        newTodos = [...todos.slice(0, action.index), ...todos.slice(action.index + 1)]
        break
      }
      case 'setDone': {
        newTodos = [...todos]
        newTodos[action.index].done = action.done
        const allDone = newTodos.every(({ done }) => done)
        doneItemsUpdated(action.listId, allDone)
        break
      }
      case 'setText': {
        newTodos = [...todos]
        newTodos[action.index].text = action.text
        break
      }

      default:
        throw new Error('TODO')
    }
    saveTodoList({ action, todos })
    fetch('http://localhost:3001?' + new URLSearchParams(action))
    return newTodos
  }
  const [todos, dispatchTodos] = useReducer(todosReducer, todoList.todos)

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{todoList.title}</Typography>
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {todos.map(({ text, done }, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ margin: '8px' }} variant='h6'>
                {index + 1}
              </Typography>
              <TextField
                sx={{ flexGrow: 1, marginTop: '1rem' }}
                label='What to do?'
                value={text}
                onChange={(event) => {
                  dispatchTodos({
                    type: 'setText',
                    listId: todoList.id,
                    index,
                    text: event.target.value,
                  })
                }}
              />
              <Button
                sx={{ margin: '8px' }}
                size='small'
                color='secondary'
                onClick={() => {
                  dispatchTodos({
                    type: 'setDone',
                    listId: todoList.id,
                    index,
                    done: !done,
                  })
                }}
              >
                {done ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              </Button>
              <Button
                sx={{ margin: '8px' }}
                size='small'
                color='secondary'
                onClick={() => {
                  dispatchTodos({
                    type: 'delete',
                    listId: todoList.id,
                    index,
                  })
                }}
              >
                <DeleteIcon />
              </Button>
            </div>
          ))}
          <CardActions>
            <Button
              type='button'
              color='primary'
              onClick={() => {
                console.log(`todos length: ${todos.length}`)
                dispatchTodos({
                  type: 'createTodo',
                  listId: todoList.id,
                })
              }}
            >
              Add Todo <AddIcon />
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  )
}
