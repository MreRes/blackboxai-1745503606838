
Built by https://www.blackbox.ai

---

```markdown
# Financial WhatsApp Bot

## Project Overview
The **Financial WhatsApp Bot** is a robust financial management tool that operates through WhatsApp, complete with a user-friendly web interface. This bot allows users to manage their finances easily while leveraging the popular messaging platform's capabilities to provide immediate feedback and interaction.

## Installation
To set up the project, you can use the provided installation script which will install all the necessary dependencies for the frontend, backend, and WhatsApp bot components.

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd financial-whatsapp-bot
   ```

2. Install all dependencies:
   ```bash
   npm run install-all
   ```

## Usage
To start the development environment, run the following command:

```bash
npm run dev
```

This command will concurrently run the backend, frontend, and WhatsApp bot in development mode.

To build the project for production, you can use:
```bash
npm run build
```

To start the backend server, simply use:
```bash
npm start
```

## Features
- **WhatsApp Integration**: Interact with users through WhatsApp for real-time financial management.
- **Web Interface**: A user-friendly web interface to manage financial data.
- **Concurrency**: Run frontend, backend, and WhatsApp components simultaneously for a seamless development experience.
- **Build and Deployment**: Easy commands for building the project for production.

## Dependencies
The following dependencies are required for the project:

- **Dev Dependencies**:
  - `concurrently`: ^8.2.0 — Used to run multiple commands concurrently in the development mode.

## Project Structure
Here's a brief overview of the project structure:

```
financial-whatsapp-bot/
├── backend/            # Contains the backend server code
├── frontend/           # Contains the frontend application code
├── whatsapp-bot/       # Contains the WhatsApp bot code
├── .gitignore          # Specifies files and directories to ignore in the repository
├── package.json        # Project configuration and dependencies
└── README.md           # Project documentation
```

This structure divides the project into distinct components (backend, frontend, and WhatsApp bot) for better organization and maintainability.

---

Feel free to contribute to this project by submitting issues or pull requests!
```