# WobBotfet
A Discord Bot designed to add a platform for text-based multiplayer games

# Run
Run using `$ node bot.js`. A valid authentican token is needed to properly connect to Discord's API. One can be obtained <a href=https://discordapp.com/developers/>here</a> from Discord by creating a new application.

# Dependencies
Make sure you have Node.js and npm installed before anything.

    "discord.js": "^11.3.2",
    "eslint": "^5.3.0",
    "ffmpeg": "0.0.4",
    "opusscript": "0.0.6",
    "winston": "^3.0.0"
    
# Features/Commands
WobBotfet currently supports Connect4 and some voice channel easter eggs that you may find entertaining.

Challenge someone in the server to Connect4:

`c!connect4 @<username>`

Challenge bot to Connect4 (it's not really good):

`c!connect4 @<botname>`

Drop token on specified column number (if multiple ongoing games, must specify opponent):

`c!col <column number> (@<opponent>)`

Forfeit the game (if multiple ongoing games, must specify opponent):

`c!forfeit (@<opponent>)`

View a list of opponents for your ongoing games:

`c!games`

Recall an ongoing game (if multiple ongoing games, must specify opponent):

`c!recall (@<opponent>)`
    
# Bugs
From time to time, the bot will throw an unhandledRejection error. The direct cause is still an issue I am debugging, but it seems to be related to making too many commands in a short period of time.
