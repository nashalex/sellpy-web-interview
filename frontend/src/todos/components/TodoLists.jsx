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
  /// special case
  if (action.type === 'getFromServer') {
    console.log(`got todolists from server: ${JSON.stringify(action.todoLists)}`)
    return action.todoLists
  }

  const oldTodos = todoLists[action.listId].todos
  const index = action.index
  console.log(`action: ${JSON.stringify(action)}`)
  console.log(`oldTodos: ${JSON.stringify(oldTodos)}`)
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
  console.log(`updated todolists to ${newTodoLists}`)
  console.log('-------------------DONE UPDATING------------------\n')
  fetch(
    'http://localhost:3001?' +
      new URLSearchParams({
        type: 'setTodos',
        listId: action.listId,
        todos: JSON.stringify(newTodos),
      })
  )
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
    fetch('http://localhost:3001?type=getLists')
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
