# ASTRA-2.0

An AI assistant with voice interaction, memory, self-evolving code, and more.

## Overview

ASTRA-2.0 is a comprehensive AI assistant platform built with a modular architecture. It integrates conversational memory, voice capabilities, knowledge management, and self-improvement mechanisms.

Key features include:
- 💬 Conversational memory with ChatGPT integration
- 🎙️ Voice input/output using ElevenLabs
- 🧠 Knowledge graph for structured memory
- 📄 File ingestion and learning
- 🔄 Self-evolving code engine
- 😊 Animated avatar with emotion rendering
- 📧 Email and calendar integration
- 📅 Daily summaries and mood tracking
- 👥 Multi-user support

## Architecture

The system is built with the following architecture:

- **Next.js/Node.js Backend**: Handles API routes, services, and core functionality
- **React Frontend**: Provides the user interface with components for chat, dashboard, etc.
- **Supabase/PostgreSQL**: Stores structured data and knowledge using pgvector for embeddings
- **Paperspace VM**: Hosts the application and provides file storage
- **OpenAI API**: Powers the conversational intelligence
- **ElevenLabs API**: Provides speech-to-text and text-to-speech capabilities
- **Google APIs**: Integrates with Gmail and Calendar

## Project Structure

```
astra-2.0/
├── config/               # Configuration files
├── server/               # Backend
│   ├── api/              # API routes
│   ├── services/         # Core services (voice, chat, etc.)
│   ├── models/           # Database models
│   ├── utils/            # Utility functions
│   └── middleware/       # Middleware
├── client/               # Frontend
│   ├── components/       # UI components
│   ├── pages/            # Next.js pages
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Frontend utils
│   └── styles/           # CSS/Tailwind styles
├── scripts/              # Utility scripts
└── tests/                # Tests
```

## Core Services

### OpenAI Service
Handles interaction with the OpenAI API for generating responses, embeddings, and knowledge extraction.

### ElevenLabs Service
Manages voice input and output using the ElevenLabs API for speech-to-text and text-to-speech.

### Knowledge Service
Maintains the knowledge graph, processes text for knowledge extraction, and provides querying capabilities.

### File Service
Handles file upload, processing, and content extraction for various file types.

### Code Engine
Enables the system to suggest, apply, and roll back code improvements.

### Google Service
Integrates with Gmail and Google Calendar for email and scheduling capabilities.

### Daily Summary Service
Generates and sends daily summary emails with activity recaps and insights.

### Emotion Service
Tracks and analyzes emotional states for both the user and the assistant.

## Installation & Setup

### Prerequisites
- Node.js 16+
- PostgreSQL with pgvector extension
- Paperspace account (or another hosting solution)
- API keys for OpenAI, ElevenLabs, and Google

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/astra-2.0.git
cd astra-2.0
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your API keys and configuration
```

4. Set up the database:
```bash
npx supabase init
# Run the schema creation script
npx supabase db execute -f server/database/schema.sql
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### Chat Interface
The main interface for interacting with Astra. You can type messages or use voice input to communicate with the assistant.

### Dashboard
View analytics, knowledge graph visualization, and system metrics.

### Files
Upload and manage files that Astra can learn from.

### Terminal
Access a terminal interface for direct server manipulation.

### Settings
Configure Astra's behavior, voice settings, and notification preferences.

## Self-Evolving Code Engine

One of Astra's unique features is its ability to improve its own code. The process works as follows:

1. The system identifies areas for improvement or the user suggests changes
2. The code engine generates suggestions using the OpenAI API
3. The changes are tested in a sandbox environment
4. If tests pass, the changes can be applied (with user approval)
5. If tests fail, the changes are automatically rolled back
6. All changes are logged and included in the daily summary

## Daily Summaries

Astra sends a daily summary email at 6am with:
- Chat highlights
- New knowledge acquired
- Emotional trends
- Email and calendar summary
- Code changes

## Multi-User Support

The system supports multiple users with data isolation through Supabase's Row-Level Security. Each user's conversations, files, and knowledge are kept separate.

## Deployment

### Paperspace Setup

1. Create a Paperspace VM or Gradient Notebook
2. Clone the repository on the VM
3. Install dependencies and set up environment variables
4. Use PM2 or a similar tool to keep the application running

### GitHub CI/CD

The project includes GitHub Actions workflows for continuous integration and deployment to Paperspace.

## API Routes

- `/api/chat`: Process chat messages
- `/api/voice/transcribe`: Transcribe speech to text
- `/api/files/upload`: Upload and process files
- `/api/code/improve`: Generate and apply code improvements
- `/api/terminal/socket`: WebSocket endpoint for terminal access

## Future Work

Potential extensions for the project:
- Advanced sentiment analysis for voice
- Real-time streaming responses
- Vision capabilities for image recognition
- Mobile app integration
- Collaboration between Astra instances
- Plugin architecture for additional functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your License Here]
