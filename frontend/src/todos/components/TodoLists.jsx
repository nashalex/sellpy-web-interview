import React, { Fragment, useState, useEffect, useReducer, useRef } from 'react'
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { TodoListForm } from './TodoListForm'

const SERVER_URL = 'http://localhost:3001'

// The reducer that handles all update logic related to `todoLists`.
const todoListReducer = (todoLists, action) => {
  // Handle the special case of receiving all todo lists from the server.
  if (action.type === 'getFromServer') {
    return action.todoLists
  }

  const oldTodos = todoLists[action.listId].todos
  const index = action.index
  let newTodos

  switch (action.type) {
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
      .then((todoLists) => dispatchTodoLists({ type: 'getFromServer', todoLists }))
  }, [])

  // Send updated Todo's to the server.
  {
    // Minimum amount of time that must pass between 'POST' requests, so that we can implement
    // autosave functionality without spamming the server each time a new letter is added to a note.
    const POST_TIMEOUT_DURATION = 150

    // Stores a timer for each listId. When the timer expires, a POST request gets sent to the backend.
    // Each timer lasts `POST_TIMEOUT_DURATION` milliseconds, and will restart if another update occurs within that time.
    let requestTimers = useRef({})

    // Queue update requests whenever a Todolist is modified.
    useEffect(() => {
      // No lists or no active list? Bail.
      if (!Object.keys(todoLists).length || !activeListId) {
        return
      }
      const timers = requestTimers.current
      // Make it explicit that the callback should use the value of `activeListId` for the current frame
      const listId = activeListId

      clearTimeout(timers[listId])
      // Start the timer for the current `listId`
      timers[listId] = setTimeout(() => {
        fetch(SERVER_URL, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'setTodos',
            listId,
            todos: todoLists[listId].todos,
          }),
        })
      }, POST_TIMEOUT_DURATION)
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
                <ListItemText primary={todoLists[listId].title} />
              </ListItemButton>
            ))}
          </List>
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
