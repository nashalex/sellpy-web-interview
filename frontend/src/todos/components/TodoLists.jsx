import React, { Fragment, useState, useEffect, useReducer } from 'react'
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

// The reducer that handles all update logic related to `todoLists`.
const todoListReducer = (todoLists, action) => {
  /// handle the special case of receiving all todos from the server
  if (action.type === 'getFromServer') {
    return action.todoLists
  }

  const oldTodos = todoLists[action.listId].todos
  const index = action.index
  let newTodos

  // It is a bit redundant for every `action.type` to have `Todo` in the name, but
  // this was done for (theoretical) forwards-compatibility reasons.
  // The reasoning is that this reducer is responsible for updating the entire
  // `todoLists` object, and in the future it might (theoretically) be desirable to add `action.type`s
  // not related to the `todos` field.
  // (e.g. creating a TodoList via a 'createList' action)
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

// Helper function that returns true if every todo item in a list is `done`, and false otherwise.
const isTodoListDone = (todoList) => todoList.todos.every((todo) => todo.done)

export const TodoLists = ({ style }) => {
  const [activeListId, setActiveListId] = useState()
  // Using a reducer makes it easier to remove state related logic from the `TodoListForm` component.
  const [todoLists, dispatchTodoLists] = useReducer(todoListReducer, {})

  // Update the active lists from the server
  useEffect(() => {
    fetch('http://localhost:3001')
      .then((todoLists) => todoLists.json())
      .then((todoLists) => dispatchTodoLists({ type: 'getFromServer', todoLists }))
  }, [])

  // Send updated todo's to the server.
  // Note: This only updates `todoLists[activeListId]`, in order to cut down on the size of the HTTP requests.
  // (Because only the active list can be updated anyways.)
  useEffect(() => {
    // Only send the todos if we have todos to send, and we have an active list.
    if (!activeListId || Object.keys(todoLists).length === 0) {
      return
    }
    fetch('http://localhost:3001', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'setTodos',
        listId: activeListId,
        todos: todoLists[activeListId].todos,
      }),
    })
    // TODO: This is also sending an update request whenever the `activeListId` changes, which is probably unnecessary.
    // Maybe a better solution exists, but this seems fine for now.
    // Revisit later if necessary.
  }, [activeListId, todoLists])

  if (!Object.keys(todoLists).length) return null
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <List>
            {Object.keys(todoLists).map((listId) => (
              <ListItemButton key={listId} onClick={() => setActiveListId(listId)}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary={todoLists[listId].title} />
                {/* Render a check icon if all items in this list are done */}
                {isTodoListDone(todoLists[listId]) && <CheckIcon />}
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>
      {todoLists[activeListId] && (
        <TodoListForm
          key={activeListId} // use key to make React recreate component to reset internal state
          todoList={todoLists[activeListId]}
          updateTodos={dispatchTodoLists}
        />
      )}
    </Fragment>
  )
}
