# MATH Stickman Challenge

## Overview

MATH Stickman Challenge is a mobile math quiz game built with Expo (React Native) and an Express backend. Aligned with the MATATAG curriculum by DepEd for Grade 1. Players choose a difficulty level (Easy, Average, Difficult) and answer timed math problems (addition, subtraction up to 3 digits; multiplication and division of 1-digit numbers). The stickman starts fully drawn and loses body parts with each wrong answer (legs first, then arms, then head rolls off). 5 attempts total. Results are shown at the end.

## Features & Progress

- **Authentication**: Guest mode or local user accounts stored via Supabase (SQLite in-app for now).
- **Character Shop**: Earn coins by answering questions correctly. Spend coins to buy hats, glasses, shirts, and shoes to customize your Stickman.
- **Magic Shop**: Buy consumable power-ups:
  - **Pixie Patch Potion**: Heals 1 body part
  - **Moonlit Minute Dust**: Adds 30s to the timer (with floating +30s animation)
  - **Aurora Pause Powder**: Freezes time for 30s (with falling snowflakes and cyan countdown)
  - **Hinting Firefly**: Reveals a digit of the answer
- **Color scheme**: Green primary (#2ECC71), Yellow secondary (#F1C40F), Baby pink tertiary (#FFB6C1), Purple (#9b59b6) for scribbling.
- **Stickman mechanic**: Starts complete, loses parts on wrong answers (legs -> arms -> head rolls off).
- **Timer**: Easy=60s, Average=45s, Difficult=30s.

## System Architecture

### Frontend (Expo / React Native)
- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Screens**: Three main screens managed by expo-router Stack navigation
  - `app/index.tsx` — Home/difficulty selection screen
  - `app/auth.tsx` — Registration and login
  - `app/shop.tsx` — Character and Magic Shop for spending coins
  - `app/game.tsx` — Active game screen with math problems, timer, stickman, number pad, and power-up buttons
  - `app/results.tsx` — Results summary screen
- **Animations**: react-native-reanimated for smooth animations (floating shapes, stickman shake, head rolling, timer pulse, snowflakes)
- **Audio**: expo-audio for sound effects (ping, go, tick, purchase)
- **Fonts**: Fredoka font family via @expo-google-fonts
- **Haptics**: expo-haptics for tactile feedback
- **State Management**: Zustand with AsyncStorage persistence for tracking coins, accessories, high scores, and power-up inventory (`hooks/useGameState.ts`)
- **Database**: Local SQLite and Supabase for user persistence (`lib/db.ts`)
- **Key Components**:
  - `Stickman` — SVG stickman that loses body parts on wrong answers.
  - `NumberPad` — Custom numeric input pad
  - `Timer` — Circular countdown timer with color changes
  - `Snowflakes` — Falling snow animation for the time freeze effect
  - `ScribbleArea` — Drawing canvas for scratchpad math

### Game Logic (`lib/math-engine.ts`)
- Generates random math problems based on difficulty
- Difficulty affects number ranges and time limits:
  - Easy: 1-digit add/sub, 60s per question, 10 questions
  - Average: 2-digit add/sub, 45s per question, 12 questions
  - Difficult: 3-digit add/sub, 30s per question, 15 questions
- Multiplication & division always 1-digit numbers regardless of difficulty
- Operations: addition, subtraction, multiplication, division

### Backend (Express)
- **Runtime**: Node.js with Express, TypeScript compiled via tsx (dev) or esbuild (prod)
- **Entry point**: `server/index.ts`
- **Routes**: `server/routes.ts` — currently minimal, set up for `/api` prefixed routes
- **CORS**: Configured for dev/deployment domains and localhost
- **Static serving**: In production, serves built Expo web assets; in dev, proxies to Metro bundler

### Build & Deployment
- **Dev mode**: Two processes — `expo:dev` for Metro bundler and `server:dev` for Express
- **Production**: `expo:static:build` creates static web build, `server:build` bundles server with esbuild, `server:prod` serves everything

### Path Aliases
- `@/*` maps to project root
- `@shared/*` maps to `./shared/*`

## External Dependencies

- **Expo SDK 54**: Core mobile framework with numerous Expo modules
- **React Native Reanimated**: Animation library for performant UI animations
- **React Native SVG**: Used for the Stickman component
- **@expo-google-fonts/fredoka**: Custom font loading
- **expo-haptics**: Native haptic feedback
- **expo-linear-gradient**: Gradient backgrounds
- **Express**: HTTP server framework
