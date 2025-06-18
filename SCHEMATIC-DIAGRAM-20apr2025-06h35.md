# MahCheungg Schematic Diagrams (20apr2025-06h35)

## System Architecture Diagram

```mermaid
graph TD
    subgraph "Client Application"
        UI[User Interface]
        State[State Management]
        Services[Services Layer]
    end

    subgraph "Backend Services"
        API[API Gateway]
        Auth[Authentication Service]
        Game[Game Service]
        Payment[Payment Service]
        Learning[Learning Service]
        AI[AI Service]
    end

    subgraph "Data Storage"
        UserDB[User Database]
        GameDB[Game Database]
        ContentDB[Content Database]
        AnalyticsDB[Analytics Database]
    end

    UI --> State
    State --> Services
    Services --> API

    API --> Auth
    API --> Game
    API --> Payment
    API --> Learning
    API --> AI

    Auth --> UserDB
    Game --> GameDB
    Learning --> ContentDB
    Auth --> AnalyticsDB
    Game --> AnalyticsDB
    Payment --> AnalyticsDB
    Learning --> AnalyticsDB

    Payment --> ExternalPayment[External Payment Providers]
    Auth --> ExternalAuth[External Auth Providers]

    ExternalPayment --> WebLN[WebLN/Lightning]
    ExternalPayment --> RevenueCat[RevenueCat]
    ExternalPayment --> Traditional[Traditional Payment]

    ExternalAuth --> Google[Google Auth]
    ExternalAuth --> Email[Email/Password]

    Learning --> TTS[Text-to-Speech]
    Learning --> STT[Speech-to-Text]
    Learning --> LLM[Large Language Model]
```

## Component Diagram

```mermaid
graph TD
    subgraph "App Component"
        App[App.tsx]
        ThemeProvider[ThemeProvider]
        LanguageProvider[LanguageProvider]
        Router[Router]
    end

    subgraph "Pages"
        GameHub[GameHub]
        GameController[GameController]
        LearningCenter[LearningCenter]
        HomePage[HomePage]
    end

    subgraph "Game Components"
        GameBoard[GameBoard]
        PlayerHand[PlayerHand]
        DiscardPile[DiscardPile]
        GameActions[GameActions]
        AIPlayer[AIPlayer]
        HumanPlayer[HumanPlayer]
    end

    subgraph "Learning Components"
        Lessons[Lessons]
        AIChatbot[AIChatbot]
        CantoneseCharacter[CantoneseCharacter]
        SearchBar[SearchBar]
    end

    subgraph "Auth Components"
        AuthModal[AuthModal]
        LoginForm[LoginForm]
        RegisterForm[RegisterForm]
        GoogleButton[GoogleButton]
    end

    subgraph "Payment Components"
        DepositModal[DepositModal]
        SubscriptionPlans[SubscriptionPlans]
        PaymentMethods[PaymentMethods]
    end

    subgraph "Services"
        WebLNService[WebLNService]
        RevenueCatService[RevenueCatService]
        ChatbotService[ChatbotService]
        SpeechService[SpeechService]
        AudioService[AudioService]
    end

    App --> ThemeProvider
    App --> LanguageProvider
    App --> Router

    Router --> GameHub
    Router --> GameController
    Router --> LearningCenter
    Router --> HomePage

    GameController --> GameBoard
    GameController --> PlayerHand
    GameController --> DiscardPile
    GameController --> GameActions
    GameController --> AIPlayer
    GameController --> HumanPlayer

    LearningCenter --> Lessons
    LearningCenter --> AIChatbot
    LearningCenter --> CantoneseCharacter
    LearningCenter --> SearchBar

    GameHub --> AuthModal
    GameHub --> DepositModal
    GameHub --> SubscriptionPlans

    AuthModal --> LoginForm
    AuthModal --> RegisterForm
    AuthModal --> GoogleButton

    DepositModal --> PaymentMethods

    GameHub --> WebLNService
    GameHub --> RevenueCatService
    LearningCenter --> ChatbotService
    LearningCenter --> SpeechService
    LearningCenter --> AudioService
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant State as State Management
    participant Services as Services Layer
    participant API as API Gateway
    participant Backend as Backend Services
    participant DB as Databases

    User->>UI: Interaction (Click, Input)
    UI->>State: Update State
    State->>UI: Re-render

    UI->>Services: Request Data/Action
    Services->>API: API Request
    API->>Backend: Process Request
    Backend->>DB: Query/Update Data
    DB->>Backend: Return Data
    Backend->>API: Response
    API->>Services: Data/Confirmation
    Services->>State: Update State
    State->>UI: Re-render
    UI->>User: Visual Feedback
```

## Game State Diagram

