// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, } = require('discord.js');
require('dotenv').config();

const LOG_THREAD_CHANNEL_ID = process.env.LOG_THREAD_CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    // اسم الامر
    .setName('come')
    .setDescription('إرسال رسالة إلى المستخدم مع مرجع للقناة والرسالة.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('المستخدم الذي سيتم إرسال الرسالة إليه')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('الرسالة التي سيتم إرسالها')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const user = interaction.options.getUser('user');
      const message = interaction.options.getString('message');
      const channel = interaction.channel;
      const messageLink = `https://discord.com/channels/${interaction.guild.id}/${channel.id}/${interaction.id}`;

      try {
        await user.send('test');
      } catch (error) {
        return await interaction.editReply({
          content:
            '🚫 لا يمكن إرسال الرسائل الخاصة لهذا المستخدم. قد يكون قد أغلق الرسائل الخاصة أو لا يسمح للبوت بذلك.',
          ephemeral: false,
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('شخص ما أرسل لك هذه الرسالة تعال تحقق')
        .setDescription(`إليك الرسالة الموجهة إليك:\n\`\`\`${message}\`\`\``)
        .addFields(
          { name: 'منشن الغرفة', value: `<#${channel.id}>`, inline: true },
          {
            name: 'رابط الرسالة',
            value: `[توجه إلى الرابط الرسالة](${messageLink})`,
            inline: true,
          }
        )
        .setTimestamp();

      const button = new ButtonBuilder()
        .setLabel('توجه إلى الرسالة')
        .setStyle(ButtonStyle.Link)
        .setURL(messageLink);

      const row = new ActionRowBuilder().addComponents(button);
      await user.send({ embeds: [embed], components: [row] });

      await interaction.editReply({
        content: `✅ تم إرسال الرسالة إلى ${user.tag}.`,
      });

      const logEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('استخدام أمر /come')
        .addFields(
          {
            name: 'المستخدم الذي قام بالامر',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: true,
          },
          {
            name: 'المستخدم المستلم',
            value: `${user.tag} (${user.id})`,
            inline: true,
          },
          {
            name: 'الرسالة المرسلة',
            value: `\`\`\`${message}\`\`\``,
            inline: false,
          },
          {
            name: 'الغرفة المستخدمة فيها الامر',
            value: `<#${channel.id}>`,
            inline: true,
          },
          {
            name: 'رابط الرسالة',
            value: `[رابط الرسالة](${messageLink})`,
            inline: true,
          },
          { name: 'CODE NEXUS', value: new Date().toLocaleString(), inline: false }
        )
        .setTimestamp();

      const threadChannel = await interaction.guild.channels.fetch(LOG_THREAD_CHANNEL_ID);

      if (threadChannel) {
        await threadChannel.send({ embeds: [logEmbed] });
      } else {
        console.warn(`⚠️ تعذر العثور على القناة بمعرف ${LOG_THREAD_CHANNEL_ID}.`);
      }
    } catch (error) {
      console.error('❌ حدث خطأ أثناء تنفيذ أمر /come:', error);

      if (error.message.includes('Unknown interaction')) {
        await interaction.editReply({
          content: '❌ التفاعل غير معروف. يرجى المحاولة لاحقاً.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: '❌ حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.',
          ephemeral: true,
        });
      }
    }
  },
};

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj