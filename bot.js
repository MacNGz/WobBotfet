/* Add my bot to your channel: 
 * https://discordapp.com/oauth2/authorize?&client_id=476811566495563777&scope=bot&permissions=0
 */

process.env.UV_THREADPOOL_SIZE = 128;

var Discord = require('discord.js');
var logger = require('winston');
// Authentication token is needed to properly deploy the bot. 
// One can be obtained from Discord's developer website.
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client()
bot.login(auth.token).catch(console.error);

// GAMES DICTIONARY
var GAMES = {};

function Player(playerID) {
    this.playerID = playerID;
    this.numGames = 0;
    this.games = {};
}

function Connect4(player1, player2) {
    // 6x7
    this.board = [];
    this.num_rows = 6;
    this.num_cols = 7;
    this.player1 = player1;
    this.player2 = player2;
    this.player1Marker = 'X';
    this.player2Marker = '0';
    this.emptyMarker = "_"
    this.whoseTurn = player1;
    this.resetBoard();

}

function mention(userID) {
    return "<@" + userID + ">";
}

Connect4.prototype.checkTurn = function() {
    return this.whoseTurn;
}

Connect4.prototype.switchTurn = function() {
    if (this.whoseTurn === this.player1) {
        this.whoseTurn = this.player2;
    }
    else {
        this.whoseTurn = this.player1;
    }
}

// Sets marker at position in board to marker type of current player
Connect4.prototype.setMarker = function(numRow, numCol) {
    if (this.whoseTurn === this.player1) {
        this.board[numRow][numCol] = this.player1Marker;
    }
    else {
        this.board[numRow][numCol] = this.player2Marker;
    }
}

// adds the marker to the top of the given column, unless it's full
Connect4.prototype.dropMarker = function(charCol) {
    charCol = charCol.toLowerCase();
    if (charCol.length != 1 || charCol.charCodeAt(0) < 97 || charCol.charCodeAt(0) > (97 + this.num_cols - 1)) {
        // Error: invalid move
        return -1;
    }
    var numCol = this.charToIndex(charCol);
    if (this.getColHeight(numCol) >= this.num_rows) {
        // Error: invalid move
        return -2
    }
    this.setMarker(this.num_rows - this.getColHeight(numCol) - 1, numCol);

    return this.getColHeight(numCol);
    
}

// Returns the number of markers that have already been dropped in given column
Connect4.prototype.getColHeight = function(numCol) {
    for(var row = this.num_rows - 1; row >= 0; --row) {
        if (this.board[row][numCol] == this.emptyMarker) {
            return this.num_rows - row - 1;
        }
    }
    return this.num_rows;
}

// Converts the character form of a column to its 0-indexed integer form
Connect4.prototype.charToIndex = function(charCol) {

    return  charCol.charCodeAt(0) - 'a'.charCodeAt(0);
}

Connect4.prototype.gameWon = function() {
    if (this.fourInRow() || this.fourInCol() || this.fourInDiag()) {
        return true;
    }
    return false;
}

Connect4.prototype.fourInRow = function() {
    if (this.num_cols < 4) {
        return false;
    }

    for (var row = 0; row < this.num_rows; ++row) {
        let count = 1;
        let check = this.board[row][0]; 

        for (var col = 1; col < this.num_cols; ++col) {
            if (this.board[row][col] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[row][col];
            }
            if (count >= 4) { 
                return true;
            }
        }
    }

    return false;
    
}

Connect4.prototype.fourInCol = function() {
    if (this.num_rows < 4) {
        return false;
    }

    for (var col = 0; col < this.num_cols; ++col) {
        let count = 1;
        let check = this.board[0][col];

        for (var row = 1; row < this.num_rows; ++row) {
            if (this.board[row][col] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[row][col];
            }
            if (count >= 4) {
                return true;
            }
        }
    }

    return false;
}

Connect4.prototype.fourInDiag = function() {
    if (this.num_cols < 4 || this.num_rows < 4) {
        return false;
    }

    // forward slash diagonals: /
    for (var row = 3; row < this.num_rows; ++row) {
        let rowNum = row;
        let col = 0;
        let count = 1;
        let check = this.board[rowNum--][col++];

        while (rowNum >= 0 && col < this.num_cols) {
            if (this.board[rowNum][col] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[rowNum][col];
            }
            if (count >= 4) {
                return true;
            }

            --rowNum;
            ++col;
        }
    }

    for (var col = 1; col < this.num_cols - 3; ++col) {
        let colNum = col;
        let row = this.num_rows - 1;
        let count = 1;
        let check = this.board[row--][colNum++];

        while (colNum < this.num_cols && row >= 0) {
            if (this.board[row][colNum] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[row][colNum];
            }
            if (count >= 4) {
                return true;
            }

            --row;
            ++colNum;
        }
    }

    // backslash diagonals: \
    for (var row = this.num_rows - 4; row >= 0; --row) {
        let rowNum = row;
        let col = 0;
        let count = 1;
        let check = this.board[rowNum++][col++];

        while (rowNum < this.num_rows && col < this.num_cols) {
            if (this.board[rowNum][col] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[rowNum][col];
            }
            if (count >= 4) {
                return true;
            }

            ++col;
            ++rowNum;
        }
    }

    for (var col = 1; col < this.num_cols - 3; ++col) {
        let colNum = col;
        let row = 0;
        let count = 1;
        let check = this.board[row++][colNum++];

        while (colNum < this.num_cols && row < this.num_rows) {
            if (this.board[row][colNum] == check && check != this.emptyMarker) {
                ++count;
            }
            else {
                count = 1;
                check = this.board[row][colNum];
            }
            if (count >= 4) {
                return true;
            }

            ++colNum;
            ++row;
        }
    }

    return false;
}


Connect4.prototype.getPlayer1 = function() {
    return this.player1;
}

Connect4.prototype.getPlayer2 = function() {
    return this.player2;
}

Connect4.prototype.resetBoard = function() {
    this.board = [];
    var row = [];
    // var i = 0                sets i to 0
    // i < this.num_cols        check if true
    // ++i                      add 1 to i after each loop
    
    // Before: row: []
  
    for(var i = 0; i < this.num_cols; ++i) {
        row.push(this.emptyMarker);
    }
  
    // After: row: [_, _, _, _, _, _, _]

    // Before: board: []
  
    for(var j = 0; j < this.num_rows; ++j) {
        this.board.push(Array.from(row)); 
    }

}

Connect4.prototype.getBoard = function() {
    var boardString = "```prolog\n";

    for(var col = 0; col < this.num_cols - 1; ++col) {
        boardString += String.fromCharCode('a'.charCodeAt(0) + col) + " ";
    }
    boardString += String.fromCharCode('a'.charCodeAt(0) + this.num_cols - 1) + '\n';

    for(var i = 0; i < this.num_rows; ++i) {
        for(var j = 0; j < this.num_cols - 1; ++j) {
            boardString += this.board[i][j] + '|'
        }
        boardString += this.board[i][this.num_cols -1];
        boardString += '\n';
    }

    return boardString + "```";
}


// GAMES {player1 : {player2 : id, [games]}, ...}
// GAMES[player1] --> Player object for player1
// player1: key for GAMES
// GAMES[player1].games --> dictionary of games player1 is involved in, with key being other player

// returns existing game instance, or throws appropriate error
function getExistingGame(player1, player2) {

    if (player2 === undefined) {
        if (!(player1 in GAMES) || GAMES[player1].numGames === 0) {
            console.log("hi1")
            return "no_games_exist";
        }
        else if (GAMES[player1].numGames > 1) {
            console.log("hi2")
            return "multiple_games_exist";
        }
        else {
            let player2 = Object.keys(GAMES[player1].games)[0];
            console.log("hi3")
            return GAMES[player1].games[player2];
        }
    }

    if (player1 in GAMES) {
        if (player2 in GAMES[player1].games) {
            console.log("hi4")
            return GAMES[player1].games[player2];
        }
        else {
            console.log("hi5")
            return "no_such_game";
        }
    }
    else {
        console.log("hi6")
        return "no_games_exist";
    }   
}

function newGame(player1, player2) {
    var gameInstance = new Connect4(player1, player2);

    if (!(player1 in GAMES)) {
        GAMES[player1] = new Player(player1);
    }
    GAMES[player1].games[player2] = gameInstance;
    GAMES[player1].numGames += 1;

    if (!(player2 in GAMES)) {
        GAMES[player2] = new Player(player2);
    }
    GAMES[player2].games[player1] = gameInstance;
    GAMES[player2].numGames += 1;

    return gameInstance;
}

function deleteGame(game){
    p1 = game.player1;
    p2 = game.player2;
    delete GAMES[p1].games[p2];
    GAMES[p1].numGames -= 1;
    GAMES[p2].numGames -= 1;
}

function getActiveGames(player) {
    if (!(player in GAMES) || (GAMES[player].numGames === 0)) {
        return null;
    }
    return GAMES[player].games;
}

function printBoard(GAME, message) {

    let currentPlayer = GAME.player1;
    let otherPlayer = GAME.player2;

    if (GAME.checkTurn() != currentPlayer) {
        currentPlayer = GAME.player2;
        otherPlayer = GAME.player1;
    }

    let currentPlayerUsername = mention(currentPlayer);
    let otherPlayerUsername = mention(otherPlayer);
    //let otherPlayerUsername = bot.users.get(otherPlayer).username;
    boardString = GAME.getBoard();

    let turnString = currentPlayerUsername + "'s turn to play against " + otherPlayerUsername;
    message.channel.send(turnString + '\n' + boardString).catch(console.error);
}

function printWinner(GAME, message) {
    boardString = GAME.getBoard();
    message.channel.send(boardString).catch(console.error);
    message.channel.send(mention(GAME.checkTurn()) + " wins!").catch(console.error);
}

function printChallenge(GAME, challengee, message) {
    boardString = GAME.getBoard();
    message.channel.send(mention(challengee) + " " + message.author.username + " has challenged you to Connect 4.").catch(console.error);
    message.channel.send(boardString).catch(console.error);
}

function wob(message) {
    console.log("works");
    var channel = message.member.voiceChannel;
    if (channel != undefined) {
        channel.join()
        .then(connection => {
            const dispatcher = connection.playArbitraryInput('http://peal.io/download/0o4ek')
            dispatcher.on('end', () => {
                channel.leave()
            });
        }).catch(err => console.log(err));
    }

}


(function(){
    console.log("Memory usage in MB: " + process.memoryUsage().heapUsed/1024/1024);
    setTimeout(arguments.callee, 10000);
})();


bot.on('ready', function (evt) {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.user.username + ' - (' + bot.user.id + ')');
});


