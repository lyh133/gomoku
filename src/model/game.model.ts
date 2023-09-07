import mongoose, { Document } from "mongoose";


export type playerType = "black" | "white";
export type gameResult = "black" | "white" | "draw";

export type move = {
    rowIndex: number;
    colIndex: number;
    player : playerType;
    moveNum: number;
}

export type game = {
    uid: String;
    size: number;
    board: Array<Array<string | null>>;
    result: gameResult | null;
    isFinished: boolean;
    moves: Array<move>;
    turn: playerType;
}

export interface GameDocument extends Document {
    user_id: String;
    size: Number;
    moves: Array<move>;
    result: gameResult | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const gameSchema = new mongoose.Schema({
    user_id: { type: String, require: true},
    size: { type: Number, require: true},
    moves: { type: Array<move>, require: true},
    result: { type: String},
    // The timestamps option tells Mongoose to assign createdAt and updatedAt fields to your schema. The type assigned is Date.
  },{ timestamps: true })
  
export default mongoose.model<GameDocument>('Game', gameSchema)