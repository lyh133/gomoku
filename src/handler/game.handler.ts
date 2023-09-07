import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getUserById } from '../service/auth.service'
import { getGamesById, saveGameHistory } from '../service/game.service'
import {
  createGameInput,
  updateGameInput
} from '../schema/game.schema'

import { createNewGame, makeMove, exitGame, getGamebyUID } from '../gameEngine'
import { game } from '../model/game.model'

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


//create a game for UID, if already exist then send the active game 
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

      return res.status(200).json(
        {board: result.board, 
          result: result.result,
            isFinished: result.isFinished,
              moves: result.moves,
                turn: result.turn});

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

//save the current active game by UID, only save if game finished
gameHandler.post(
  '/saveGameHistory',
  async (req: Request<{}, {}, {}>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      const game = getGamebyUID(decodedToken._id);
      if(!game) return res.status(500).send('can not find game');

      if(!game.isFinished) res.status(500).send('Error saving game history, game is not finished');
      
      await saveGameHistory({
        user_id: decodedToken._id,
        size: game.board.length,
        moves: game.moves,
        result: game.result
      })

      exitGame(decodedToken._id);

      return res.status(200)

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

// get history games by UID
gameHandler.post(
  '/getGames',
  async (req: Request<{}, {}, {}>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      const games = await getGamesById(decodedToken._id);

      let games_json: any = []
      games.forEach(game => {
        let today  = new Date();
        games_json.push({
          date: game.createdAt && game.createdAt.toISOString().split('T')[0],
          result: game.result,
          size: game.size,
          moves: game.moves
        })
      })

      return res.status(200).json(games_json)

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)


//remove the current active game by UID
gameHandler.post(
  '/exitGame',
  async (req: Request<{}, {}, {}>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      exitGame(decodedToken._id);

      return res.status(200);

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

//get current active game by UID 
gameHandler.post(
  '/getActiveGame',
  async (req: Request<{}, {}, {}>, res: Response) => {
    try {

      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      const game = getGamebyUID(decodedToken._id);

      if(game){
        return res.status(200).json(
          {game : game});
      }

      return res.status(200)

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

// make a move in the game, update gameState and send to client
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
            isFinished: result.isFinished,
            moves: result.moves,
            turn: result.turn});

    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

  export default gameHandler
  