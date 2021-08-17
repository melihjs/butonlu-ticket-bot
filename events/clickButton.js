const { MessageEmbed, Message, MessageAttachment } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

module.exports = {

    async run(client, button) {
        await button.reply.defer();
        let buttonMember = button.clicker.member;
        let guild = button.guild;
        if(button.id == "oluşturucu") {
            let allChannels = client.channels.cache.filter(m => m.type == "text" && m.name.includes("ticket-")).map(m => m.name.split("ticket-")[1]);
            
            let already = allChannels.some(v => buttonMember.user.id == v)
            if(already === true) {
                return buttonMember.send("Üzgünüm, zaten biletin var.")
            }

            let ticketChannel = await guild.channels.create(`ticket-${buttonMember.user.id}`, {
                type: "text",
                topic: `${buttonMember.user.username} adlı kullanıcının ticketı!`,
                permissionOverwrites: [
                    {
                        id: buttonMember.id,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    },
                    {
                        id: guild.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: "829281838618116096", // moderatör rol id
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            var supportEmbed = new MessageEmbed()
            .setTitle('Ticket Yönlendirici')
            .setDescription(':star2: Ticketı yönlendirmek için aşağıdaki butonlardan birine tıkla!')
            .setColor('#5555dd')
            .setThumbnail(guild.iconURL({ dynamic: true }));

            let supportButton = new MessageButton()
                .setLabel("")
                .setEmoji("🔒")
                .setStyle("gray")
                .setID(`ticket_close_${ticketChannel.id}`)

            let claimButton = new MessageButton()
                .setLabel("")
                .setEmoji("📌")
                .setStyle("gray")
                .setID(`ticket_claim_${ticketChannel.id}`)   
            
            ticketChannel.send(`${buttonMember.user} Hoşgeldin!`, { embed: supportEmbed, components: [ new MessageActionRow().addComponent(supportButton).addComponent(claimButton) ] })
            buttonMember.send(`Biletiniz oluşturuldu. ${ticketChannel}`)
        }

        if(button.id == `ticket_close_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("closed-")[1])

            let yes = new MessageButton().setLabel("").setEmoji("✅").setStyle("gray").setID(`ticket_close_yes_${buttonMember.user.id}`)
            let no = new MessageButton().setLabel("").setEmoji("❌").setStyle("gray").setID(`ticket_close_no_${buttonMember.user.id}`)

            let msg = await ticketChannel.send(`${buttonMember.user} Gerçekten yakın bilet istiyor musun?`, { components: [ new MessageActionRow().addComponent(yes).addComponent(no) ] })
            let filter = (button) => buttonMember.user.id == button.clicker.user.id
            let collector = msg.createButtonCollector(filter, { max: 1, time: 60000, errors: ["time"] })

            collector.on("collect", button => {
                if(button.id == `ticket_close_yes_${button.clicker.user.id}`) {
                    msg.delete();

                    let closedEmbed = new MessageEmbed()
                    .setTitle('Ticket Yönlendirici')
                    .setDescription(':star2: Ticketı yönlendirmek için aşağıdaki butonlardan birine tıkla!\n\n> 🔓: Yeniden Açar!\n> 📛: Siler!\n> 💨: Arşivler!\n> 💫: Yazılmış Tüm Mesajları Kayıtlar!')
                    .setColor('#5555dd')
                    .setThumbnail(guild.iconURL({ dynamic: true }));

                    let reopen = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_reopen_${ticketChannel.id}`)
                        .setEmoji("🔓")
                        .setStyle("green")
                   
                    let deleteButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_delete_${ticketChannel.id}`)
                        .setEmoji("📛")
                        .setStyle("red")

                    let archiveButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_archive_${ticketChannel.id}`)
                        .setEmoji("💨")
                        .setStyle("gray")

                    let transcriptButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_transcript_${ticketChannel.id}`)
                        .setEmoji("💫")
                        .setStyle("gray")

                    button.channel.edit({
                        name: `closed-${createdBy}`,
                        permissionOverwrites: [
                            {
                                id: createdBy.id,
                                deny: ["VIEW_CHANNEL"]
                            },
                            {
                                id: guild.id,
                                deny: ["VIEW_CHANNEL"]
                            },
                            {
                                id: "829281838618116096", // moderatör rol
                                allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                            }
                        ]
                    })

                    button.channel.send({ embed: closedEmbed, components: [ new MessageActionRow().addComponent(reopen).addComponent(deleteButton).addComponent(archiveButton).addComponent(transcriptButton) ] })
                } else {
                    msg.delete();
                }
            })
        }

        if(button.id == `ticket_reopen_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("closed-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let supportEmbed = new MessageEmbed()
            .setTitle('Ticket Yönlendirici')
            .setDescription(':star2: Ticketı yönlendirmek için aşağıdaki butonlardan birine tıkla!')
            .setColor('#5555dd')
            .setThumbnail(guild.iconURL({ dynamic: true }));

            let supportButton = new MessageButton()
                .setLabel("")
                .setEmoji("🔒")
                .setStyle("gray")
                .setID(`ticket_close_${ticketChannel.id}`)

            let claimButton = new MessageButton()
                .setLabel("")
                .setEmoji("📌")
                .setStyle("gray")
                .setID(`ticket_claim_${ticketChannel.id}`)
            
            ticketChannel.edit({
                name: `ticket-${createdBy}`,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: "829281838618116096", // moderatör rol
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            ticketChannel.send(`${createdBy} Geri Döndün!`, { embed: supportEmbed, components: [ new MessageActionRow().addComponent(supportButton).addComponent(claimButton) ] })
        }

        if(button.id == `ticket_delete_${button.channel.id}`) {
            let ticketChannel = button.channel;

            let deleteEmbed = new MessageEmbed()
            .setTitle('Ticket Yönlendirici')
            .setDescription(':no_entry: Ticket siliniyor, 5 saniye!')
            .setColor('#5555dd')
            .setThumbnail(guild.iconURL({ dynamic: true }));
            
            ticketChannel.send({ embed: deleteEmbed })
            setTimeout(() => {ticketChannel.delete()}, 300);
        }

        if(button.id == `ticket_archive_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("closed-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let archiveEmbed = new MessageEmbed()
            .setTitle('Ticket Yönlendirici')
            .setDescription('💨 Ticket arşivlendi, sadece silebilirsin!')
            .setColor('#5555dd')
            .setThumbnail(guild.iconURL({ dynamic: true }));

            button.channel.edit({
                name: `archived-${createdBy}`,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: "829281838618116096", // moderatör rol
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            })

            button.channel.send({ embed: archiveEmbed })
        }

        if(button.id == `ticket_transcript_${button.channel.id}`) {
            let ticketChannel = button.channel;

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.content && m.author.id != client.user.id && !m.author.bot).map(m => msToTime(m.createdTimestamp) +" | "+ m.author.tag + ": " + m.cleanContent).join("\n");

            let attch = new MessageAttachment(Buffer.from(systemMessages), `saved_transcript_${button.channel.id}.txt`)
            ticketChannel.send(`${button.clicker.user} yazılarınız hazır!`, {
                files: [attch]
            })
        }

        if(button.id == `ticket_claim_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("closed-")[1])

            let claimEmbed = new MessageEmbed()
            .setTitle('Ticket Yönlendirici')
            .setDescription('📌 <@'+button.clicker.user.id+'> ticketı iptal etti!')
            .setColor('#5555dd')
            .setThumbnail(guild.iconURL({ dynamic: true }));

            button.channel.edit({
                name: `claimed-${createdBy}`,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: "829281838618116096", // moderatör rol
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            })

            button.channel.send({ embed: claimEmbed })
        }    
        
        function msToTime(ms) {
            let fullFill = (a, limit) => ("0".repeat(69) + a.toString()).slice(limit ? -limit : -2);

            let daet = new Date(ms);
            
            let day = fullFill(daet.getDate());
            let month = fullFill(daet.getMonth());
            let year = fullFill(daet.getFullYear(), 4);
            
            let hours = fullFill(daet.getHours());
            let mins = fullFill(daet.getMinutes());
            let secs = fullFill(daet.getSeconds());
            
            return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
        }
    }
}