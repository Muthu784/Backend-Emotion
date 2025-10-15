# Emotion Companion - Backend API

## Overview
Emotion Companion is a backend service that provides emotion analysis and tracking capabilities. It uses AI to detect emotions from text input and allows users to track their emotional state over time. The system is built with Node.js, Express, and integrates with AI models for emotion detection.

## Features

- **Emotion Detection**: AI-powered analysis of text to detect emotions
- **Emotion Tracking**: Record and manage emotional states with timestamps
- **User Authentication**: Secure user management with JWT
- **Chat Integration**: Real-time chat functionality with emotion-aware responses
- **Recommendation Engine**: Get personalized recommendations based on emotional state
- **RESTful API**: Clean and well-documented endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQL (with Sequelize ORM) (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Custom AI service for emotion detection (Hugging Face)
- **CORS**: Enabled for secure cross-origin requests
- **Environment Management**: dotenv

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and get JWT token

### Emotions
- `GET /api/emotions/history` - Get user's emotion history
- `POST /api/emotions/addEmotion` - Add a new emotion entry
- `DELETE /api/emotions/removeEmotion/:id` - Remove an emotion entry
- `GET /api/emotions/analyze` - Analyze text for emotion detection

### Chat
- `POST /api/chat` - Send and receive chat messages with emotion-aware responses

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations based on emotional state

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=your_database_connection_string

HUGGING_FACE_API_KEY=your_hugging_face_api_key

# Add other required environment variables
```

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd Emotion_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see .env.example)

4. Start the development server:
   ```bash
   npm start
   ```

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQL database (e.g., PostgreSQL, MySQL)

### Running Tests
```bash
npm test
```

### Code Style
This project uses ESLint and Prettier for code formatting. Run the following command to check and fix code style:

```bash
npm run lint
```

## Error Handling

The API follows RESTful error handling conventions with appropriate HTTP status codes and error messages in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Rate Limiting

API rate limiting is implemented to prevent abuse. The default limits are:
- 100 requests per 15 minutes per IP for public endpoints
- 1000 requests per 15 minutes per user for authenticated endpoints

## Security

- All API endpoints (except public ones) require authentication via JWT
- Passwords are hashed using bcrypt
- CORS is configured to only allow requests from trusted origins
- Input validation is implemented for all user inputs

## Deployment

1. Set up a production database
2. Update environment variables for production
3. Build the application:
   ```bash
   npm run build
   ```
4. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

Thanks for using Emotion Companion!