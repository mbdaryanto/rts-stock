import { parseDateId, dateSchemaId } from './datelib'

describe('testing datelib', () => {
  it('should parse Indonesia format date', () => {
    expect(new Date(2020, 0, 1)).toStrictEqual(new Date(2020, 0, 1))
    expect(parseDateId(new Date(2020, 0, 1))).toStrictEqual(new Date(2020, 0, 1))
    expect(parseDateId('22/11')).toStrictEqual(new Date(2021, 10, 22))
    expect(parseDateId('1/11/19')).toStrictEqual(new Date(2019, 10, 1))
    expect(parseDateId('6/6/98')).toStrictEqual(new Date(1998, 5, 6))
    expect(parseDateId('2021-05-06')).toStrictEqual(new Date(2021, 4, 6))
  })

  it('should dateSchemaId', () => {
    expect(dateSchemaId.isValidSync('22/11')).toBe(true)
    expect(dateSchemaId.cast('22/11')).toStrictEqual(new Date(2021, 10, 22))
  })
})
