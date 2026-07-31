const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
//dotenv
const dotenv = require("dotenv");
dotenv.config();
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

//importacao dos comandos
const fs = require("node:fs");
const path = require("node:path");
const comandsPath = path.join(__dirname, "comands");
const comandFiles = fs
  .readdirSync(comandsPath)
  .filter((file) => file.endsWith(".js"));
 
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.comands = new Collection();

for (const file of comandFiles) {
  const filePath = path.join(comandsPath, file);
  const comand = require(filePath);
  if ("data" in comand && "execute" in comand) {
    client.comands.set(comand.data.name, comand);
  } else {
    console.log(
      `Esse caminho em ${filePath} está com "data" ou "execute" ausentes`,
    );
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Pronto! Login realizado como ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.comands.get(interaction.commandName);

  if (!command) {
    console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Ocorreu um erro ao executar esse comando!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Ocorreu um erro ao executar esse comando!', ephemeral: true });
    }
  }
});

client.login(TOKEN);
