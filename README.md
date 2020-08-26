# About

Utility bot for discord to aid support and development with [discord.js](https://github.com/discordjs/discord.js). Tags are deliberately only occasionally mirrored from the discord.js server, features to modify tags are not planned.

## Commands

The list below uses `!` as placeholder prefix. This prefix may vary based on bot instance and server.

<details>
<summary><b>click to toggle list</b></summary>


### about

Display information about the bot.

Usage: `!about`

### docs

Query discord.js documentation.

Usage: `!docs <query> [--source=<source>] [--force]`   
Source: 'stable', 'master', 'rpc', 'commando', 'collection'   
Flags:
- `--force` `-f` Refresh documentation cache
- `--source=<source>`, `-src=<source>` Provide a source other than the discord.js main repository

Both `Class#method` as well as `Class.method` notations are supported. For functions omit the call signature `()`. The query is case-insensitive.

### help

Display a list of commands or specifics about one command. By default only displays commands you are able to use in this channel, considering user permissions and bot permissions.

Usage1: `!help [--all]`  
Usage2: `!help <command>`  
Flags:
- `--all` `-a` Display all commands, regardless of restrictions

### load

Owner only, load tags from specified .yaml format as applied by the main bot of discord.js official. This command needs to be used with a file upload.

Usage: `!load [--reset]`

Flags:
- `--reset` `-r` Reset the tag database before loading

### ping

Displays the websocket heartbeat and API latency.

Usage: `!ping`

### pr-issue

Display information about a certain issue or pull request.

Usage: `!pr-issue <repository>#<number> [--verbose]`  
Usage: `<repository>#<number> [--verbose]` (in a normal message, without prefix or command)

Flags:
- `--verbose` `-v` Display more information

For now this command requires the bot to be able to use embeds.

### reload

Owner only, reload the tag cache from the database.

Usage: `!reload`

### tag

Shows or searches a tag mirrored from discord.js official (This bot does not allow adding new or modifying tags)

Usage1: `!tag search <query>`   
Usage2: `!tag show <tagname>`   
Usage: `!<tagname>` (in a normal message, with prefix, without command has to be the only content)

</details>

## Getting started

Remove the `.example` suffix from the environment variables files and fill them out. The comments tell you what information is asked for.

# Docker

[What is docker?](https://docs.docker.com/get-started/overview/)

The bot and its Postgres instance are set up with [docker-compose](https://docs.docker.com/compose/). Run 

```
docker-compose up
```
in the root directory to build and run the project.

If you made changes to the source you want to apply to the container pass the `--build` flag. Note that the flag has to come directly after the `up` command.

```
docker-compose up --build
docker-compose up --build bot
```

## Contributing

If you wish to contribute, feel free to fork the repository and submit a pull request. I use [ESLint](https://eslint.org/) to enforce a consistent code style, having that set up in your editor of choice is a great boon for your development process.

```
git clone https://github.com/almostSouji/djs-utils.git
npm install
```

Remember to always lint your edits/additions before making a commit to ensure everything is lined up and consistent with the rest of the codebase. The version with the `:fix` suffix will try to automatically fix fixable style issues.

```
npm run lint
npm run lint:fix
npm run build
```

Try to build the project as well, so the typescript code is compiled and checked.

## Author

**djs-utils** © [almostSouji](https://github.com/almostSouji).  
Authored and maintained by almostSouji.

> GitHub [@almostSouji](https://github.com/almostSouji)
