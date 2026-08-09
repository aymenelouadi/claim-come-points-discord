# Discord Ticket & Points Bot

A simple Discord bot for ticket claim tracking and point management. The bot uses `discord.js` and stores point/admin data in local JSON files under the `data/` folder.

## Features

- Ticket claim system via buttons in new channels under configured categories.
- Points increment/decrement when users claim or unclaim tickets.
- Slash commands for managing and viewing points.
- Admin and role-based permission checks.
- Local JSON persistence for `points.json` and `admins.json`.
- Support commands for point moderation and direct user messaging.

## Project Structure

- `index.js` - Main bot entry point, command loader, button interaction handlers, ticket creation on channel creation, and prefix admin commands.
- `Commands/` - Slash command handlers:
  - `addpoints.js` -> `/add_points`
  - `come.js` -> `/come`
  - `database.js` -> `/database`
  - `mypoints.js` -> `/mypoints`
  - `resetponits.js` -> `/reset_points`
  - `totalpoints.js` -> `/total_points`
  - `userpoints.js` -> `/user_points`
- `data/` - Persistent bot data files:
  - `points.json` - User points data.
  - `admins.json` - Admin user IDs.
- `.env` - Environment configuration.
- `package.json` - Node package metadata and dependencies.
- `support.txt` - Support / author note.

## Dependencies

- `discord.js` ^14.16.3
- `dotenv` ^16.4.7

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy or update the `.env` file with your bot and server settings.

3. Make sure the `data/points.json` and `data/admins.json` files exist and are valid JSON. Example empty content:

```json
{}
```

4. Start the bot:

```bash
node index.js
```

## Required Environment Variables

The bot uses a `.env` file with the following keys:

- `DISCORD_TOKEN` - Bot token.
- `CLIENT_ID` - Bot application client ID.
- `GUILD_ID` - Server ID (not currently used by the code, but present in `.env`).
- `ALLOWED_USER_IDS` - Comma-separated user IDs allowed to run prefix admin commands (`!addadmin`, `!removeadmin`).
- `CATEGORY_IDS` - Comma-separated category IDs where new ticket channels will receive the claim embed and buttons.
- `ALLOWED_ROLE_ID` - Role ID allowed to use ticket claim buttons.

### Command-specific variables

- `ALLOWED_ROLES` - Role IDs allowed to use `/add_points`.
- `LOG_THREAD_ID` - Thread ID where `/add_points` changes are logged.
- `LOG_THREAD_CHANNEL_ID` - Channel ID where `/come` usage logs are posted.
- `AUTHORIZED_USER_ID` - User ID allowed to use `/database` to download `points.json` or `admins.json`.
- `DATA_FOLDER` - Folder path for `database.js` file access (usually `./data`).
- `POINTS_FILE` - Relative path to `points.json`.
- `ADMINS_FILE` - Relative path to `admins.json`.
- `LOGS_CHANNEL_ID` - Channel ID for `/reset_points` logs.
- `TOTAL_ROLE_ID` - Role allowed to use `/total_points`.
- `ROLE_ID` - Role allowed to use `/user_points`.

## Bot Commands

### Prefix commands

- `!addadmin <userId>` - Add a user ID to `admins.json`.
- `!removeadmin <userId>` - Remove a user ID from `admins.json`.

Only users listed in `ALLOWED_USER_IDS` can run these.

### Slash commands

- `/add_points user:<user> number:<int> choose:<+|-> reason:<text>`
  - Adds or deducts points for a target user.
  - Requires the calling member to have a role in `ALLOWED_ROLES`.
  - Logs the update to `LOG_THREAD_ID`.

- `/come user:<user> message:<text>`
  - Sends a DM to the target user with a link back to the current channel.
  - Logs use to `LOG_THREAD_CHANNEL_ID`.

- `/database file:<points.json|admins.json>`
  - Sends the selected JSON file as an attachment.
  - Only `AUTHORIZED_USER_ID` can use it.

- `/mypoints`
  - Shows the calling user’s current points.

- `/reset_points`
  - Clears all point data in `POINTS_FILE`.
  - Only users listed in `admins.json` may use it.
  - Logs the reset to `LOGS_CHANNEL_ID`.

- `/total_points`
  - Shows a paginated leaderboard of points sorted highest to lowest.
  - Requires the caller to have role `TOTAL_ROLE_ID`.

- `/user_points user:<user>`
  - Shows the selected user’s point total.
  - Requires the caller to have role `ROLE_ID`.

## Ticket Flow

- When a channel is created under any category in `CATEGORY_IDS`, the bot sends a ticket embed with two buttons: `Claim` and `Unclaim`.
- Clicking `Claim` grants the claim to the user, increments their points by `1`, and disables the claim button.
- Clicking `Unclaim` must be done by the user who claimed the ticket and decrements their points by `1`.
- Only members with `ALLOWED_ROLE_ID` can use these buttons.

## Data Files

- `data/points.json` stores user points as a JSON object keyed by Discord user ID.
- `data/admins.json` stores an array of Discord user IDs who can perform reset operations.

Example `points.json` content:

```json
{
  "123456789012345678": 10,
  "234567890123456789": 5
}
```

Example `admins.json` content:

```json
[
  "756947441592303707"
]
```

## Notes

- The bot registers slash commands at startup using `Routes.applicationCommands(process.env.CLIENT_ID)`.
- The code uses `!` prefix commands only for admin add/remove operations.
- The `totalpoints.js` command checks `TOTAL_ROLE_ID`, so that variable must be defined in `.env`.
- Keep the `data/` folder writable for bot persistence.

## Running

```bash
node index.js
```

If you want to reload commands or update your bot configuration, edit `.env` and restart the bot.
