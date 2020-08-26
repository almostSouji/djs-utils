# About

Utility bot for discord to aid support and development with [discord.js](https://github.com/discordjs/discord.js).

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
