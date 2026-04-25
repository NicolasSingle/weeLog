import { useState, useEffect } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { Input } from './ui/input'

interface DateTimePickerProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')

  useEffect(() => {
    if (value) {
      try {
        const date = parseISO(value)
        if (isValid(date)) {
          setDateValue(format(date, 'yyyy-MM-dd'))
          setTimeValue(format(date, 'HH:mm'))
        }
      } catch {
        setDateValue('')
        setTimeValue('')
      }
    } else {
      setDateValue('')
      setTimeValue('')
    }
  }, [value])

  const updateValue = (date: string, time: string) => {
    setDateValue(date)
    setTimeValue(time)
    if (date && time) {
      onChange(`${date}T${time}:00`)
    } else if (date) {
      onChange(`${date}T00:00:00`)
    } else {
      onChange(null)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(e.target.value, timeValue)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(dateValue, e.target.value)
  }

  const handleClear = () => {
    setDateValue('')
    setTimeValue('')
    onChange(null)
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        className="flex-1"
      />
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        className="w-28"
      />
      {(dateValue || timeValue) && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground text-sm dark:text-muted-foreground dark:hover:text-foreground"
        >
          清除
        </button>
      )}
    </div>
  )
}
