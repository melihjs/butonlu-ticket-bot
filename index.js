const { Client, Collection } = require('discord.js');
const client = new Client({
  partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER']
});
client.commands = new Collection();
require('discord-buttons')(client);

client.on('ready', async () => console.log('ready'));
 
client.on('message', async (m) => {
  var prefix = "prefix";
  if (m.content.indexOf(prefix) !== 0) return;
  var args = m.content.slice(prefix.length).trim().split(/ +/g);
  var command = args.shift();
  var cmd = client.commands.get(command);
  if (!cmd) return;
  cmd.run(client, m, args);
});

require('fs').readdir('./komutlar/', async (err, files) => {
  if (err) throw new Error(err);
  files.forEach(async (dosya) => {
    var cmd = require(`./komutlar/${dosya}`);
    client.commands.set(cmd.name, cmd);
  });
});

client.on('clickButton', async (button) => {
  require('./events/clickButton').run(client, button);
});

client.login('token');