bot.on('message', function (message) {

    // MESSAGE: c!ping avada kedavra
    if (message.content.substring(0, 2) === 'c!') {
        // args = [ping, avada, kedavra]
        var args = message.content.substring(2).split(' ');
        // cmd = ping
        var cmd = args[0];
        // args = [avada, kedavra]
        args = args.splice(1);
        switch(cmd) {
            case 'connect4':
                if (args.length < 1) {
                    message.reply("Please specify an opponent.").catch(console.error);
                    break;
                }

                var p1 = message.author.id;
                var p2 = args[0].replace(/[<@!>]/g, '')

                var GAME = getExistingGame(p1, p2);
                // no game exists
                if (Object.prototype.toString.call(GAME) === "[object String]") {
                    GAME = newGame(p1, p2);
                }
                else {
                    message.reply("Game already exists. Please finish existing game or forfeit.").catch(console.error);

                    printBoard(GAME, message);
                    break;
                }

                printChallenge(GAME, p2, message);
                break;

            case 'accept':
                // add functionality later (will probably need countdown timer)
                message.reply("ok").catch(console.error);
                break;

            case 'col':
                // ERROR CHECKS
                var p1 = message.author.id;
                var p2 = undefined;
                if (args.length >= 2) {
                    p2 = args[1].replace(/[<@!>]/g, '')
                }
                var GAME = getExistingGame(p1, p2);

                if (Object.prototype.toString.call(GAME) === "[object String]") {
                    console.log(GAME);
                    if (GAME === "no_games_exist") {
                        message.reply("You need to start a game first.").catch(console.error);
                        break;
                    }
                    else if (GAME === "no_such_game") {
                        message.reply("No such game exists between you and this player").catch(console.error);
                        break;
                    }
                    else if (GAME === "multiple_games_exist") {
                        message.reply("You have multiple game instances. Please specify your opponent.").catch(console.error);
                        break;
                    }
                }

                if (GAME.checkTurn() != message.author.id || args.length < 1) {
                    break;
                }

                var charCol = args[0];
                var status = GAME.dropMarker(charCol);

                if (GAME.gameWon()) {
                    printWinner(GAME, message);
                    deleteGame(GAME);
                    break;
                }
                else {
                    GAME.switchTurn();
                    console.log("Game status: " + status);
                    printBoard(GAME, message);
                }

                // controls for bot
                if (GAME.checkTurn() === bot.user.id) {
                    charCol = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * GAME.num_cols));
                    var status = GAME.dropMarker(charCol);

                    if (GAME.gameWon()) {
                        printWinner(GAME, message);
                        deleteGame(GAME);
                        break;
                    }
                    else {
                        GAME.switchTurn();
                        console.log("Game status: " + status);

                        printBoard(GAME, message);
                    }
                }
                break;

            case 'id':
                message.reply(message.author.username + " " + message.author.id).catch(console.error);
                break;

            case 'forfeit':
                // ERROR CHECKS
                var p1 = message.author.id;
                var p2 = undefined;
                if (args.length >= 1) {
                    p2 = args[0].replace(/[<@!>]/g, '')
                }
                var GAME = getExistingGame(p1, p2);

                if (Object.prototype.toString.call(GAME) === "[object String]") {
                    console.log(GAME);
                    if (GAME === "no_games_exist") {
                        message.reply("You have no games to forfeit.").catch(console.error);
                        break;
                    }
                    else if (GAME === "no_such_game") {
                        message.reply("No such game exists between you and this player").catch(console.error);
                        break;
                    }
                    else if (GAME === "multiple_games_exist") {
                        message.reply("You have multiple game instances. Please specify your opponent.").catch(console.error);
                        break;
                    }
                }

                let winner = p1 === GAME.player1 ? GAME.player2 : GAME.player1;
                boardString = GAME.getBoard();
                message.channel.send(boardString).catch(console.error);
                message.channel.send(mention(p1) + " forfeits. " + mention(winner) + " wins!").catch(console.error);
                deleteGame(GAME);
                break;

            case 'recall':
                // ERROR CHECKS
                var p1 = message.author.id;
                var p2 = undefined;
                if (args.length >= 1) {
                    p2 = args[0].replace(/[<@!>]/g, '')
                }
                var GAME = getExistingGame(p1, p2);

                if (Object.prototype.toString.call(GAME) === "[object String]") {
                    console.log(GAME);
                    if (GAME === "no_games_exist") {
                        message.reply("You have no games to recall.").catch(console.error);
                        break;
                    }
                    else if (GAME === "no_such_game") {
                        message.reply("No such game exists between you and this player").catch(console.error);
                        break;
                    }
                    else if (GAME === "multiple_games_exist") {
                        message.reply("You have multiple game instances. Please specify your opponent.").catch(console.error);
                        break;
                    }
                }
                printBoard(GAME, message);
                break;

            case 'games':
                var player = message.author.id;

                const gamesList = getActiveGames(player);
                if (gamesList === null) {
                    message.reply("You have no active games.").catch(console.error);
                    break;
                }
                var opponents = "\n";
                for (const key of Object.keys(gamesList)) {
                    var opponent = bot.users.get(key);
                    opponents += (opponent.username + '\n')
                }

                message.reply(opponents).catch(console.error);

                break;

            case 'wob':
                wob(message);
                break;

            default:
                message.reply("lol, that's not a command").catch(console.error);
                break;
         }
     }
});

bot.on('voiceStateUpdate', function(oldMember, newMember) {

    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if (oldMember.voiceChannel === undefined && 
        newMember.voiceChannel != undefined &&
        oldMember.id != bot.user.id) {

        let channel = newUserChannel;
        channel.join()
        .then(connection => {
            const dispatcher = connection.playArbitraryInput('http://peal.io/download/0o4ek')
            dispatcher.on('end', () => {
                channel.leave()
            });
        }).catch(err => console.log(err));
    }


});


// TODO: debug the issue of unhandledRejection errors bering raised
//process.on('unhandledRejection', console.error);




