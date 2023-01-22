import { SlashCommandBuilder } from '@discordjs/builders';

const DraftCommand = {
    DRAFT: 'draft',
    START: 'start',
    STOP: 'stop',
    RESTART: 'restart',
    SELECT: 'select',
};

export default {
    data: new SlashCommandBuilder()
    .setName('draft')
    .setDescription('Provides information about the user.')
    .addSubcommand(subcommand =>
        subcommand
        .setName(DraftCommand.START)
        .setDescription('Start a new Northgard draft!'))
    .addSubcommand(subcommand =>
        subcommand
        .setName(DraftCommand.STOP)
        .setDescription('Stop the northgard draft!'))
    .addSubcommand(subcommand =>
        subcommand
        .setName(DraftCommand.RESTART)
        .setDescription('Restart the northgard draft (with the same captains)!'))
    .addSubcommand(subcommand =>
        subcommand
        .setName(DraftCommand.SELECT)
        .setDescription('Select a member for your Northgard team'))
    .addSubcommand(subcommand =>
        subcommand
        .setName('select')
        .setDescription('Select a member for your Northgard team')),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case DraftCommand.START: {
            }
            case DraftCommand.STOP: {
            }
            case DraftCommand.RESTART: {
            }
            case DraftCommand.SELECT: {
            }
            default: {
            }
        }
        const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		await interaction.reply(`Banning ${target.username} for reason: ${reason}`);
		await interaction.guild.members.ban(target);
    },
};
