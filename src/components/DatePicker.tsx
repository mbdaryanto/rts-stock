import { useState, ComponentProps, useEffect } from 'react'
import { Box, Grid, GridItem, Button, Text, Center, Select, IconButton,
  HStack, InputGroup, Input, InputLeftElement,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react'
import { isString, toString } from 'lodash'
import { eachDayOfInterval, endOfMonth, isSunday, format, parse } from 'date-fns'
import { id } from 'date-fns/locale'

import {
  ChevronLeftIcon as PrevIcon,
  ChevronRightIcon as NextIcon,
  CalendarIcon,
} from '@chakra-ui/icons'


export function dateToString(value: Date): string {
  if (isNaN(value.valueOf())) return ''
  return format(value, 'P', { locale: id })
}

export function parseDate(value: string | Date | undefined, defaultValue?: Date): Date {
  defaultValue = defaultValue || new Date()

  if (!value) return defaultValue
  if (value instanceof Date) {
    if (isNaN(value.valueOf())) return defaultValue
    return value
  }

  try {
    const result = parse(toString(value), 'P', new Date(), { locale: id })
    if (isNaN(result.valueOf())) return defaultValue
    return result
  } catch {
    return defaultValue
  }
}

export interface DateInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string | Date,
  onChange: (valueAsString: string, valueAsDate: Date) => void | Promise<void>,
}

// type DateInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> | CalendarProps
// type DateInputProps = ComponentProps<typeof Input>

export function DateInput({ value, onChange, ...rest }: DateInputProps) {
  // console.log(value)
  const valueAsString: string = isString(value) ? value : (value instanceof Date) ? dateToString(value) : toString(value)
  // console.log(valueAsString)
  let valueAsDate: Date = parseDate(value)
  // console.log(valueAsDate)
  // const valueAsDate: Date = isDate(value) ? value : parse(valueAsString, 'P', new Date(), {locale: id})

  return (
    <Popover>
      <PopoverTrigger>
        <InputGroup>
          <InputLeftElement>
            <CalendarIcon color="gray.300"/>
          </InputLeftElement>
          <Input value={valueAsString} onChange={(ev) => onChange(ev.target.value, parseDate(ev.target.value))} {...rest}/>
          {/* <InputRightAddon>
            <CalendarIcon/>
          </InputRightAddon> */}
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow/>
        <PopoverCloseButton/>
        <PopoverHeader>Pilih Tanggal</PopoverHeader>
        <PopoverBody>
          <Calendar value={valueAsDate} onChange={(valueAsDate) => onChange(dateToString(valueAsDate), valueAsDate)}/>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

function Calendar({ value, onChange }: {
  value: Date,
  onChange: (value: Date) => void | Promise<void>,
}) {
  const [year, setYear] = useState<number>(() => value.getFullYear())
  const [month, setMonth] = useState<number>(() => value.getMonth())

  useEffect(() => {
    setYear(value.getFullYear())
    setMonth(value.getMonth())
  }, [value])


  const firstDayOfMonth = new Date(year, month, 1)
  // console.log(firstDayOfMonth, year, month)
  const paddingDay = firstDayOfMonth.getDay()
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(firstDayOfMonth)
  })
  // console.log(getDaysInMonth(firstDayOfMonth))
  // const daysInMonth = range(1, getDaysInMonth(firstDayOfMonth) + 1)

  const handlePrevClick = () => {
    if (month === 0) {
      setMonth(11)
      setYear(old => old - 1)
    } else {
      setMonth(old => old - 1)
    }
  }

  const handleNextClick = () => {
    if (month === 11) {
      setMonth(1)
      setYear(old => old + 1)
    } else {
      setMonth(old => old + 1)
    }
  }

  const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const DAY_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <Box
      // boxShadow="md"
      // borderRadius="5px" borderWidth="1px" borderColor="gray.200"
      // p="1rem"
      w="300px"
    >
      <Grid
        width="100%"
        templateRows="repeat(7, 1fr)"
        templateColumns="repeat(7, 1fr)"
        gap={1}
      >
        <GridItem colSpan={7}>
          <HStack>
            <IconButton
              aria-label="previous month"
              size="xs"
              variant="ghost"
              icon={<PrevIcon/>}
              onClick={handlePrevClick}
            />

            <Select
              value={month}
              onChange={(ev) => setMonth(parseInt(ev.target.value))}
              size="xs"
              textAlign="center"
            >
              {MONTH_NAMES.map((monthName, index) => (
                <option key={index} value={index}>
                  {monthName}
                </option>
              ))}
            </Select>

            {/* <Editable
              defaultValue={toString(year)}
              value={toString(year)}
              onChange={(value) => setYear(parseInt(value))}
              fontSize="xs"
              minW="70px"
              textAlign="center"
            >
              <EditableInput/>
              <EditablePreview/>
            </Editable> */}

            <NumberInput
              defaultValue={year}
              value={year}
              onChange={(_, valueAsNumber) => setYear(valueAsNumber)}
              // fontSize="xs"
              minW="70px"
              textAlign="center"
              size="xs"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <IconButton
              aria-label="next month"
              size="xs"
              variant="ghost"
              icon={<NextIcon/>}
              onClick={handleNextClick}
            />
          </HStack>
        </GridItem>
        {DAY_OF_WEEK.map((dow, index) => (
          <GridItem key={index}>
            <Center>
              <Text fontSize="xs" color={index === 0 ? "red.500" : "gray.500"}>{dow}</Text>
            </Center>
          </GridItem>
        ))}
        {paddingDay > 0 && (
          <GridItem colSpan={paddingDay}></GridItem>
        )}
        {daysInMonth.map((day, index) => (
          <GridItem key={index}>
            <Button
              isFullWidth
              variant="ghost"
              size="xs"
              color={isSunday(day) ? "red.500" : undefined}
              onClick={() => {
                if (!!onChange) {
                  onChange(day)
                }
              }}
            >
              {day.getDate()}
            </Button>
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
}
