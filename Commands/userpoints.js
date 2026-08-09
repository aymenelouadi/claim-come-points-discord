// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const POINTS_FILE = path.resolve(__dirname, '..', process.env.POINTS_FILE);
const ROLE_ID = process.env.ROLE_ID;

const loadPoints = () => {
  if (fs.existsSync(POINTS_FILE)) {
    return JSON.parse(fs.readFileSync(POINTS_FILE, 'utf8')) || {};
  }
  return {};
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user_points')
    .setDescription('Get the points of a specified user.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to check points for')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const hasRole = interaction.member.roles.cache.has(ROLE_ID);

      if (!hasRole) {
        return interaction.reply({
          content: '🚫 You do not have the required role to use this command.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const user = interaction.options.getUser('user');
      if (!user) {
        return interaction.editReply({
          content: '🚫 You must specify a valid user.',
          ephemeral: true,
        });
      }

      const points = loadPoints();
      const userPoints = points[user.id] || 0;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`User Points for ${user.tag}`)
        .setDescription(`📊 Points: ${userPoints}`)
        .setFooter({
          text: 'CODE NEXUS | POINT SYSTEM',
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Error in /user_points command:', error);
      await interaction.editReply({
        content: 'An error occurred while retrieving points. Please try again later.',
        ephemeral: true,
      });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj