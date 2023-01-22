const Discord = require('discord.js');
import Sequelize from 'sequelize';

const fs = require('fs');
const config = require('./config.json');


//------------ Northgard Database -----------//
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

//------------ DiscordJS Client -------------//
const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, () => {
    console.log(`\nONLINE\n`);
});

//------------ DiscordJS Commands Registery --------//
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
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


client.on('message', msg => {
    if (msg.content.startsWith(config.PREFIX)) {
        const commandBody = msg.content.substring(config.PREFIX.length).split(' ');
        const channelName = commandBody[1];

        if (commandBody[0] === ('enter') && commandBody[1]) {
            const voiceChannel = msg.guild.channels.cache.find(channel => channel.name === channelName);

            if (!voiceChannel || voiceChannel.type !== 'voice')
                return msg.reply(`The channel #${channelName} doesn't exist or isn't a voice channel.`);

            console.log(`Sliding into ${voiceChannel.name}...`);
            voiceChannel.join()
                .then(conn => {

                    const dispatcher = conn.play('./sounds/ding.mp3');
                    dispatcher.on('start', () => { console.log('ding.mp3 is playing..'); });
                    dispatcher.on('finish', () => { console.log('ding.mp3 has finished playing..'); });
                    console.log(`Joined ${voiceChannel.name}!\n\nREADY TO RECORD\n`);

                    const receiver = conn.receiver;
                    conn.on('speaking', (user, speaking) => {
                        if (speaking) {
                            console.log(`${user.username} started speaking`);
                            const audioStream = receiver.createStream(user, { mode: 'pcm' });
                            audioStream.pipe(createNewChunk());
                            audioStream.on('end', () => { console.log(`${user.username} stopped speaking`); });
                        }
                    });
                })
                .catch(err => { throw err; });
        }
        if (commandBody[0] === ('exit') && commandBody[1]) {
            const voiceChannel = msg.guild.channels.cache.find(channel => channel.name === channelName);
            if (!voiceChannel || voiceChannel.type !== 'voice') {
                return msg.reply(`The channel #${channelName} doesn't exist or isn't a voice channel.`);
            }
            else {
                voiceChannel.leave();
                console.log(`Slipping out of ${voiceChannel.name}...`);
                console.log(`\nSTOPPED RECORDING\n`);
            }
        }
    }
});

client.login(config.BOT_TOKEN);

