# MahCheungg Architecture

This document outlines the architecture for the MahCheungg game, focusing on creating a system that works with both AI and human players using the same connection interfaces.

## System Overview

MahCheungg is a digital implementation of the traditional Mahjong game with multiple subscription tiers:
- **Free Trial/Teaching Mode**: Limited functionality focused on learning
- **Standard Tier**: Local LAN play with AI and human players
- **Premium Tier**: Online matchmaking with similarly skilled players

## Core Components

### 1. Player Interface

The central architectural concept is a unified player interface that both human and AI players implement:

```typescript
interface Player {
  // Basic properties
  id: string;
  name: string;
  isAI: boolean;
  
  // Game state
  hand: Tile[];
  discardedTiles: Tile[];
  exposedSets: TileSet[];
  
  // Actions
  drawTile(tile: Tile): void;
  discardTile(tile: Tile): void;
  declarePung(tile: Tile): boolean;
  declareKong(tile: Tile): boolean;
  declareChow(tile: Tile, position: ChowPosition): boolean;
  declareMahjong(): boolean;
  
  // Decision making
  getDiscardDecision(): Promise<Tile>;
  getActionDecision(availableActions: GameAction[], discardedTile: Tile): Promise<GameAction | null>;
  
  // Communication
  sendMessage(message: string): void;
  receiveMessage(message: string, sender: Player): void;
  
  // Connection management
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
}
```

This interface ensures that the game logic doesn't need to know whether it's interacting with a human or AI player.

### 2. Game Logic

The game logic manages:
- Game rules and validation
- Turn management
- Tile distribution
- Special actions (Chow, Pung, Kong, Mahjong)
- Scoring

### 3. Networking Layer

The networking layer handles:
- WebSocket connections for real-time gameplay
- LAN discovery for local play
- Game state synchronization
- Voice and video chat integration

### 4. Subscription System

The subscription system manages:
- User authentication
- Subscription tier management
- Feature gating based on subscription level
- Payment processing (via Stripe)

### 5. Teaching Module

The teaching module includes:
- Progression system for different skill levels
- Interactive exercises
- Progress tracking
- Achievement system

## Technical Stack

- **Frontend**: React with TypeScript, Vite for build system
- **Styling**: Tailwind CSS
- **State Management**: Redux or Context API
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io or WebSockets
- **Authentication**: JWT-based authentication
- **Payment Processing**: Stripe
- **Voice/Video Chat**: WebRTC or a service like Twilio

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Web Client     │     │  Game Server    │     │  Auth Server    │
│  - React        │     │  - Node.js      │     │  - Node.js      │
│  - WebSockets   │◄────┤  - WebSockets   │◄────┤  - JWT          │
│  - WebRTC       │     │  - Game Logic   │     │  - Stripe       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │                 │
                        │  Database       │
                        │  - MongoDB      │
                        │  - Redis        │
                        │                 │
                        └─────────────────┘
```

## AI Player Design

AI players implement the same `Player` interface as human players but use algorithms for decision-making:

```typescript
class AIPlayer implements Player {
  difficulty: AIDifficulty;
  personality: AIPersonality;
  
  getDiscardDecision(): Promise<Tile> {
    // AI logic to choose a tile to discard based on:
    // - Current hand evaluation
    // - Difficulty level
    // - Personality traits (aggressive, defensive, etc.)
    // - Game state analysis
  }
  
  getActionDecision(availableActions: GameAction[], discardedTile: Tile): Promise<GameAction | null> {
    // AI logic to decide whether to perform an action based on:
    // - Action evaluation
    // - Risk assessment
    // - Difficulty level
    // - Personality traits
  }
}
```

## Communication System

The communication system supports:
- Text chat between players
- Voice chat for real-time communication
- Video chat for a more immersive experience

All communication is routed through the same interfaces regardless of player type, with AI players potentially using text-to-speech and speech recognition for voice interaction.

## Subscription Tier Features

### Free Trial/Teaching Mode
- Access to teaching modules
- Play against AI opponents
- Limited game features

### Standard Tier
- Full game features
- Local LAN play with friends
- Unlimited AI opponents with various difficulty levels
- Basic teaching modules

### Premium Tier
- All standard features
- Online matchmaking with skill-based pairing
- Advanced teaching modules
- Statistics and performance tracking
- Tournament access
