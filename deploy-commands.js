require('dotenv').config(); // Carga las variables del archivo .env
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Cargar comandos
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene "data" o "execute".`);
        }
    }
}

// Registrar comandos
const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Iniciando recarga de ${commands.length} comandos de aplicación.`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Comandos recargados correctamente.');
    } catch (error) {
        console.error(error);
    }
})();
