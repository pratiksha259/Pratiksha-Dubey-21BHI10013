# Chess-Like Turn-Based Game

## Description

This project is a turn-based chess-like game that utilizes WebSocket communication for real-time multiplayer interaction. The game features various character types, including Pawns and Heroes,  and is designed to be engaging and interactive

## Features

- **Movement History:** A list of moves made by players with descriptions like 'A moved its pawn' or 'B moved its hero.'
- **Turn-Based Gameplay:** Players take turns to make moves with their selected characters.
- **Player Turn Indication:** The game clearly indicates whose turn it is, ensuring smooth gameplay.
- **WebSocket Communication:** Real-time interaction between players.
- **Game End Popup:** A popup is displayed when one player wins by eliminating all the pawns of the other player, with an option to restart the game.

## Characters and Movement

There are three types of characters available:

1. **Pawn:**
   - Moves one block in any direction (Left, Right, Forward, or Backward).
   - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).

2. **Hero1:**
   - Moves two blocks straight in any direction.
   - Kills any opponent's character in its path.
   - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).

3. **Hero2:**
   - Moves two blocks diagonally in any direction.
   - Kills any opponent's character in its path.
   - Move commands: `FL` (Forward-Left), `FR` (Forward-Right), `BL` (Backward-Left), `BR` (Backward-Right).


## Getting Started

To get started with this project, follow these instructions:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pratiksha259/Pratiksha-Dubey-21BHI10013.git
2. **Instal Dependencies**
   ```bash
   cd your-repository
   npm install
