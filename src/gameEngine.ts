import { game, move, playerType } from './model/game.model'


const activeGames: Array<game> = [];



export const createNewGame = (uid:string, size:number): game | undefined => {

    let newGame: game | undefined;
    newGame = activeGames.find( game => game.uid === uid);
    if(newGame != null) {
      return newGame;
    }
    
    const board: Array<Array<string | null>> = [];

    for (let i = 0; i < size; i++) {
      const row: Array<string | null> = [];
      for (let j = 0; j < size; j++) {
        row.push(null);
      }
      board.push(row);
    }

    newGame = {
        uid: uid,
        size: size,
        board: board,
        result: null,
        isFinished: false,
        turn: "black"
    }
    activeGames.push(newGame)
    return newGame
}


export const makeMove = (uid:string, row:number, col:number): game | undefined | null=> {
  
  let game: game | undefined;
  game = activeGames.find( game => game.uid === uid);
  if(game == null) {
    return null;
  }

  if(game.board[row][col] != null) return null;

  game.board[row][col] = game.turn;
  

  if(checkWinningState(game.board, game.size)) {
    game.result = game.turn;
    game.isFinished = true;
    return game;
  }

  if(checkDraw(game.board)) {
    game.result = "draw";
    game.isFinished = true;
    return game;
  }
  
  game.turn === 'black' ? game.turn = 'white' : game.turn = 'black';
  return game;
}




const checkWinningState = (board: Array<Array<string | null>> , size: number): boolean =>{
  const directions: [number, number][] = [
      [0, 1],   // Right
      [1, 0],   // Down
      [1, 1],   // Diagonal down-right
      [1, -1]   // Diagonal down-left
  ];

  function isInRange(x: number, y: number): boolean {
      return x >= 0 && x < size && y >= 0 && y < size;
  }

  function checkConsecutive(x: number, y: number, dx: number, dy: number, value: string | null): boolean {
      let consecutiveCount = 0;
      while (isInRange(x, y) && board[x][y] === value) {
          consecutiveCount++;
          x += dx;
          y += dy;
      }
      return consecutiveCount >= 5;
  }

  for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
          if (board[i][j] !== null) {
              for (const [dx, dy] of directions) {
                  if (checkConsecutive(i, j, dx, dy, board[i][j])) {
                      return true;
                  }
              }
          }
      }
  }

  return false;
}

const checkDraw = (board: Array<Array<string | null>>) : boolean =>{
  return board.every((row: any ) => row.every((cell: any) => cell !== null))
};