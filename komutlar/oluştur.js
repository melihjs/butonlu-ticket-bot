const { MessageButton } = require('discord-buttons');

module.exports = {
  name: "oluştur",
  run: async (client, message, args) => {
    var evt = new MessageButton()
    .setStyle('green')
    .setLabel('Evet')
    .setID('evt');
    var hyr = new MessageButton()
    .setStyle('red')
    .setLabel('Hayır')
    .setID('hyr');
    var ticketChannelName = `ticket-${message.author.id}`;
    return message.channel.send('Ticket oluşturmak istediğine emin misin?', { buttons: [ evt, hyr ] }).then(async (msg) => {
      var filter = ma => ma.clicker.user.id == message.author.id;
      var cl = msg.createButtonCollector(filter);
      cl.on('collect', async (button) => {
        if (button.id == "evt") {
          button.reply.send('Ticket oluşturuluyor...', true);
          try {
            button.message.guild.channels.create(ticketChannelName, {
              type: 'text',
              parent: '869943251443003472',
              permissionOverwrites: [
                {
                  id: message.guild.id,
                  deny: ['VIEW_CHANNEL']
                },
                {
                  id: button.clicker.user.id,
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                }
              ]
            }).then(async (ch) => {
              var lck = new MessageButton()
              .setStyle('grey')
              .setLabel(' ')
              .setEmoji('🔒')
              .setID('lock');
              ch.send(`<@${button.clicker.user.id}> Eğer ticketı kapatıcaksan, :lock: butonuna bas!`, { buttons: [ lck ] }).then(async (mss) => {
                var filter = me => me.clicker.user.id == message.author.id;
                var cd = mss.createButtonCollector(filter);
                cd.on('collect', async (btn) => {
                  if (btn.id == "lock") {
                    var channel = button.message.guild.channels.cache.find(ch => ch.name == ticketChannelName);
                    channel.delete();
                  }
                })
              })
            })
          } catch (e) {
            throw new Error(e);
          }
        } else if (button.id == "hyr") {
          button.reply.send('İşlem iptal edildi!', true);
        }
      })
    })
  }
}