import React, { Fragment, useState, useEffect } from 'react'
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

const fetchTodoLists = () => fetch('http://localhost:3001?type=get').then((todos) => todos.json())

export const TodoLists = ({ style }) => {
  const [todoLists, setTodoLists] = useState({})
  const [activeList, setActiveList] = useState()
  const [finishedLists, setFinishedLists] = useState({})

  useEffect(() => {
    fetchTodoLists().then((todos) => {
      setTodoLists(todos)
      setFinishedLists(Object.keys(todos).map((id) => todos[id].todos.every(({ done }) => done)))
    })
  }, [])

  if (!Object.keys(todoLists).length) return null
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <List>
            {Object.keys(todoLists).map((key) => (
              <ListItemButton key={key} onClick={() => setActiveList(key)}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary={todoLists[key].title} />
                {finishedLists[key] && <CheckIcon />}
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>
      {todoLists[activeList] && (
        <TodoListForm
          key={activeList} // use key to make React recreate component to reset internal state
          todoList={todoLists[activeList]}
          doneItemsUpdated={(listId, allDone) =>
            setFinishedLists({ ...finishedLists, [listId]: allDone })
          }
          saveTodoList={(id, { todos }) => {
            const listToUpdate = todoLists[id]
            setTodoLists({
              ...todoLists,
              [id]: { ...listToUpdate, todos },
            })
          }}
        />
      )}
    </Fragment>
  )
}
