import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameStatus, Direction, Point } from '../types';
import { BOARD_SIZE, INITIAL_SNAKE, INITIAL_DIRECTION, INITIAL_SPEED, KEY_MAP, MIN_SPEED, SPEED_DECREMENT } from '../constants';
import { Trophy, RefreshCcw, Play, Pause, XCircle } from 'lucide-react';
import { MobileControls } from './MobileControls';

// Helper to generate random food not on snake
const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  let isOnSnake = true;
  while (isOnSnake) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) return newFood;
  }
  return { x: 0, y: 0 }; // Fallback (should theoretically never reach here if loop works)
};

export const SnakeGame: React.FC = () => {
  // --- State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Use refs for mutable values needed inside the effect interval to avoid closure staleness
  // or excessive re-renders/dependency loops.
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const lastRenderedDirectionRef = useRef<Direction>(INITIAL_DIRECTION); // Prevent 180 turns in one tick

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('snake-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  // Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  }, [score, highScore]);

  // --- Game Loop ---
  const gameTick = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = directionRef.current;
      lastRenderedDirectionRef.current = currentDir;

      const newHead = { ...head };

      switch (currentDir) {
        case Direction.UP:
          newHead.y -= 1;
          break;
        case Direction.DOWN:
          newHead.y += 1;
          break;
        case Direction.LEFT:
          newHead.x -= 1;
          break;
        case Direction.RIGHT:
          newHead.x += 1;
          break;
      }

      // Check Walls
      if (
        newHead.x < 0 ||
        newHead.x >= BOARD_SIZE ||
        newHead.y < 0 ||
        newHead.y >= BOARD_SIZE
      ) {
        setStatus(GameStatus.GAME_OVER);
        return prevSnake;
      }

      // Check Self Collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setStatus(GameStatus.GAME_OVER);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check Food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_DECREMENT));
        // We rely on the *updated* snake state for the next food generation in the next render cycle?
        // Actually, better to calculate food here or use a layout effect.
        // For simplicity in React state, we'll set food immediately using the *newSnake* (including the tail).
        setFood(generateFood(newSnake));
        // Don't pop tail (grow)
      } else {
        newSnake.pop(); // Remove tail (move)
      }

      return newSnake;
    });
  }, [food]);

  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const intervalId = setInterval(gameTick, speed);
    return () => clearInterval(intervalId);
  }, [status, speed, gameTick]);

  // --- Input Handling ---
  const handleDirectionChange = useCallback((newDir: Direction) => {
    const currentLastDir = lastRenderedDirectionRef.current;
    
    // Prevent 180 degree turns
    const isOpposite =
      (newDir === Direction.UP && currentLastDir === Direction.DOWN) ||
      (newDir === Direction.DOWN && currentLastDir === Direction.UP) ||
      (newDir === Direction.LEFT && currentLastDir === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && currentLastDir === Direction.LEFT);

    if (!isOpposite) {
      setDirection(newDir);
      directionRef.current = newDir;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key]) {
        e.preventDefault(); // Stop page scrolling
        handleDirectionChange(KEY_MAP[e.key]);
      }
      if (e.key === ' ' && (status === GameStatus.PLAYING || status === GameStatus.PAUSED)) {
         togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, status]);


  // --- Controls ---
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastRenderedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const togglePause = () => {
    if (status === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
    else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };

  // --- Render Helpers ---
  // Create a flat array for the grid cells
  const gridCells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);
    return { x, y, id: i };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4 h-full">
      
      {/* Header / Scoreboard */}
      <div className="flex w-full justify-between items-center mb-4 bg-game-board p-3 rounded-xl border border-game-grid shadow-lg">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-yellow-900/30 rounded-full">
             <Trophy className="w-5 h-5 text-yellow-500" />
           </div>
           <div className="flex flex-col">
             <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">High Score</span>
             <span className="text-xl font-mono font-bold text-yellow-400">{highScore}</span>
           </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current</span>
          <span className="text-2xl font-mono font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative group w-full aspect-square max-h-[70vh]">
        {/* The Grid */}
        <div 
          className="w-full h-full grid bg-game-board border-4 border-game-grid rounded-lg shadow-2xl overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {gridCells.map((cell) => {
            const isSnakeHead = snake[0].x === cell.x && snake[0].y === cell.y;
            const isSnakeBody = !isSnakeHead && snake.some((s) => s.x === cell.x && s.y === cell.y);
            const isFood = food.x === cell.x && food.y === cell.y;

            let cellClass = "w-full h-full border-[0.5px] border-game-grid/30 "; // faint grid lines
            
            if (isSnakeHead) {
               cellClass += "bg-game-snakeHead rounded-sm z-10 scale-105 shadow-md shadow-green-900/50";
            } else if (isSnakeBody) {
               cellClass += "bg-game-snake rounded-sm opacity-90";
            } else if (isFood) {
               cellClass += "bg-game-food rounded-full animate-pulse shadow-md shadow-red-900/50 scale-75";
            } 

            return <div key={cell.id} className={cellClass} />;
          })}
        </div>

        {/* Overlays */}
        {status === GameStatus.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg z-20">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-6 drop-shadow-lg tracking-tighter">SNAKE</h1>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              START GAME
            </button>
            <p className="mt-4 text-gray-400 text-sm">Use Arrow Keys or Swipe</p>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md rounded-lg z-20 animate-in fade-in duration-300">
            <XCircle className="w-16 h-16 text-white mb-4 opacity-80" />
            <h2 className="text-4xl font-bold text-white mb-2">GAME OVER</h2>
            <p className="text-xl text-white/80 mb-6">Score: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <RefreshCcw className="w-5 h-5" />
              TRY AGAIN
            </button>
          </div>
        )}

        {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-20">
            <h2 className="text-3xl font-bold text-white mb-6 tracking-widest">PAUSED</h2>
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              RESUME
            </button>
          </div>
        )}
      </div>

      {/* Controls Footer */}
      <div className="mt-6 w-full flex justify-between items-center gap-4">
        <div className="flex-1">
           {/* Desktop hint or empty space */}
           <div className="hidden md:block text-sm text-gray-500">
             <span className="kbd bg-gray-800 px-1 rounded border border-gray-700">Space</span> to Pause
           </div>
        </div>

        {/* Mobile D-Pad */}
        <div className="flex md:hidden items-center justify-center">
             <MobileControls onDirectionChange={handleDirectionChange} />
        </div>

         {/* Utility Buttons */}
         <div className="flex-1 flex justify-end">
            {(status === GameStatus.PLAYING || status === GameStatus.PAUSED) && (
              <button
                onClick={togglePause}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 text-gray-300 transition-colors"
                aria-label="Pause/Resume"
              >
                {status === GameStatus.PAUSED ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
            )}
         </div>
      </div>
    </div>
  );
};