const { Client, GatewayIntentBits, PermissionsBitField, Partials } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN || 'MTQwNDI0MjU2MjMxNDkyODIxMA.GkVyjH.iY1nLFb-RvKyXcj_5LJcO6l5rMX_JNKDmCorHM';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

// Mapas para almacenar info
const tempChannels = new Map();           // canalID => userID creador
const voiceCategoryByGuild = new Map();   // guildID => categoriaID

client.once('ready', () => {
    console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'createvoice') {
        const maxUsers = interaction.options.getInteger('maxusers');

        try {
            const categoryId = voiceCategoryByGuild.get(interaction.guildId);

            const channelData = {
                name: `${interaction.user.username} Channel`,
                type: 2, // voz
                userLimit: maxUsers,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            };

            if (categoryId) {
                channelData.parent = categoryId;
            }

            const channel = await interaction.guild.channels.create(channelData);

            tempChannels.set(channel.id, interaction.user.id);

            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (member.voice.channel) {
                await member.voice.setChannel(channel);
                await interaction.reply({ content: `🎤 Canal creado y te moví a **${channel.name}** (máx. ${maxUsers} personas)`, ephemeral: true });
            } else {
                await interaction.reply({ content: `🎤 Canal creado: **${channel.name}** (máx. ${maxUsers} personas). Conéctate al canal para entrar.`, ephemeral: true });
            }

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Error al crear el canal de voz.', ephemeral: true });
        }
    }

    else if (interaction.commandName === 'modifyvoice') {
        const newName = interaction.options.getString('name');
        const newMax = interaction.options.getInteger('maxusers');

        const channelId = [...tempChannels.entries()]
            .find(([chanId, userId]) => userId === interaction.user.id)?.[0];

        if (!channelId) {
            return interaction.reply({ content: '❌ No tienes ningún canal temporal creado para modificar.', ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            tempChannels.delete(channelId);
            return interaction.reply({ content: '❌ El canal ya no existe.', ephemeral: true });
        }

        const updates = {};
        if (newName) updates.name = newName;
        if (newMax !== null && newMax !== undefined) updates.userLimit = newMax;

        if (Object.keys(updates).length === 0) {
            return interaction.reply({ content: '❌ Debes especificar al menos un parámetro para modificar (nombre o máximo usuarios).', ephemeral: true });
        }

        try {
            await channel.edit(updates);
            await interaction.reply({
                content: `✅ Canal modificado correctamente.` +
                    `${newName ? ` Nuevo nombre: **${newName}**.` : ''}` +
                    `${newMax ? ` Nuevo límite: **${newMax}** usuarios.` : ''}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al modificar el canal.', ephemeral: true });
        }
    }

    else if (interaction.commandName === 'setvoicecategory') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Solo administradores pueden usar este comando.', ephemeral: true });
        }

        const category = interaction.options.getChannel('category');

        if (category.type !== 4) {
            return interaction.reply({ content: '❌ Debes seleccionar una categoría válida.', ephemeral: true });
        }

        voiceCategoryByGuild.set(interaction.guildId, category.id);

        return interaction.reply({ content: `✅ Categoría para canales de voz temporales configurada a: **${category.name}**`, ephemeral: true });
    }
});

client.on('voiceStateUpdate', (oldState) => {
    if (oldState.channelId && tempChannels.has(oldState.channelId)) {
        const channel = oldState.guild.channels.cache.get(oldState.channelId);

        if (channel && channel.members.size === 0) {
            channel.delete()
                .then(() => {
                    console.log(`🗑️ Canal temporal eliminado: ${channel.name}`);
                    tempChannels.delete(channel.id);
                })
                .catch(console.error);
        }
    }
});

client.login(TOKEN);
