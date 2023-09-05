import { string, object, TypeOf, number } from 'zod'

const createGameParam = {
  body: object({
    size: number({
      required_error: 'size is required',
    }),
  }),
}
const updateGameParam = {
  body: object({
    row: number({
      required_error: 'row is required',
    }),
    col: number({
      required_error: 'col is required',
    }),
  }),
}

export const createGameschema = object({
  ...createGameParam,
})

export const updateGameschema = object({
  ...updateGameParam,
})

export type createGameInput = TypeOf<typeof createGameschema>
export type updateGameInput = TypeOf<typeof updateGameschema>