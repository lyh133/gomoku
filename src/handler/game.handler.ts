import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import validateSchema from '../middleware/validateSchema'
import { getUserById } from '../service/auth.service'
import {
  createGameInput,
  updateGameInput
} from '../schema/game.schema'

import { createNewGame, makeMove } from '../gameEngine'
import { game, move, playerType } from '../model/game.model'
import { signJwt } from '../util/jwt'

const gameHandler = express.Router()


const decodeToken = (token: string | undefined): {username: string, _id: string} | undefined => {

  if (!token || !token.startsWith('Bearer ')) {
    return undefined;
  }
  const userToken = token.slice(7);
  const privateKey = process.env.accessTokenPrivateKey as string
  const decodedToken: {username: string, _id: string} = jwt.verify(userToken, privateKey) as {username: string, _id: string};
  return decodedToken
}

gameHandler.post(
  '/createGame',
  async (req: Request<{}, {}, createGameInput['body']>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      const { size } = req.body
      let result : game | undefined = createNewGame(decodedToken._id, size);
      if(!result) return res.status(400).send('active game already exist')

      return res.status(200)

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)
gameHandler.post(
  '/updateGame',
  async (req: Request<{}, {}, updateGameInput['body']>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');


      const { row, col } = req.body

      let result : game | null | undefined = makeMove(decodedToken._id, row, col)
      if(!result) return res.status(400).send('error, either no active game or board block already filled')

      return res.status(200).json(
        {board: result.board, 
          result: result.result,
            isFinished: result.isFinished});

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

  export default gameHandler
  