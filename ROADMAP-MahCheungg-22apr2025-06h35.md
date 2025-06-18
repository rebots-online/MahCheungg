# MahCheungg Development Roadmap

**Date:** 22apr2025-06h35
**Version:** 1.0
**Status:** Approved

## Overview

This roadmap outlines the development plan for MahCheungg, a distributed multiplayer Mahjong game using Jami for communication and game state transport. The roadmap is divided into phases, each with specific goals and deliverables.

## Phase 1: Foundation (Current Sprint)

**Timeline:** April 22 - May 5, 2025
**Focus:** Core architecture and basic gameplay

### Key Deliverables

1. **Jami Integration**
   - Basic integration with Jami SDK
   - Group chat creation and management
   - Message sending and receiving

2. **Game State Transport**
   - Vector clock implementation
   - Message parsing and validation
   - Turn-based authority model

3. **Basic Game Mechanics**
   - Tile representation and manipulation
   - Basic game actions (draw, discard, claim)
   - Simple game flow

4. **Minimal UI**
   - Game board display
   - Player hands visualization
   - Basic chat interface

### Milestones

- [x] Architecture design approved (April 22, 2025)
- [ ] Jami integration completed (April 26, 2025)
- [ ] Game state transport implemented (April 30, 2025)
- [ ] Basic gameplay functional (May 5, 2025)

## Phase 2: Core Gameplay (May 2025)

**Timeline:** May 6 - May 26, 2025
**Focus:** Complete game rules and improved user experience

### Key Deliverables

1. **Complete Mahjong Rules**
   - Full implementation of Cantonese Mahjong rules
   - Scoring system
   - Special hands and combinations

2. **Enhanced Game Flow**
   - Game setup and options
   - Multiple rounds support
   - Game history and replay

3. **Improved UI**
   - Multiple themes (Brutalist, Skeuomorphic, Retro, DeepSite)
   - Animations and sound effects
   - Responsive design for different devices

4. **Resilience Enhancements**
   - Improved disconnection handling
   - Game state persistence
   - Conflict resolution refinements

### Milestones

- [ ] Complete rule implementation (May 12, 2025)
- [ ] Enhanced UI with themes (May 19, 2025)
- [ ] Resilience mechanisms tested (May 26, 2025)

## Phase 3: Advanced Features (June 2025)

**Timeline:** June 1 - June 30, 2025
**Focus:** AI players, learning tools, and subscription features

### Key Deliverables

1. **AI Players**
   - Multiple difficulty levels
   - Different AI personalities
   - Adaptive learning

2. **Learning Center**
   - Interactive tutorials
   - Strategy guides
   - LLM chatbot integration

3. **Subscription Tiers**
   - Free trial/teaching mode
   - Paid local LAN play
   - Premium matchmaking

4. **Payment Integration**
   - Stripe integration
   - RevenueCat integration
   - WebLN support for Bitcoin Lightning payments

### Milestones

- [ ] AI players implementation (June 10, 2025)
- [ ] Learning center completed (June 20, 2025)
- [ ] Subscription and payment system (June 30, 2025)

## Phase 4: Polish and Launch (July 2025)

**Timeline:** July 1 - July 31, 2025
**Focus:** Optimization, testing, and launch preparation

### Key Deliverables

1. **Performance Optimization**
   - Network efficiency improvements
   - UI rendering optimization
   - Battery usage optimization for mobile

2. **Comprehensive Testing**
   - Automated test suite
   - Beta testing program
   - Stress testing

3. **Internationalization**
   - Multiple language support
   - Cultural adaptations
   - Accessibility features

4. **Launch Preparation**
   - Marketing materials
   - App store listings
   - Documentation and support resources

### Milestones

- [ ] Performance optimization completed (July 10, 2025)
- [ ] Testing and bug fixing (July 20, 2025)
- [ ] Internationalization completed (July 25, 2025)
- [ ] Launch readiness (July 31, 2025)

## Phase 5: Post-Launch and Expansion (August 2025 onwards)

**Timeline:** August 1, 2025 onwards
**Focus:** Community building, new features, and expansion

### Key Deliverables

1. **Community Features**
   - Tournaments and leaderboards
   - Social features and friend lists
   - Community-created content

2. **Additional Game Variants**
   - Japanese Riichi Mahjong
   - American Mahjong
   - Other regional variants

3. **Platform Expansion**
   - Mobile apps (iOS, Android)
   - Desktop applications
   - Potential console versions

4. **Advanced Analytics**
   - Player statistics and insights
   - Game analysis tools
   - Strategy recommendations

### Milestones

- [ ] Community features (August 31, 2025)
- [ ] First additional game variant (September 30, 2025)
- [ ] Mobile app release (October 31, 2025)
- [ ] Advanced analytics (November 30, 2025)

## Resource Allocation

### Development Team

- 2 Frontend Developers
- 2 Backend/Game Logic Developers
- 1 UI/UX Designer
- 1 QA Specialist

### Infrastructure

- Development and testing environments
- CI/CD pipeline
- Analytics and monitoring

### External Dependencies

- Jami SDK integration
- Payment processing services
- LLM API for chatbot functionality

## Risk Assessment

### Technical Risks

1. **Jami Integration Complexity**
   - Mitigation: Early prototyping and testing, fallback options

2. **Distributed State Synchronization**
   - Mitigation: Robust vector clock implementation, extensive testing

3. **Cross-Platform Compatibility**
   - Mitigation: Standard web technologies, responsive design

### Business Risks

1. **User Adoption**
   - Mitigation: Free tier, engaging tutorials, community building

2. **Payment Processing**
   - Mitigation: Multiple payment options, thorough testing

3. **Competitor Response**
   - Mitigation: Unique features, strong community focus

## Success Metrics

1. **User Engagement**
   - Daily active users
   - Session length
   - Return rate

2. **Technical Performance**
   - Connection success rate
   - Game completion rate
   - Error frequency

3. **Business Metrics**
   - Conversion rate to paid tiers
   - Revenue per user
   - Customer acquisition cost

## Conclusion

This roadmap provides a structured plan for the development and launch of MahCheungg. Regular reviews will be conducted to assess progress and make adjustments as needed. The focus on a solid foundation in Phase 1 will enable rapid progress in subsequent phases, leading to a high-quality product with unique features and strong user engagement.
