const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN || 'MTQwNDI0MjU2MjMxNDkyODIxMA.GkVyjH.iY1nLFb-RvKyXcj_5LJcO6l5rMX_JNKDmCorHM';
const CLIENT_ID = '1404242562314928210';

const commands = [
    new SlashCommandBuilder()
        .setName('createvoice')
        .setDescription('Crea un canal de voz temporal')
        .addIntegerOption(option =>
            option.setName('maxusers')
                .setDescription('Número máximo de personas (2-99)')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(99)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('modifyvoice')
        .setDescription('Modifica el canal de voz temporal que has creado')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nuevo nombre para el canal')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('maxusers')
                .setDescription('Nuevo límite máximo de usuarios (2-99)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(99)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('setvoicecategory')
        .setDescription('Selecciona la categoría donde se crearán los canales de voz temporales')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Categoría para los canales de voz')
                .setRequired(true)
                .addChannelTypes(4) // SOLO categorías
        )
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🚀 Registrando comandos globales...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Comandos globales registrados correctamente.');
        console.log('⏳ Puede tardar hasta 1 hora en propagarse en todos los servidores.');
    } catch (error) {
        console.error(error);
    }
})();
