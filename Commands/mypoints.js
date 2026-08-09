// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const POINTS_FILE = path.join(__dirname, '..', 'data', 'points.json');

const loadPoints = () => (fs.existsSync(POINTS_FILE) ? JSON.parse(fs.readFileSync(POINTS_FILE, 'utf8')) : {});

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('mypoints')
    .setDescription('Check your current points.'),
  
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const userId = interaction.user.id;
      const points = loadPoints();
      const userPoints = points[userId] || 0;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Your Points')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'User', value: `<@${userId}>`, inline: true },
          { name: 'Points', value: `${userPoints} points`, inline: true }
        )
        .setFooter({ text: 'CODE NEXUS', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Error in /mypoints command:', error);
      await interaction.editReply({ content: 'An error occurred while retrieving your points. Please try again later.' });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj