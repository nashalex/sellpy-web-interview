import React from 'react'
import { TextField, Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

dayjs.extend(isToday)
dayjs.extend(relativeTime, {
  // Make dayjs use strict thresholds
  // This is needed because, by default, dayjs switches to days after 22 hours, and months after 26 days
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

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

// Gets the `date` portion of a `dateTime`. e.g., the month, day, and year, with time of day set to midnight.
// If the first argument is `null || undefined`, the current day is used instead.
const getDate = (dateTime) => {
  // Delete the "time of day" part of the dateTime.
  // This works because `valueOf` returns the time in milliseconds since midnight of a special day.
  // So, `now % MILLISECONDS_IN_A_DAY` refers to the portion of `now` that stores the relative time of day.
  // Thus, `now - (now % MILLISECONDS_IN_A_DAY)` is equal to `now` with the time set to midnight.
  // The variable `r` is named after the `r` in the Division Algorithm, i.e. the remainder.

  let now = dayjs(dateTime).valueOf()
  const r = now % MILLISECONDS_IN_A_DAY
  now -= r
  return dayjs(now)
}

// Returns `true` if a `todo` is not done and it has a due date
// that was some time before today.
const isOverdue = (todo) => {
  if (!todo.date || todo.done) {
    return false
  }
  const date = dayjs(todo.date)
  return !date.isToday() && date.isBefore(getDate())
}

export const TodoListForm = ({ todoList, dispatchTodoLists }) => {
  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        {/* <Typography component='h2'>{todoList.title}</Typography> */}
        <TextField
          sx={{ flexGrow: 1 }}
          label='Title'
          value={todoList.title}
          onChange={(event) => {
            dispatchTodoLists({
              type: 'setTodoListTitle',
              listId: todoList.id,
              title: event.target.value,
            })
          }}
        />
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {todoList.todos.map((todo, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '2px',
                paddingTop: '8px',
                paddingBottom: '8px',
                marginBottom: '2px',
                borderRadius: '5px',
                backgroundColor: isOverdue(todo) && 'rgba(184, 36, 36, 0.23)',
              }}
            >
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
                  // Use `null` instead of an empty string.
                  // This makes the behavior of an empty `DatePicker` consistent
                  // with the behavior of an empty `TextField`
                  value={todo.date || null}
                  // Using IIFE because this is just display formatting logic.
                  label={(() => {
                    if (!todo.date) {
                      return 'Date'
                    }
                    const date = dayjs(todo.date)
                    if (date.isToday()) {
                      return 'Date (due today)'
                    }
                    return `Date (due ${getDate().to(date)})`
                  })()}
                  onChange={(date) => {
                    dispatchTodoLists({
                      type: 'setTodoDate',
                      listId: todoList.id,
                      index,
                      date: getDate(date),
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
