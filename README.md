# Digital Twin App

A React frontend for the Digital Twin API that generates hot take responses via audio and video with multiple personas.

## Features

- **Multi-persona Selection**: Choose from various personas including Chad Goldstein, Alfred Lin, Kanu Gulati, and Leigh Braswell
- **Real-time Processing**: Job-based processing with status polling
- **API Integration**: Full integration with FastAPI backend
- **Health Monitoring**: Real-time API status indicator
- **History Management**: Save and replay previous interactions
- **Audio/Video Support**: Generate audio and video responses
- **File Upload**: Process audio/video files
- **Quick Roasts**: Generate quick roasts on topics

## API Integration

The frontend is now fully integrated with the FastAPI backend and supports:

### Endpoints Used

- `GET /health` - Health check
- `GET /personas` - List available personas
- `POST /process-text` - Process text input
- `POST /quick-roast` - Generate quick roast
- `POST /process-file` - Process uploaded files
- `GET /job/{job_id}` - Get job status
- `GET /download/{filename}` - Download generated files

### Key Features

1. **Job-based Processing**: All requests are processed asynchronously with job IDs
2. **Real-time Status Polling**: Automatically polls job status and updates UI
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **API Health Monitoring**: Shows real-time API status in the UI
5. **Persona Management**: Dynamically loads available personas from the API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- FastAPI backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Ensure the FastAPI backend is running on `http://localhost:8000`

### Configuration

The API base URL is configured via environment variables:

1. **Local Development**: Create a `.env` file:
```bash
cp env.example .env
# Edit .env and set REACT_APP_API_BASE_URL=http://localhost:8000
```

2. **Production**: Set the environment variable in your deployment platform:
```bash
REACT_APP_API_BASE_URL=https://your-backend-app.fly.dev
```

**Environment Variables:**
- `REACT_APP_API_BASE_URL`: The URL of your FastAPI backend

## Usage

1. **Choose Twins**: Select one or more personas to generate responses
2. **Describe Prompt**: Enter your idea or topic for the personas to respond to
3. **View Results**: See real-time streaming responses and generated content

## Personas

The app includes several pre-configured personas:

- **Chad Goldstein** (chad_goldstein): The Pitch Surgeon - Scalpel-precise teardown, founder-friendly
- **Alfred Lin** (alfred_lin): The Term Sheet Ninja - Quiet, fast, deadly to messy decks
- **Kanu Gulati** (kanu_gulati): The Builder's Whisperer - Hands-on feedback for real traction
- **Leigh Braswell** (leigh_braswell): The Early Signal - Pre-PMF radar, tastefully early

## Technical Details

### State Management

- Uses React hooks for state management
- Job polling with `useEffect` and `setInterval`
- Local storage for session history

### API Communication

- RESTful API calls using `fetch`
- FormData for file uploads
- JSON for structured data

### Error Handling

- Network error detection
- API health monitoring
- Graceful fallbacks for offline scenarios
- User-friendly error messages

## Development

### File Structure

```
src/
├── digital-twin-frontend.tsx  # Main component
├── App.js                     # App entry point
└── index.js                   # React entry point
```

### Key Components

- `DigitalTwinsDemoUI`: Main application component
- `TwinAvatar`: Persona avatar component
- `StepHeader`: Step navigation header
- `Container`: Main layout container

## Troubleshooting

### Common Issues

1. **API Connection Failed**: Check if the FastAPI backend is running on port 8000
2. **Jobs Not Completing**: Check the browser console for error messages
3. **Personas Not Loading**: Verify the `/personas` endpoint is accessible

### Debug Mode

Enable debug logging by checking the browser console for detailed API communication logs.

## Deployment

### Fly.io Deployment

1. **Build the app**:
```bash
npm run build
```

2. **Set environment variables** in Fly.io:
```bash
fly secrets set REACT_APP_API_BASE_URL=https://your-backend-app.fly.dev
```

3. **Deploy**:
```bash
fly deploy
```

### Environment Variables for Production

- `REACT_APP_API_BASE_URL`: Must point to your deployed backend URL
- Example: `https://digital-twin-backend.fly.dev`

### Important Notes

- The frontend and backend are deployed as separate services
- CORS must be configured on the backend to allow requests from the frontend domain
- Environment variables must be set before building the app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
