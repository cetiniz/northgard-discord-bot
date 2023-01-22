import { Client, Constants, Collection } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types/gateway/v10';
import Sequelize from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';
import config from './config.json' assert { type: 'json' };

const {Events} = Constants;

//------------ Northgard Database -----------//
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

//------------ DiscordJS Client -------------//
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, () => {
    console.log(`\nONLINE\n`);
});

//------------ DiscordJS Commands Registery --------//
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//------------- Interaction Create Callback --------------//
client.on(Events.InteractionCreate, async interaction => {
    console.log(interaction);
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

//------------- Message Create Callback --------------//
client.on(Events.MESSAGE_CREATE, async message => {
    console.log(message);
});

client.login(config.BOT_TOKEN);

