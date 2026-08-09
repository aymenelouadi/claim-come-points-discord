// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const POINTS_FILE = path.resolve(__dirname, '..', process.env.POINTS_FILE);
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID;

const loadPoints = () =>
  fs.existsSync(POINTS_FILE) ? JSON.parse(fs.readFileSync(POINTS_FILE, 'utf8')) : {};

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('total_points')
    .setDescription('عرض النقاط بالترتيب من الأعلى إلى الأقل (10 مستخدمين لكل صفحة).'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(TOTAL_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 ليس لديك الصلاحية لاستخدام هذا الأمر.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const points = loadPoints();
      const sortedUsers = Object.entries(points)
        .sort(([, aPoints], [, bPoints]) => bPoints - aPoints)
        .map(([userId, points]) => ({ userId, points }));

      if (sortedUsers.length === 0) {
        return interaction.editReply({ content: '❌ لا توجد نقاط مسجلة حاليًا.' });
      }

      const pageSize = 10;
      let currentPage = 0;
      const totalPages = Math.ceil(sortedUsers.length / pageSize);

      const generateEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageData = sortedUsers.slice(start, end);

        const topUser = sortedUsers[0];

        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🏆 ترتيب النقاط')
          .setThumbnail(
            interaction.guild.members.cache.get(topUser.userId)?.user.displayAvatarURL() || null
          )
          .setDescription(
            pageData
              .map((user, index) => `**${start + index + 1}. <@${user.userId}>** - \`${user.points} نقطة\``)
              .join('\n')
          )
          .setFooter({
            text: `الصفحة ${page + 1} من ${totalPages}`,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        return embed;
      };

      const generateButtons = (page) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1)
        );
      };

      const embed = generateEmbed(currentPage);
      const buttons = generateButtons(currentPage);

      const message = await interaction.editReply({
        embeds: [embed],
        components: [buttons],
      });

      const collector = message.createMessageComponentCollector({
        filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
        time: 60000,
      });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.customId === 'prev_page') {
          currentPage = Math.max(currentPage - 1, 0);
        } else if (btnInteraction.customId === 'next_page') {
          currentPage = Math.min(currentPage + 1, totalPages - 1);
        }

        const updatedEmbed = generateEmbed(currentPage);
        const updatedButtons = generateButtons(currentPage);

        await btnInteraction.update({
          embeds: [updatedEmbed],
          components: [updatedButtons],
        });
      });

      collector.on('end', () => {
        const disabledButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );

        message.edit({ components: [disabledButtons] });
      });
    } catch (error) {
      console.error('❌ Error executing /total_points command:', error);
      return interaction.editReply({ content: 'حدث خطأ أثناء تنفيذ الأمر.' });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj