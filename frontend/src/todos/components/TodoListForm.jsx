import React from 'react'
import { TextField, Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import daysjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

daysjs.extend(relativeTime)

export const TodoListForm = ({ todoList, updateTodos }) => {
  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{todoList.title}</Typography>
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {todoList.todos.map((todo, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
              <Typography sx={{ margin: '8px' }} variant='h6'>
                {index + 1}
              </Typography>
              <Button
                size='small'
                color='secondary'
                onClick={() => {
                  updateTodos({
                    type: 'setDone',
                    listId: todoList.id,
                    index,
                    done: !todo.done,
                  })
                }}
              >
                {todo.done ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              </Button>
              <TextField
                sx={{ flexGrow: 1 }}
                label='What to do?'
                value={todo.text}
                onChange={(event) => {
                  updateTodos({
                    type: 'setText',
                    listId: todoList.id,
                    index,
                    text: event.target.value,
                  })
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={todo.date}
                  // Using IIFE because this is just display formatting logic
                  label={(() => {
                    const now = daysjs()
                    const date = todo.date ?? now
                    if (now.day === daysjs(date).day) {
                      return 'Date (due today)'
                    }
                    return `Date (due ${daysjs().to(date)})`
                  })()}
                  onChange={(date) => {
                    updateTodos({
                      type: 'setDate',
                      listId: todoList.id,
                      index,
                      date,
                    })
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <Button
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
