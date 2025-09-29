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

daysjs.extend(relativeTime, {
  // Make daysjs use strict thresholds
  // This is needed because, by default, daysjs switches to days after 22 hours, and months after 26 days
  // copied from https://day.js.org/docs/en/customization/relative-time
  thresholds: [
    { l: 's', r: 1 },
    { l: 'm', r: 1 },
    { l: 'mm', r: 59, d: 'minute' },
    { l: 'h', r: 1 },
    { l: 'hh', r: 23, d: 'hour' },
    { l: 'd', r: 1 },
    { l: 'dd', r: 29, d: 'day' },
    { l: 'M', r: 1 },
    { l: 'MM', r: 11, d: 'month' },
    { l: 'y', r: 1 },
    { l: 'yy', d: 'year' },
  ],
})
export const TodoListForm = ({ todoList, dispatchTodoLists }) => {
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
                  dispatchTodoLists({
                    type: 'setTodoDone',
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
                  dispatchTodoLists({
                    type: 'setTodoText',
                    listId: todoList.id,
                    index,
                    text: event.target.value,
                  })
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={todo.date || null}
                  // Using IIFE because this is just display formatting logic
                  label={(() => {
                    if (!todo.date) {
                      return 'Date'
                    }
                    const now = daysjs()
                    if (now.day() === daysjs(todo.date).day()) {
                      return 'Date (due today)'
                    }
                    return `Date (due ${now.to(todo.date)})`
                  })()}
                  onChange={(date) => {
                    dispatchTodoLists({
                      type: 'setTodoDate',
                      listId: todoList.id,
                      index,
                      date,
                    })
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <Button
                sx={{ margin: '8px' }}
                size='small'
                color='secondary'
                onClick={() => {
                  dispatchTodoLists({
                    type: 'deleteTodo',
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
                dispatchTodoLists({
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
