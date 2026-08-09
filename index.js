// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj

const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, Collection, } = require('discord.js');

const POINTS_FILE = path.join(__dirname, 'data', 'points.json');
const ADMINS_FILE = path.join(__dirname, 'data', 'admins.json');

const ALLOWED_USER_IDS = process.env.ALLOWED_USER_IDS.split(',');
const CATEGORY_IDS = process.env.CATEGORY_IDS.split(',');
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const loadPoints = () => (fs.existsSync(POINTS_FILE) ? JSON.parse(fs.readFileSync(POINTS_FILE, 'utf8')) : {});
const savePoints = (points) => fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2), 'utf8');

const getUserPoints = (userId) => loadPoints()[userId] || 0;
const modifyUserPoints = (userId, amount) => {
  try {
    const points = loadPoints();
    points[userId] = Math.max((points[userId] || 0) + amount, 0);
    savePoints(points);
  } catch (error) {
    console.error('❌ Error modifying user points:', error);
  }
};

const loadAdmins = () => (fs.existsSync(ADMINS_FILE) ? JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8')) : []);
const saveAdmins = (admins) => fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), 'utf8');

client.commands = new Collection();
const commandsPath = './Commands';
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = require(`${commandsPath}/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`[Command] Loaded: ${command.data.name}`);
    } else {
      console.warn(`[Command] Skipped: ${file} (missing data or execute function)`);
    }
  } catch (error) {
    console.error(`❌ Error loading command file: ${file}`, error);
  }
}

client.on('messageCreate', async (message) => {
  if (!ALLOWED_USER_IDS.includes(message.author.id)) return;

  // البريفيكس
  if (!message.content.startsWith('!')) return;
  const [command, ...args] = message.content.slice(1).trim().split(/\s+/);

  // اسم الامر للاضافة شخص محدد لليصبح ادمين
  if (command === 'addadmin') {
    if (!args[0]) return message.reply('🚫 Please provide a user ID to add.');

    const userId = args[0];
    const admins = loadAdmins();

    if (admins.includes(userId)) {
      return message.reply('⚠️ This user is already an admin.');
    }

    admins.push(userId);
    saveAdmins(admins);
    return message.reply(`✅ User <@${userId}> has been added as an admin.`);
  }

  // اسم الامر للازالة شخص محدد من الادمين
  if (command === 'removeadmin') {
    if (!args[0]) return message.reply('🚫 Please provide a user ID to remove.');

    const userId = args[0];
    const admins = loadAdmins();

    if (!admins.includes(userId)) {
      return message.reply('⚠️ This user is not an admin.');
    }

    const updatedAdmins = admins.filter((id) => id !== userId);
    saveAdmins(updatedAdmins);
    return message.reply(`✅ User <@${userId}> has been removed from admins.`);
  }
});


const registerCommands = async () => {
  const commands = client.commands.map((cmd) => cmd.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('🚀 Refreshing application (/) commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Failed to reload commands:', error);
  }
};

const claimCooldowns = new Map();

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return interaction.reply({ content: 'Command not found!', ephemeral: true });

      await command.execute(interaction);
    }

    if (interaction.isButton()) {
      const { customId, user, member, message } = interaction;

      if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return interaction.reply({ content: 'ليس لديك صلاحية لاستعمال هذه الأزرار.', ephemeral: true });
      }

      const userId = user.id;
      const now = Date.now();
      const cooldown = 10 * 60 * 1000; // 10 دقائق

      if (customId === 'claim') {
        if (claimCooldowns.has(userId)) {
          const lastClaimTime = claimCooldowns.get(userId);
          const timeLeft = cooldown - (now - lastClaimTime);

          if (timeLeft > 0) {
            const minutesLeft = Math.ceil(timeLeft / 60000);
            return interaction.reply({
              content: `🚫 لا يمكنك استلام تذكرة جديدة الآن! انتظر ${minutesLeft} دقيقة.`,
              ephemeral: true
            });
          }
        }

        claimCooldowns.set(userId, now);
        modifyUserPoints(userId, 1);

        const embed = EmbedBuilder.from(message.embeds[0])
          .setDescription(`تم استلام التذكرة من طرف ${user}.`)
          .setThumbnail(user.displayAvatarURL());

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('claim')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(`unclaim_${userId}`)
            .setLabel('Unclaim')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false)
        );

        await interaction.update({
          components: [buttons],
          embeds: [embed],
          content: `${user} تم استلام التذكرة.`,
        });
      }

      if (customId.startsWith('unclaim_')) {
        const claimedUserId = customId.split('_')[1];
        if (userId !== claimedUserId) {
          return interaction.reply({ content: 'فقط المستلم يمكنه الضغط على هذا الزر.', ephemeral: true });
        }

        modifyUserPoints(userId, -1);

        const embed = EmbedBuilder.from(message.embeds[0])
          .setDescription(`تم سحب استلام التذكرة من طرف ${user}.`)
          .setThumbnail(user.displayAvatarURL());

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('claim')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId(`unclaim_${userId}`)
            .setLabel('Unclaim')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        await interaction.update({
          components: [buttons],
          embeds: [embed],
          content: `${user} تم سحب استلام التذكرة.`,
        });
      }
    }
  } catch (error) {
    console.error('❌ Error handling interaction:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'حدث خطأ أثناء معالجة طلبك.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'حدث خطأ أثناء معالجة طلبك.', ephemeral: true });
    }
  }
});


client.on('channelCreate', async (channel) => {
  try {
    if (CATEGORY_IDS.includes(channel.parentId)) {
      setTimeout(async () => {
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('نظام التذاكر')
          .setDescription('استخدم الأزرار لاستلام التذكرة أو سحبها.')
          .setFooter({ text: 'Bot by: Shaad You', iconURL: client.user.displayAvatarURL() });
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('unclaim').setLabel('Unclaim').setStyle(ButtonStyle.Danger).setDisabled(true)
        );

        await channel.send({ embeds: [embed], components: [buttons] });
        console.log(`Embed sent successfully in channel: ${channel.name}`);
      }, 5000);
    }
  } catch (error) {
    console.error('❌ Error in channelCreate event:', error);
  }
});

client.on('channelDelete', async (channel) => {
  try {
    console.log(`⚠️ Channel deleted: ${channel.name}. Bot is still running.`);
  } catch (error) {
    console.error('❌ Error in channelDelete event:', error);
  }
});

client.once('ready', () => {
  console.log(`✅ Bot is online as (Code Nexus = https://discord.gg/Tpwgkj9gzj) ${client.user.tag}`);
});

(async () => {
  try {
    await registerCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
  }
})();

// Bot by Shaad You | 756947441592303707
// Server Support => https://discord.gg/Tpwgkj9gzj