# MahCheungg API Documentation (20apr2025-06h35)

## Overview

The MahCheungg API provides endpoints for game management, user authentication, payment processing, and learning resources. This document outlines the available endpoints, request/response formats, and authentication requirements.

## Base URL

```
https://api.mahcheungg.com/v1
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT). Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

To obtain a token, use the `/auth/login` endpoint.

## Endpoints

### Authentication

#### Register User

```
POST /auth/register
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "PlayerName"
}
```

Response:
```json
{
  "userId": "user123",
  "displayName": "PlayerName",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```
POST /auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "userId": "user123",
  "displayName": "PlayerName",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Google Authentication

```
POST /auth/google
```

Request:
```json
{
  "idToken": "google-id-token"
}
```

Response:
```json
{
  "userId": "user123",
  "displayName": "PlayerName",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management

#### Get User Profile

```
GET /users/profile
```

Response:
```json
{
  "userId": "user123",
  "displayName": "PlayerName",
  "email": "user@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "subscriptionTier": "premium",
  "subscriptionExpiry": "2025-12-31T23:59:59Z",
  "balance": 1000,
  "statistics": {
    "gamesPlayed": 42,
    "gamesWon": 15,
    "winRate": 0.357
  }
}
```

#### Update User Profile

```
PUT /users/profile
```

Request:
```json
{
  "displayName": "NewPlayerName",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

Response:
```json
{
  "userId": "user123",
  "displayName": "NewPlayerName",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

### Game Management

#### Create Game

```
POST /games
```

Request:
```json
{
  "gameType": "cantonese",
  "playerCount": 4,
  "aiDifficulty": "medium",
  "isPrivate": true
}
```

Response:
```json
{
  "gameId": "game123",
  "gameType": "cantonese",
  "playerCount": 4,
  "aiDifficulty": "medium",
  "isPrivate": true,
  "inviteCode": "ABC123",
  "createdAt": "2025-04-20T06:35:00Z",
  "status": "waiting"
}
```

#### Join Game

```
POST /games/{gameId}/join
```

Request:
```json
{
  "inviteCode": "ABC123"
}
```

Response:
```json
{
  "gameId": "game123",
  "position": 2,
  "players": [
    {
      "userId": "user123",
      "displayName": "PlayerName",
      "position": 0,
      "isReady": true
    },
    {
      "userId": "ai1",
      "displayName": "AI Player 1",
      "position": 1,
      "isReady": true
    }
  ],
  "status": "waiting"
}
```

#### Get Game State

```
GET /games/{gameId}
```

Response:
```json
{
  "gameId": "game123",
  "gameType": "cantonese",
  "status": "in_progress",
  "currentTurn": "user123",
  "round": 1,
  "players": [
    {
      "userId": "user123",
      "displayName": "PlayerName",
      "position": 0,
      "score": 25000,
      "isDealer": true
    },
    {
      "userId": "user456",
      "displayName": "Opponent",
      "position": 1,
      "score": 25000,
      "isDealer": false
    }
  ],
  "hand": [
    {
      "id": "tile1",
      "type": "character",
      "value": 1,
      "isConcealed": true
    },
    {
      "id": "tile2",
      "type": "character",
      "value": 1,
      "isConcealed": true
    }
  ],
  "discardPile": [
    {
      "id": "tile3",
      "type": "wind",
      "value": "east",
      "isConcealed": false,
      "discardedBy": "user456"
    }
  ],
  "wall": {
    "tilesRemaining": 84
  }
}
```

#### Perform Game Action

```
POST /games/{gameId}/actions
```

Request:
```json
{
  "action": "discard",
  "tileId": "tile1"
}
```

Response:
```json
{
  "success": true,
  "gameState": {
    "gameId": "game123",
    "status": "in_progress",
    "currentTurn": "user456"
  }
}
```

### Payment & Subscription

#### Generate Lightning Invoice

```
POST /payments/lightning/invoice
```

Request:
```json
{
  "amount": 10.00,
  "currency": "USD",
  "description": "Deposit to MahCheungg account"
}
```

Response:
```json
{
  "invoiceId": "inv123",
  "paymentRequest": "lnbc10m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w",
  "amount": 10.00,
  "currency": "USD",
  "satoshis": 20000,
  "expiresAt": "2025-04-20T07:35:00Z"
}
```

#### Check Payment Status

```
GET /payments/{invoiceId}
```

Response:
```json
{
  "invoiceId": "inv123",
  "status": "paid",
  "paidAt": "2025-04-20T06:40:00Z",
  "amount": 10.00,
  "currency": "USD"
}
```

#### Get Subscription Plans

```
GET /subscriptions/plans
```

Response:
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free Trial",
      "description": "Basic access with limited features",
      "price": 0,
      "currency": "USD",
      "interval": "month",
      "features": [
        "Basic AI opponents",
        "Limited game modes",
        "Access to learning resources"
      ]
    },
    {
      "id": "standard",
      "name": "Standard",
      "description": "Full access to local gameplay",
      "price": 4.99,
      "currency": "USD",
      "interval": "month",
      "features": [
        "All free features",
        "Local LAN play",
        "Advanced AI opponents"
      ]
    },
    {
      "id": "premium",
      "name": "Premium",
      "description": "Complete access with online matchmaking",
      "price": 9.99,
      "currency": "USD",
      "interval": "month",
      "features": [
        "All standard features",
        "Online matchmaking",
        "Tournament access"
      ]
    }
  ]
}
```

#### Subscribe to Plan

```
POST /subscriptions
```

Request:
```json
{
  "planId": "premium",
  "paymentMethod": "lightning"
}
```

Response:
```json
{
  "subscriptionId": "sub123",
  "planId": "premium",
  "status": "active",
  "startDate": "2025-04-20T06:35:00Z",
  "endDate": "2025-05-20T06:35:00Z",
  "autoRenew": true
}
```

### Learning Resources

#### Get Lessons

```
GET /learning/lessons
```

Query Parameters:
- `category`: Filter by category (rules, strategy, terminology)
- `difficulty`: Filter by difficulty (beginner, intermediate, advanced)
- `search`: Search term

Response:
```json
{
  "lessons": [
    {
      "id": "lesson1",
      "title": "Basic Rules of Cantonese Mahjong",
      "description": "Learn the fundamental rules and gameplay of Cantonese Mahjong.",
      "category": "rules",
      "difficulty": "beginner",
      "duration": 15,
      "thumbnailUrl": "https://example.com/lesson1.jpg"
    },
    {
      "id": "lesson2",
      "title": "Cantonese Mahjong Terminology",
      "description": "Essential Cantonese terms used in Mahjong gameplay.",
      "category": "terminology",
      "difficulty": "beginner",
      "duration": 10,
      "thumbnailUrl": "https://example.com/lesson2.jpg"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10
}
```

#### Get Lesson Details

```
GET /learning/lessons/{lessonId}
```

Response:
```json
{
  "id": "lesson1",
  "title": "Basic Rules of Cantonese Mahjong",
  "description": "Learn the fundamental rules and gameplay of Cantonese Mahjong.",
  "category": "rules",
  "difficulty": "beginner",
  "duration": 15,
  "content": "<h2>Basic Rules of Cantonese Mahjong</h2><p>Cantonese Mahjong is played with 144 tiles...</p>",
  "videoUrl": "https://example.com/videos/lesson1.mp4",
  "relatedLessons": ["lesson3", "lesson5"]
}
```

#### Get Cantonese Term Pronunciation

```
GET /learning/pronunciation/{term}
```

Response:
```json
{
  "term": "碰",
  "romanization": "pung",
  "meaning": "Three identical tiles",
  "audioUrl": "https://example.com/audio/pung.mp3"
}
```

#### Chat with AI Tutor

```
POST /learning/chat
```

Request:
```json
{
  "message": "What is the difference between Pung and Kong?",
  "conversationId": "conv123"
}
```

Response:
```json
{
  "conversationId": "conv123",
  "message": "In Cantonese Mahjong, a Pung (碰) refers to a set of three identical tiles, while a Kong (槓) refers to a set of four identical tiles. When you form a Kong, you need to draw an extra tile from the wall to maintain 13 tiles in your hand.",
  "audioUrl": "https://example.com/audio/response123.mp3"
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a JSON object with error details:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": "Amount must be greater than zero"
  }
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- 60 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1619164500
```

## Versioning

The API uses versioning in the URL path (e.g., `/v1/games`). When breaking changes are introduced, a new version will be released while maintaining support for previous versions for a deprecation period.
