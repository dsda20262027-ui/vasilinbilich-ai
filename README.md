# ВасилинБилич AI

Desktop AI assistant with chat and image generation.

Architecture:
VasilinBilichAI.exe -> your API server -> OpenAI -> your API server -> EXE

The OpenAI API key is kept only on the server.

## Local development

1. Install Node.js 20+.
2. Copy .env.example to .env and add your OpenAI API key.
3. Run npm install.
4. Start the API server with npm run server.
5. Start the desktop app with npm start.

The desktop app defaults to http://localhost:8787. The server address can be changed in Settings.

## Windows build

GitHub Actions builds a portable single-file Windows executable named VasilinBilichAI.exe.

Before exposing the production server publicly, add proper authentication, HTTPS and a production-grade rate limiter.

GitHub repository:
https://github.com/dsda20262027-ui/vasilinbilich-ai
