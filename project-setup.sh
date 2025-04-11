#!/bin/bash
# ASTRA-2.0 Project Setup Script

# Create project directory structure
mkdir -p astra-2.0/config
mkdir -p astra-2.0/server/api
mkdir -p astra-2.0/server/services
mkdir -p astra-2.0/server/models
mkdir -p astra-2.0/server/utils
mkdir -p astra-2.0/server/middleware
mkdir -p astra-2.0/client/components
mkdir -p astra-2.0/client/pages
mkdir -p astra-2.0/client/hooks
mkdir -p astra-2.0/client/utils
mkdir -p astra-2.0/client/styles
mkdir -p astra-2.0/scripts
mkdir -p astra-2.0/tests

# Initialize git repository
cd astra-2.0
git init

# Create base configuration files
cat > config/default.js << EOL
/**
 * Default configuration for ASTRA-2.0
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  
  // API keys (these should be set in environment variables in production)
  apis: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_REDIRECT_URL,
    },
  },
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  
  // Default personality settings for Astra
  astra: {
    systemPrompt: "You are Astra, an AI assistant with an ethereal pixel face and a helpful demeanor. You have access to the user's files, calendar, and emails. You can also execute code to improve yourself.",
    voiceId: "your-default-elevenlabs-voice-id",
  },
};
EOL

# Create README.md
cat > README.md << EOL
# ASTRA-2.0

An AI assistant with voice, memory, self-evolution, and more.

## Features

- Conversational memory with ChatGPT integration
- Voice input/output using ElevenLabs
- Knowledge graph for structured memory
- File ingestion and learning
- Self-evolving code engine
- Animated avatar with emotion rendering
- Email and calendar integration
- Daily summaries and mood tracking
- Multi-user support

## Getting Started

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Set up environment variables (see .env.example)
4. Start the development server: \`npm run dev\`

## Environment Setup

This project requires:
- Node.js/Next.js
- Supabase (PostgreSQL)
- API keys for OpenAI, ElevenLabs, Google APIs

## Architecture

The system follows a modular design with:
- Paperspace VM for hosting
- Supabase for structured data storage
- File system for raw file storage
- Memory graph for knowledge representation

## License

[Your License Here]
EOL

# Create .env.example
cat > .env.example << EOL
# Server
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Google APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/google/callback

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
EOL

# Create .gitignore
cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOL

echo "Project structure has been created successfully!"
