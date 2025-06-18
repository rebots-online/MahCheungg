import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Feedback } from '@/lib/sound';
import GameMulticastManager, { GameSession } from '@/services/GameMulticastManager';
import { PlayerSide } from '@/game/pieces';
import { GameState, initializeGameState, startGame } from '@/game/gameState';

interface MultiplayerSetupProps {
  onGameStart: (gameState: GameState, gameSession: GameSession) => void;
  onCancel: () => void;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onGameStart, onCancel }) => {
  const [mode, setMode] = useState<'host' | 'join'>('host');
  const [playerName, setPlayerName] = useState('');
  const [playerSide, setPlayerSide] = useState<PlayerSide>(PlayerSide.RED);
  const [sessionCode, setSessionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const multicastManager = GameMulticastManager.getInstance();

  // Initialize player name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // Initialize the multicast manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        await multicastManager.initialize({
          playerName: playerName || undefined,
          debug: true
        });
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize multicast manager:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize multiplayer. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (!isInitialized) {
      initializeManager();
    }
  }, [isInitialized, playerName]);

  // Update player name in the multicast manager when it changes
  useEffect(() => {
    if (isInitialized && playerName) {
      multicastManager.setPlayerName(playerName);
      localStorage.setItem('playerName', playerName);
    }
  }, [isInitialized, playerName]);

  const handleHostGame = async () => {
    if (!playerName) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name before hosting a game.',
        variant: 'destructive',
      });
      Feedback.error();
      return;
    }

    try {
      setIsLoading(true);
      Feedback.buttonClick();

      // Initialize a new game state
      const gameState = startGame(initializeGameState());

      // Create a new game session
      const gameSession = multicastManager.createGameSession(gameState, playerSide);

      toast({
        title: 'Game Created',
        description: `Share code ${gameSession.sessionCode} with your opponent.`,
      });

      // Call the onGameStart callback
      onGameStart(gameState, gameSession);
    } catch (error) {
      console.error('Failed to host game:', error);
      toast({
        title: 'Host Error',
        description: 'Failed to host game. Please try again.',
        variant: 'destructive',
      });
      Feedback.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name before joining a game.',
        variant: 'destructive',
      });
      Feedback.error();
      return;
    }

    if (!sessionCode) {
      toast({
        title: 'Code Required',
        description: 'Please enter a game code to join.',
        variant: 'destructive',
      });
      Feedback.error();
      return;
    }

    try {
      setIsLoading(true);
      Feedback.buttonClick();

      // Join the game session
      const gameSession = await multicastManager.joinGameSession(sessionCode);

      // The game state will be received from the host
      // For now, create a placeholder game state
      const gameState = initializeGameState();

      toast({
        title: 'Game Joined',
        description: 'Successfully joined the game.',
      });

      // Call the onGameStart callback
      onGameStart(gameState, gameSession);
    } catch (error) {
      console.error('Failed to join game:', error);
      toast({
        title: 'Join Error',
        description: 'Failed to join game. Please check the code and try again.',
        variant: 'destructive',
      });
      Feedback.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmedText = text.trim();

      // Check if the text looks like a session code (e.g., XXX-XXX)
      if (/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(trimmedText)) {
        setSessionCode(trimmedText);
        Feedback.paste();

        toast({
          title: 'Code Pasted',
          description: 'Game code pasted from clipboard.',
        });
      } else {
        setSessionCode(trimmedText);
        toast({
          title: 'Invalid Format',
          description: 'The pasted text doesn\'t look like a game code, but we\'ve pasted it anyway.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      toast({
        title: 'Paste Failed',
        description: 'Failed to paste from clipboard. Please try again.',
        variant: 'destructive',
      });
      Feedback.error();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Multiplayer Game</h2>
        <p className="text-muted-foreground">Host a new game or join an existing one.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="playerName">Your Name</Label>
          <Input
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>

        <RadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as 'host' | 'join')}
          className="flex flex-col space-y-1"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="host" id="host" />
            <Label htmlFor="host">Host a Game</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="join" id="join" />
            <Label htmlFor="join">Join a Game</Label>
          </div>
        </RadioGroup>

        {mode === 'host' && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Choose Your Side</Label>
              <RadioGroup
                value={playerSide.toString()}
                onValueChange={(value) => setPlayerSide(parseInt(value) as PlayerSide)}
                className="flex flex-col space-y-1"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PlayerSide.RED.toString()} id="red" />
                  <Label htmlFor="red" className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-800 mr-2"></div>
                    Red Side
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PlayerSide.BLACK.toString()} id="black" />
                  <Label htmlFor="black" className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-800 mr-2"></div>
                    Blue Side
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full"
              onClick={handleHostGame}
              disabled={isLoading || !isInitialized}
            >
              {isLoading ? 'Creating Game...' : 'Host Game'}
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Game Code</Label>
              <div className="flex gap-2">
                <Input
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  placeholder="Enter game code (e.g., ABC-123)"
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handlePasteFromClipboard}
                  disabled={isLoading}
                  title="Paste from clipboard"
                >
                  Paste
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleJoinGame}
              disabled={isLoading || !sessionCode || !isInitialized}
            >
              {isLoading ? 'Joining Game...' : 'Join Game'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default MultiplayerSetup;
