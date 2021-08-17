const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "oluştur",
  run: async (client, message, args) => {
    var btn = new MessageButton()
    .setStyle('gray')
    .setLabel('')
    .setEmoji('📨')
    .setID('oluşturucu');
    var row = new MessageActionRow()
    .addComponents([btn]);
    var embed = new MessageEmbed()
    .setTitle('Ticket Oluşturucu')
    .setDescription('📨 Ticket oluşturmak için aşağıdaki butona tıkla!')
    .setColor('#5555dd')
    .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.channel.send({ embed: embed, components: [ row ] });
  }
}