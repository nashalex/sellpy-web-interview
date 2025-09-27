import React, { Fragment, useState, useEffect, useReducer, useMemo } from 'react'
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

const todoListReducer = (todoLists, action) => {
  /// handle the special case of receiving all todos from the server
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
    case 'delete': {
      newTodos = [...oldTodos.slice(0, index), ...oldTodos.slice(index + 1)]
      break
    }
    case 'setDate': {
      newTodos = [...oldTodos]
      newTodos[index].date = action.date
      break
    }
    case 'setDone': {
      newTodos = [...oldTodos]
      newTodos[index].done = action.done
      break
    }
    case 'setText': {
      newTodos = [...oldTodos]
      newTodos[index].text = action.text
      break
    }

    default:
      throw new Error('TODO')
  }

  const newTodoLists = { ...todoLists }
  newTodoLists[action.listId].todos = newTodos
  fetch('http://localhost:3001', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'setTodos',
      listId: action.listId,
      todos: newTodos,
    }),
  })

  return newTodoLists
}

export const TodoLists = ({ style }) => {
  // const [todoLists, setTodoLists] = useState({})
  const [activeListId, setActiveListId] = useState()
  const [todoLists, dispatchTodoLists] = useReducer(todoListReducer, {})

  // Current implementation is not great, since it gets recomputed for all lists whenever anything gets updated.
  // But the performance overhead from this is negligible unless there are lots of lists with many finished items.
  const finishedLists = useMemo(() => {
    const out = {}
    for (const listId in todoLists) {
      out[listId] = todoLists[listId].todos.every((todo) => todo.done)
    }
    return out
  }, [todoLists])
  console.log(`finishedLists: ${JSON.stringify(finishedLists)}`)

  // Update the active lists from the server
  useEffect(() => {
    fetch('http://localhost:3001')
      .then((todoLists) => todoLists.json())
      .then((todoLists) => dispatchTodoLists({ type: 'getFromServer', todoLists }))
  }, [])

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
                {finishedLists[listId] && <CheckIcon />}
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
