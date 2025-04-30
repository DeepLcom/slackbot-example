# DeepL Slack Translation Bot

[![License: MIT](https://img.shields.io/badge/license-MIT-blueviolet.svg)](https://github.com/DeepLcom/deepl-mcp-server/blob/main/LICENSE)

A Slack bot that provides real-time translation capabilities using DeepL's translation API. Users can translate messages directly within Slack using commands or shortcuts.

## Features

- `/translate` command for direct text translation
- Message shortcut for translating existing messages
- Customizable target language and formality settings
- Interactive message editing before sending
- Persistent user preferences

## Requirements

- Node.js version 18 or higher
- A DeepL API authentication key (Free or Pro account)
- Slack workspace with appropriate permissions

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
DEEPL_API_KEY=your_deepl_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_APP_TOKEN=your_slack_app_token
```

4. Start the bot:

```bash
npm run dev
```

## Usage

### Commands

- `/translate [text]` - Translate text to your configured target language
- `/settings` - Configure your translation preferences (target language and formality)

### Shortcuts

- Message shortcut: Right-click any message to translate it

### Settings

Configure your preferences using the `/settings` command:
- Target Language: Choose your preferred translation language
- Formality: Select between Automatic, Formal, or Informal translation style

User settings are automatically persisted in `db.json`.

## Development

### Environment Variables

Using .env file:
- Copy `.env.example` to `.env`
- Edit `.env` with your credentials
- The `.env` file will not be committed to git

## License

This project is licensed under the MIT License - see the LICENSE file for details. 