import React from 'react'
import { TextField, Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

export const TodoListForm = ({ todoList, updateTodos }) => {
  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{todoList.title}</Typography>
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {todoList.todos.map(({ text, done }, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ margin: '8px' }} variant='h6'>
                {index + 1}
              </Typography>
              <TextField
                sx={{ flexGrow: 1, marginTop: '1rem' }}
                label='What to do?'
                value={text}
                onChange={(event) => {
                  updateTodos({
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
                  updateTodos({
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
                  updateTodos({
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
                updateTodos({
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
