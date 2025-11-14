'use client';

import { useState, useEffect, useRef } from 'react';

const REFERENCE_IMAGES = [
  {
    url: 'data:image/svg+xml,%3Csvg width="512" height="512" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="512" height="512" fill="%23FF6B6B"/%3E%3Ccircle cx="256" cy="200" r="80" fill="%23FFE66D"/%3E%3Crect x="180" y="280" width="152" height="180" rx="10" fill="%234ECDC4"/%3E%3C/svg%3E',
    description: 'A red background with a yellow circle on top and a teal rounded rectangle below'
  },
  {
    url: 'data:image/svg+xml,%3Csvg width="512" height="512" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="512" height="512" fill="%23A8E6CF"/%3E%3Cpolygon points="256,100 350,300 162,300" fill="%23FF8B94"/%3E%3Crect x="206" y="350" width="100" height="100" fill="%23FFD3B6"/%3E%3C/svg%3E',
    description: 'A light green background with a pink triangle and an orange square below it'
  },
  {
    url: 'data:image/svg+xml,%3Csvg width="512" height="512" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="512" height="512" fill="%23F7DC6F"/%3E%3Ccircle cx="150" cy="150" r="60" fill="%23E74C3C"/%3E%3Ccircle cx="362" cy="150" r="60" fill="%233498DB"/%3E%3Cpath d="M 150 350 Q 256 450 362 350" stroke="%23000" stroke-width="8" fill="none"/%3E%3C/svg%3E',
    description: 'A yellow background with a red circle on the left, blue circle on the right, and a black curved smile below'
  },
  {
    url: 'data:image/svg+xml,%3Csvg width="512" height="512" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="512" height="512" fill="%239B59B6"/%3E%3Crect x="100" y="100" width="130" height="130" fill="%23F39C12" transform="rotate(45 165 165)"/%3E%3Ccircle cx="350" cy="350" r="80" fill="%231ABC9C"/%3E%3C/svg%3E',
    description: 'A purple background with a rotated orange diamond in the top left and a teal circle in the bottom right'
  },
  {
    url: 'data:image/svg+xml,%3Csvg width="512" height="512" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2395E1D3;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23F38181;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="512" height="512" fill="url(%23grad)"/%3E%3Cstar points="256,80 280,180 380,180 300,240 330,340 256,280 182,340 212,240 132,180 232,180" fill="%23FFFFFF"/%3E%3C/svg%3E',
    description: 'A gradient background from mint green to coral pink with a white star in the center'
  }
];

export default function Home() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'generating' | 'result'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(REFERENCE_IMAGES[0]);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeUp();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const startGame = () => {
    const randomImage = REFERENCE_IMAGES[Math.floor(Math.random() * REFERENCE_IMAGES.length)];
    setCurrentImage(randomImage);
    setGameState('playing');
    setTimeLeft(60);
    setPrompt('');
    setGeneratedImage(null);
    setScore(null);
    setError(null);
  };

  const handleTimeUp = () => {
    setGameState('result');
    setScore(0);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGameState('generating');
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);

      // Calculate a simple score based on remaining time
      const timeScore = Math.floor((timeLeft / 60) * 100);
      setScore(timeScore);
      setGameState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setGameState('playing');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          AI Image Match Game
        </h1>

        {gameState === 'ready' && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              You'll see a reference image. Your goal is to write a prompt for an AI image generator
              to create an image as close as possible to the reference. You have 60 seconds!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'generating') && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Reference Image</h2>
                <div className={`text-4xl font-bold px-6 py-2 rounded-full ${
                  timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-purple-500'
                } text-white`}>
                  {timeLeft}s
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                <img
                  src={currentImage.url}
                  alt="Reference"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Your AI Prompt:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-gray-800 focus:border-purple-500 focus:outline-none resize-none h-32"
                  disabled={gameState === 'generating'}
                />

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || gameState === 'generating'}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {gameState === 'generating' ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              {score && score > 0 ? 'Game Complete!' : 'Time\'s Up!'}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Reference Image</h3>
                <img
                  src={currentImage.url}
                  alt="Reference"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Your Generated Image</h3>
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-lg">No image generated</p>
                  </div>
                )}
              </div>
            </div>

            {prompt && (
              <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-2">Your Prompt:</h3>
                <p className="text-gray-600">{prompt}</p>
              </div>
            )}

            {score !== null && score > 0 && (
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  {score} points
                </div>
                <p className="text-gray-600">Based on time remaining</p>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
