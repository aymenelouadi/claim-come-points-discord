// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const AUTHORIZED_USER_ID = process.env.AUTHORIZED_USER_ID;
const DATA_FOLDER = path.resolve(__dirname, '..', process.env.DATA_FOLDER);

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('database')
    .setDescription('Get a specific data file from the database (points.json or admins.json).')
    .addStringOption((option) =>
      option
        .setName('file')
        .setDescription('The file to download (points.json or admins.json).')
        .setRequired(true)
        .addChoices(
          { name: 'points.json', value: 'points.json' },
          { name: 'admins.json', value: 'admins.json' }
        )
    ),

  async execute(interaction) {
    try {
      if (interaction.user.id !== AUTHORIZED_USER_ID) {
        return interaction.reply({
          content: '🚫 You are not authorized to use this command.',
          ephemeral: false,
        });
      }

      const fileName = interaction.options.getString('file');
      const filePath = path.join(DATA_FOLDER, fileName);

      if (!fs.existsSync(filePath)) {
        return interaction.reply({
          content: `🚫 The file ${fileName} does not exist.`,
          ephemeral: false,
        });
      }

      await interaction.reply({
        content: `📂 Here is the ${fileName} file:`,
        files: [filePath],
        ephemeral: true,
      });
    } catch (error) {
      console.error('❌ Error in /database command:', error);
      await interaction.reply({
        content: 'An error occurred while retrieving the file. Please try again later.',
        ephemeral: false,
      });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj