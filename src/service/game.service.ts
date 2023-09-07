import mongoose, { DocumentDefinition } from 'mongoose'
import GameModel, { GameDocument } from '../model/game.model'

export async function getGamesById(user_id: string) {
    return GameModel.find({ user_id: user_id }).lean()
  }

export async function getGameById(id: string) {
    return GameModel.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean()
}

export async function saveGameHistory(game: DocumentDefinition<GameDocument>) {
  return GameModel.create(game)
}
