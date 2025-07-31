# AI Prompt Manager

A full-stack web application for managing and generating AI prompts. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- **Prompt Generator**: Create custom AI prompts with various parameters
- **Prompt Management**: CRUD operations for saved prompts
- **Responsive Design**: Works on desktop and mobile devices
- **Search & Filter**: Easily find prompts by title, content, or category
- **Copy to Clipboard**: One-click copy of generated prompts

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-prompt-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=4000
NODE_ENV=development
```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4000
   ```

## Available Scripts

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Project Structure

```
├── src/
│   ├── database/         # Database configuration
│   ├── routes/          # API routes
│   ├── tests/           # Test files
│   └── server.js        # Main server file
├── public/              # Frontend files
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   ├── index.html       # Main page
│   └── generator.html   # Prompt generator page
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

- `GET /api/prompts` - Get all prompts
- `GET /api/prompts/:id` - Get a specific prompt
- `POST /api/prompts` - Create a new prompt
- `PUT /api/prompts/:id` - Update a prompt
- `DELETE /api/prompts/:id` - Delete a prompt

## Testing

Run the test suite with:

```bash
npm test
```

## Docker

Build and run the application using Docker:

```bash
docker build -t ai-prompt-manager .
docker run -p 4000:4000 ai-prompt-manager
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
