# MATH Stickman Challenge

## Overview

MATH Stickman Challenge is a premium mobile math quiz game built with Expo (React Native) and an Express backend, aligned with the MATATAG curriculum. Players face timed math problems (addition, subtraction, multiplication, division and fractions) while managing a unique survival mechanic. Instead of a health bar, the stickman is held aloft by **5 vibrant balloons**. Every wrong answer or timeout triggers a paper airplane attack that pops a balloon. Lose all 5 balloons, and the game is over!

## Features & Progress

- **Dynamic Game Mechanics**:
  - **Balloon System**: 5 attempts represented by floating balloons.
  - **Attack Animations**: Paper airplanes dive in to pop balloons on incorrect answers.
  - **Difficulty Scaling**: Easy (60s), Average (45s), and Difficult (30s) modes.
- **Shop & Customization**:
  - **Balloon Skins**: Customize your look with unique balloon themes including Penguin, Dog, Cat, Bunny, Bear, Star, Heart, etc.
  - **Accessories**: Choose from diverse sets including Cool Caps, Robot Helmets, Hero Capes, and varied outfits/footwear.
  - **Magic Shop**: Purchase consumable power-ups like Balloon Revival Potion(restore balloons) or Aurora Pause Powder (freeze time).
- **Competitve Edge**:
  - **Global Leaderboard**: Compete in the "Hall of Fame" across multiple categories: Coins collected, Classic levels reached, and Survival high scores (Easy/Average/Hard).
- **Social & Security**:
  - **Authentication**: Secure login via Supabase or quick play with Guest mode.
  - **Ad Integration**: Rewarded and Interstitial ads via Google Mobile Ads.
- **Premium Design**:
  - **Animations**: Smooth transitions using React Native Reanimated.
  - **Soundscape**: Immersive audio effects and multiple curated soundtracks created by GEMINI.
  - **Haptics**: Tactile feedback for every interaction.

## System Architecture

### Frontend (Expo / React Native)
- **Framework**: Expo SDK 54 with expo-router.
- **Key Screens**:
  - Dashboard & Mode Selection
  - Core Game Loop (Math problems, Balloons, Power-ups)
  - Global Hall of Fame
  - Customization & Magic Shop
- **State Management**: Zustand with persistent storage for coins and inventory.
- **Visuals**: React Native SVG for the modular Stickman and Balloon systems.

### Game Logic
- **Survival Mode**: Infinite questions with increasing streak multipliers.
- **Classic Mode**: 10 questions per level to progress through the map.
- **Math Engine**: Generates curriculum-aligned problems across addition, subtraction, multiplication, division and fractions.

### Backend & Database
- **Runtime**: Node.js with Express and TypeScript.
- **Persistence**: Hybrid approach using local SQLite (via Drizzle) for offline state and Supabase for global syncing and leaderboards.
- **Migrations**: SQL-based migrations for maintaining user sessions and leaderboard rankings.

## External Dependencies
- **Expo SDK 54** & **React Native**
- **React Native Reanimated**: High-performance animations.
- **React Native SVG**: Vector-based character and skin rendering.
- **Supabase**: Real-time database and authentication.
- **Express**: Backend API services.
- **Google Mobile Ads**: Monetization layer.

## Future Plans
- Add more levels and challenges.
- Add more characters and skins.
- Add more power-ups.
- Add more game modes.
- Add more features.
