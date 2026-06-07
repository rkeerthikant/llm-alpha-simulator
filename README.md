# LLM Alpha Simulator: Proof of Concept

This repository is an end-to-end proof of concept that includes a React frontend, a Node server, and an optional GenAI integration.

View the live app in AI Studio: https://ai.studio/apps/15d8afdf-cc40-4f3a-bfe3-b9958998f997

## Run locally

Prerequisite: Node.js

1. Install dependencies:
    `npm install`
2. (Optional) Add your Gemini API key to `.env.local` as `GEMINI_API_KEY`. Without it, the project uses the local rule-based simulator.
3. Start the development server:
    `npm run dev`

## Demo: end-to-end walkthrough

Below is a short demo recording and three screenshots that illustrate the PoC behavior.

Demo recording (click to play):

<div align="center">
   <video src="assets/videos/LLM_Alpha_Demo_Recording.mp4" poster="assets/screenshots/ss1.jpg" controls width="900">Your browser does not support the video tag.</video>
</div>

Screenshots:

- Home screen

   ![Home screen](assets/screenshots/ss1.jpg)

- Pre-market macro feed and sentiment

   ![Pre-market macro feed](assets/screenshots/ss2.jpg)

- Performance and benchmarking

   ![Performance and benchmarking](assets/screenshots/ss3.jpg)


