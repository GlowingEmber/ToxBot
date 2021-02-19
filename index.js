require('@tensorflow/tfjs');
require('dotenv').config()
const Discord = require('discord.js');
const toxicity = require('@tensorflow-models/toxicity');

// Create an instance of a Discord client
const client = new Discord.Client();
const threshold = 0.9;

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('?toxic help')
});

var lastMessage = ""
analysis = ""
client.on('message', message => {
    if (message.content.toLowerCase().match(/^(\?toxic help)$/)) {
    const responseEmbed = new Discord.MessageEmbed()
	            .setColor('#7075ff')
            	.addFields(
          	  { name: 'Check Previous', value: "`?toxic previous`", inline: true },
	           	{ name: 'Check Current', value: '`?toxic "message"`', inline: true},
              { name: 'Add ToxBot', value: "[Add to Server](https://discord.com/api/oauth2/authorize?client_id=810413375737036800&permissions=117824&scope=bot)", inline: true})
            	.setTimestamp()
            	.setFooter('ToxBot');
            message.channel.send(responseEmbed);
  }
  else if (message.content.toLowerCase().match(/^(\?toxic previous|\?toxic prev|\?toxic p)$/) || (message.content.match(/"/g)||[]).length > 0) {
    if (message.content.toLowerCase().match(/^(\?toxic previous|\?toxic prev|\?toxic p)$/)) {
      message.channel.messages.fetch({ limit: 2 }).then(messages => {
    lastAuthor = messages.last().author
    lastMessage = messages.last().content.replace(/`/g,'')
  })
}
    else if ((message.content.match(/"/g)||[]).length >0) {
      if ((message.content.match(/"/g)||[]).length === 2) {
      lastAuthor = message.author
      lastMessage = message.content.match(/"([^"]+)"/)[1].replace(/`/g,'')
    } else {
      const responseEmbed = new Discord.MessageEmbed()
      .setColor('#7075ff')
      .setAuthor(message.author.tag)
      .setDescription("`Error:` " +  (message.content.match(/"/g)||[]).length + " quotation marks used, not 2.")
      .addFields(
        { name: 'Usage', value: "`?toxic \"message\"`"})
      .setTimestamp()
      .setFooter('ToxBot');
    message.channel.send(responseEmbed);
    return;
    }
  }

    toxicity.load(threshold).then(model => {
        if (lastMessage == "") {
          const responseEmbed = new Discord.MessageEmbed()
          .setColor('#7075ff')
          .setAuthor(lastAuthor.tag)
          .setDescription("Message was empty, an embed, or a file.")
          .setTimestamp()
          .setFooter('ToxBot');
        message.channel.send(responseEmbed);
        }
        else {
        model.classify(lastMessage).then(predictions => {
      
          var toxicityTypes = []
          for(i=0; i < predictions.length; i++){
            var appendedType = ""
            if(predictions[i].results[0].match === true || predictions[i].results[0].match === null){
              switch(predictions[i].label){
                case "identity_attack": 
                  toxicityTypes.push("an Identity Attack")
                  break;
                case "insult":
                  toxicityTypes.push("Insulting")
                  break;
                case "obscene":
                  toxicityTypes.push("Obscene")
                  break;
                case "severe_toxicity":
                  toxicityTypes.push("Harassing")
                  break;
                case "sexual_explicit":
                  toxicityTypes.push("Sexually Explicit")
                  break;
                case "threat":
                  toxicityTypes.push("Threatening")
                  break;
                case "toxicity":
                  toxicityTypes.push("Toxic")
                  break;

              }
              }
          }
          const x = toxicityTypes.length
          switch(true) {
            case (x == 0):
            analysis = ("The message `" + lastMessage + "` was not perceived as offensive by the AI.")
            break;
            case (x == 1):
            analysis = ("The message `" + lastMessage + "` was perceived as offensive for being `" + toxicityTypes[0] + "`")
            break;
            case (x == 2):
            analysis = ("The message `" + lastMessage + "` was perceived as offensive for being `" + toxicityTypes[0] + "` and/or `" + toxicityTypes[1] + "`")
            break;
            case (x >= 3):
            for (i = 0; i < x; i++) {
              if (i == toxicityTypes.length - 1) {
                appendedType += " and/or `" + toxicityTypes[i] + "`"
              }
              else {
                appendedType += "`" + toxicityTypes[i] + "`, "
              }
            }
            analysis = ("`Warning!` The message `" + lastMessage + "` was perceived as offensive for being " + appendedType)
            break;
          }
          const responseEmbed = new Discord.MessageEmbed()
	            .setColor('#7075ff')
            	.setAuthor(lastAuthor.tag)
            	.addFields(
          	  	{ name: 'Message', value: lastMessage },
	           	{ name: 'Analysis', value: analysis},
              	)
            	.setTimestamp()
            	.setFooter('ToxBot');
            message.channel.send(responseEmbed);
        });
      }
      });
  }
});

client.login(process.env.token);
