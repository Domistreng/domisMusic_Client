# Domis Music – Client

Domis Music (Client) is a front-end application for real-time music practice and analysis using microphone input, score-following, and AI-powered sheet music scanning.

## Overview

Domis Music Client records audio from the microphone (without normalizing the signal) to preserve performance nuances for detailed musical analysis. The app visualizes pitch, rhythm, intonation, dynamics, and technique while synchronizing with digital sheet music that follows the performance automatically.

## Features

- Microphone recording: Capture raw audio input without normalization to retain natural dynamics and tone color.  
- Performance analysis: Analyze pitch, rhythm, intonation, dynamics, and technique characteristics such as vibrato.  
- Score following: Automatically scroll and align the on-screen sheet music with the live or recorded performance, removing the need for manual page turns or button presses.  
- AI camera sheet capture: Use the device camera to photograph printed sheet music and convert it into a digital, MIDI-based representation.  
- Visual feedback: Display interactive graphs, indicators, and overlays driven by backend analysis for more effective practice sessions.  

## Tech Stack

- **Frontend**: Likely built with a modern web or mobile framework (e.g., React/React Native/Expo or similar).  
- Audio capture: Uses native or browser audio APIs to record raw microphone audio for processing by the backend.  
- Computer vision / AI: Integrates with a model or service to detect and interpret photographed sheet music into structured musical data (e.g., MIDI).  
- API integration: Communicates with the Domis Music backend for analysis results, score data, and user metrics.  

## Getting Started

Clone the client repository and install dependencies:

```bash
git clone https://github.com/Domistreng/domisMusic_Client
cd domis-music-client
npm install
# or
yarn install
