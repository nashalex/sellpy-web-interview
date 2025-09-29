import React, { Fragment, useState, useEffect, useReducer, useRef } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { TodoListForm } from './TodoListForm'

const SERVER_URL = 'http://localhost:3001'

const nextTodoListId = (todoLists) => {
  const keys = Object.keys(todoLists)
  let maxId = 0
  if (keys.length > 0) {
    maxId = Math.max(...keys)
  }
  console.log(`keys = ${JSON.stringify(keys)}. maxId = ${maxId}`)
  return String(maxId + 1).padStart(10, '0')
}

// The reducer that handles all update logic related to `todoLists`.
const todoListReducer = (todoLists, action) => {
  // Handle the special case of receiving all todo lists from the server.
  if (action.type === 'getFromServer') {
    return action.todoLists
  }

  const oldTodos = todoLists[action.listId]?.todos
  const index = action.index
  let newTodos

  switch (action.type) {
    // TodoList related updates
    // These return early.
    case 'createTodoList': {
      const id = nextTodoListId(todoLists)
      const newList = {
        id,
        title: '',
        todos: [{ text: '', done: false }],
      }
      return { ...todoLists, [id]: newList }
    }
    case 'setTodoListTitle': {
      const { title, listId } = action
      const oldList = todoLists[listId]
      return { ...todoLists, [listId]: { ...oldList, title } }
    }
    case 'deleteTodoList': {
      const newLists = { ...todoLists }
      delete newLists[action.listId]
      return newLists
    }

    // Todo related updated
    // These set `newTodos` and `break`
    case 'createTodo': {
      newTodos = [...oldTodos, { text: '', done: false }]
      break
    }
    case 'deleteTodo': {
      newTodos = [...oldTodos.slice(0, index), ...oldTodos.slice(index + 1)]
      break
    }
    case 'setTodoDate': {
      newTodos = [...oldTodos]
      newTodos[index].date = action.date
      break
    }
    case 'setTodoDone': {
      newTodos = [...oldTodos]
      newTodos[index].done = action.done
      break
    }
    case 'setTodoText': {
      newTodos = [...oldTodos]
      newTodos[index].text = action.text
      break
    }

    default:
      throw new Error(`Invalid action.type given to todoListReducer: ${action.type}`)
  }

  const newTodoLists = { ...todoLists }
  newTodoLists[action.listId].todos = newTodos

  return newTodoLists
}

// Returns true if every todo item in a list is `done`, and false otherwise.
const isTodoListDone = (todoList) => {
  return todoList.todos.every((todo) => todo.done)
}

export const TodoLists = ({ style }) => {
  const [activeListId, setActiveListId] = useState()
  const [todoLists, dispatchTodoLists] = useReducer(todoListReducer, {})

  // Update the active lists from the server
  useEffect(() => {
    fetch(SERVER_URL)
      .then((serializedTodoLists) => serializedTodoLists.json())
      .then((todoLists) => {
        // If the server is empty, make a new todo list.
        // Otherwise, update the todoLists to reflect the values stored in the server.
        if (Object.keys(todoLists).length === 0) {
          dispatchTodoLists({ type: 'createTodoList' })
        } else {
          dispatchTodoLists({ type: 'getFromServer', todoLists })
        }
      })
  }, [])

  {
    const postTimer = useRef()
    useEffect(() => {
      // Only send the todos if we have todos to send, and we have an active list.
      if (!activeListId || Object.keys(todoLists).length === 0) {
        return
      }
      if (postTimer.current) {
        clearTimeout(postTimer.current)
      }
      postTimer.current = setTimeout(() => {
        fetch(SERVER_URL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'setTodoLists',
            todoLists: todoLists,
          }),
        })
      }, 150)

      // NOTE: This is also sending an update request whenever the `activeListId` changes, which is probably unnecessary.
      // Maybe a better solution exists, but this seems fine for now. Revisit later if necessary.
    }, [activeListId, todoLists])
  }

  if (!Object.keys(todoLists).length) return null
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <List>
            {Object.keys(todoLists).map((listId) => (
              <ListItemButton key={listId} onClick={() => setActiveListId(listId)}>
                <ListItemIcon sx={{ minWidth: '35px' }}>
                  <ReceiptIcon />
                </ListItemIcon>
                {/* Show a check icon if all items in this list are done. */}
                <ListItemIcon sx={{ minWidth: '35px' }}>
                  {isTodoListDone(todoLists[listId]) && <CheckIcon />}
                </ListItemIcon>
                <TextField
                  sx={{ flexGrow: 1 }}
                  label='Title'
                  value={todoLists[listId].title}
                  onChange={(event) => {
                    dispatchTodoLists({
                      type: 'setTodoListTitle',
                      listId,
                      title: event.target.value,
                    })
                  }}
                />
                <Button
                  size='small'
                  color='secondary'
                  onClick={() => {
                    dispatchTodoLists({
                      type: 'deleteTodoList',
                      listId,
                    })
                    if (listId === activeListId) {
                      setActiveListId(null)
                    }
                  }}
                >
                  <DeleteIcon />
                </Button>
              </ListItemButton>
            ))}
          </List>
          <CardActions>
            <Button
              type='button'
              color='primary'
              onClick={() => {
                dispatchTodoLists({
                  type: 'createTodoList',
                })
                setActiveListId(nextTodoListId(todoLists))
              }}
            >
              Add List <AddIcon />
            </Button>
          </CardActions>
        </CardContent>
      </Card>
      {todoLists[activeListId] && (
        <TodoListForm
          key={activeListId} // use key to make React recreate component to reset internal state
          todoList={todoLists[activeListId]}
          dispatchTodoLists={dispatchTodoLists}
        />
      )}
    </Fragment>
  )
}