```mermaid
stateDiagram-v2
    [*] --> Initialization
    Initialization --> WaitingForPlayers

    WaitingForPlayers --> GameStart: All Players Ready

    GameStart --> RoundStart

    RoundStart --> PlayerTurn

    PlayerTurn --> DrawTile: Current Player
    DrawTile --> CheckWin: Self-Draw Win
    DrawTile --> DiscardTile: No Win

    DiscardTile --> NextPlayerTurn: No Claims
    DiscardTile --> CheckClaim: Player Claims Tile

    CheckClaim --> CheckWin: Claim for Win
    CheckClaim --> FormSet: Claim for Set
    FormSet --> NextPlayerTurn

    CheckWin --> RoundEnd: Win Confirmed

    NextPlayerTurn --> PlayerTurn

    RoundEnd --> GameEnd: Final Round
    RoundEnd --> RoundStart: More Rounds

    GameEnd --> [*]
```

## Deployment Architecture

```mermaid
graph TD
    subgraph "Client"
        WebApp[Web Application]
        MobileApp[Mobile Application]
    end

    subgraph "CDN"
        StaticAssets[Static Assets]
    end

    subgraph "API Gateway"
        APIGateway[API Gateway]
        RateLimit[Rate Limiting]
        Caching[Caching]
    end

    subgraph "Microservices"
        AuthService[Authentication Service]
        GameService[Game Service]
        PaymentService[Payment Service]
        LearningService[Learning Service]
        AIService[AI Service]
    end

    subgraph "Databases"
        UserDB[(User Database)]
        GameDB[(Game Database)]
        ContentDB[(Content Database)]
        AnalyticsDB[(Analytics Database)]
    end

    subgraph "External Services"
        WebLN[WebLN/Lightning]
        RevenueCat[RevenueCat]
        GoogleAuth[Google Auth]
        TTS[Text-to-Speech API]
        LLM[LLM API]
    end

    WebApp --> StaticAssets
    MobileApp --> StaticAssets

    WebApp --> APIGateway
    MobileApp --> APIGateway

    APIGateway --> RateLimit
    APIGateway --> Caching

    RateLimit --> AuthService
    RateLimit --> GameService
    RateLimit --> PaymentService
    RateLimit --> LearningService
    RateLimit --> AIService

    AuthService --> UserDB
    GameService --> GameDB
    LearningService --> ContentDB
    AuthService --> AnalyticsDB
    GameService --> AnalyticsDB
    PaymentService --> AnalyticsDB
    LearningService --> AnalyticsDB

    PaymentService --> WebLN
    PaymentService --> RevenueCat
    AuthService --> GoogleAuth
    LearningService --> TTS
    LearningService --> LLM
```

## Database Schema

```mermaid
erDiagram
    USERS {
        string id PK
        string email
        string displayName
        string passwordHash
        string avatarUrl
        string subscriptionTier
        datetime subscriptionExpiry
        float balance
        datetime createdAt
        datetime lastLogin
    }

    GAMES {
        string id PK
        string gameType
        int playerCount
        string status
        string inviteCode
        datetime createdAt
        datetime updatedAt
        datetime endedAt
    }

    GAME_PLAYERS {
        string id PK
        string gameId FK
        string userId FK
        int position
        boolean isDealer
        int score
        datetime joinedAt
    }

    GAME_ROUNDS {
        string id PK
        string gameId FK
        int roundNumber
        string dealerId FK
        string winnerId FK
        string winType
        int points
        datetime startedAt
        datetime endedAt
    }

    GAME_ACTIONS {
        string id PK
        string gameId FK
        string userId FK
        string actionType
        string tileId
        datetime timestamp
    }

    PAYMENTS {
        string id PK
        string userId FK
        string type
        float amount
        string currency
        string status
        string externalId
        datetime createdAt
        datetime completedAt
    }

    SUBSCRIPTIONS {
        string id PK
        string userId FK
        string planId
        string status
        boolean autoRenew
        datetime startDate
        datetime endDate
        string paymentMethod
    }

    LESSONS {
        string id PK
        string title
        string description
        string category
        string difficulty
        int duration
        string content
        string videoUrl
        string thumbnailUrl
        datetime createdAt
        datetime updatedAt
    }

    USER_PROGRESS {
        string id PK
        string userId FK
        string lessonId FK
        boolean completed
        float progressPercentage
        int timeSpent
        datetime startedAt
        datetime completedAt
    }

    CHAT_CONVERSATIONS {
        string id PK
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    CHAT_MESSAGES {
        string id PK
        string conversationId FK
        string role
        string content
        string audioUrl
        datetime timestamp
    }

    USERS ||--o{ GAME_PLAYERS : "plays in"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ SUBSCRIPTIONS : "subscribes to"
    USERS ||--o{ USER_PROGRESS : "tracks progress"
    USERS ||--o{ CHAT_CONVERSATIONS : "has"

    GAMES ||--o{ GAME_PLAYERS : "has"
    GAMES ||--o{ GAME_ROUNDS : "consists of"
    GAMES ||--o{ GAME_ACTIONS : "records"

    GAME_PLAYERS ||--o{ GAME_ACTIONS : "performs"

    LESSONS ||--o{ USER_PROGRESS : "tracked in"

    CHAT_CONVERSATIONS ||--o{ CHAT_MESSAGES : "contains"
```

These diagrams provide a comprehensive overview of the MahCheungg application architecture, components, data flow, and database schema. They can be used as a reference for development and documentation purposes.
