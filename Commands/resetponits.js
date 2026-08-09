// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const POINTS_FILE = path.resolve(__dirname, '..', process.env.POINTS_FILE);
const ADMINS_FILE = path.resolve(__dirname, '..', process.env.ADMINS_FILE);
const LOGS_CHANNEL_ID = process.env.LOGS_CHANNEL_ID;

const loadAdmins = () => {
  if (fs.existsSync(ADMINS_FILE)) {
    return JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8')) || [];
  }
  return [];
};

const saveAdmins = (admins) => {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), 'utf8');
};

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('reset_points')
    .setDescription('Reset all points data (admin-only).'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const userId = interaction.user.id;

      const allowedUsers = loadAdmins();
      if (!allowedUsers.includes(userId)) {
        return interaction.editReply({
          content: '🚫 You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      fs.writeFileSync(POINTS_FILE, JSON.stringify({}, null, 2), 'utf8');

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Points Reset')
        .setDescription('✅ All points data have been successfully reset.')
        .addFields({ name: 'Reset By', value: `<@${userId}>`, inline: true })
        .setFooter({ text: 'CODE NEXUS', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      const logsChannel = interaction.client.channels.cache.get(LOGS_CHANNEL_ID);
      if (logsChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Points Reset Log')
          .setDescription(`🔄 All points data were reset by <@${userId}>.`)
          .setTimestamp();

        logsChannel.send({ embeds: [logEmbed] });
      } else {
        console.warn('⚠️ Logs channel not found.');
      }
    } catch (error) {
      console.error('❌ Error in /reset_points command:', error);
      await interaction.editReply({
        content: 'An error occurred while resetting points. Please try again later.',
      });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj