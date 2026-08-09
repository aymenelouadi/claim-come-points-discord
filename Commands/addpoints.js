// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ALLOWED_ROLES = process.env.ALLOWED_ROLES.split(',');
const LOG_THREAD_ID = process.env.LOG_THREAD_ID;

const POINTS_FILE = path.join(__dirname, '..', 'data', 'points.json');

const loadPoints = () => (fs.existsSync(POINTS_FILE) ? JSON.parse(fs.readFileSync(POINTS_FILE, 'utf8')) : {});
const savePoints = (points) => fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2), 'utf8');

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('add_points')
    .setDescription('إضافة أو خصم نقاط من المستخدم.')
    .addUserOption((option) =>
      option.setName('user').setDescription('المستخدم المطلوب إضافة/خصم النقاط له.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('number').setDescription('عدد النقاط المطلوب إضافتها أو خصمها.').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('choose')
        .setDescription('اختيار إضافة أو خصم النقاط.')
        .setRequired(true)
        .addChoices(
          { name: 'إضافة (+)', value: '+' },
          { name: 'خصم (-)', value: '-' }
        )
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('سبب الإضافة/الخصم.').setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const hasPermission = interaction.member.roles.cache.some((role) => ALLOWED_ROLES.includes(role.id));
      if (!hasPermission) {
        return interaction.editReply({ content: '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.' });
      }

      const user = interaction.options.getUser('user');
      const number = interaction.options.getInteger('number');
      const choose = interaction.options.getString('choose');
      const reason = interaction.options.getString('reason');

      if (!user || number <= 0) {
        return interaction.editReply({ content: '❌ تأكد من إدخال مستخدم صحيح وعدد نقاط أكبر من 0.' });
      }

      const points = loadPoints();

      const userId = user.id;
      if (!points[userId]) points[userId] = 0;

      if (choose === '+') {
        points[userId] += number;
      } else if (choose === '-') {
        points[userId] = Math.max(points[userId] - number, 0);
      }

      savePoints(points);

      const userEmbed = new EmbedBuilder()
        .setColor(choose === '+' ? '#57F287' : '#ED4245')
        .setTitle('🔄 تحديث النقاط')
        .setDescription(
          `**${choose === '+' ? 'تمت إضافة النقاط' : 'تم خصم النقاط'} للمستخدم التالي:**\n<@${userId}>`
        )
        .addFields(
          { name: '🔢 عدد النقاط:', value: `${number}`, inline: true },
          { name: '📋 السبب:', value: reason, inline: true },
          { name: '📊 النقاط الحالية:', value: `${points[userId]} نقطة`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'CODE NEXUS', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [userEmbed] });

      const logThread = await interaction.guild.channels.fetch(LOG_THREAD_ID);

      if (logThread && logThread.isThread()) {
        const logEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📝 سجل النقاط')
          .setDescription('تم تسجيل عملية تعديل نقاط')
          .addFields(
            { name: '🧑 المستخدم المستهدف:', value: `<@${userId}>`, inline: true },
            { name: '👤 بواسطة:', value: `<@${interaction.user.id}>`, inline: true },
            { name: '🔢 عدد النقاط:', value: `${number}`, inline: true },
            { name: '📋 السبب:', value: reason, inline: false },
            { name: '📊 النقاط بعد التعديل:', value: `${points[userId]} نقطة`, inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `CODE NEXUS`, iconURL: interaction.client.user.displayAvatarURL() })
          .setTimestamp();

        await logThread.send({ embeds: [logEmbed] });
      } else {
        console.warn(`⚠️ تعذر العثور على الـ Thread بمعرف ${LOG_THREAD_ID}.`);
      }
    } catch (error) {
      console.error('❌ حدث خطأ أثناء تنفيذ الأمر:', error);
      await interaction.editReply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر. حاول مرة أخرى لاحقًا.' });
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj