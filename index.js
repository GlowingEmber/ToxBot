const Discord = require('discord.js');
const toxicity = require('@tensorflow-models/toxicity');
require('@tensorflow/tfjs');
require('dotenv').config()



// Create an instance of a Discord client
const client = new Discord.Client();
const threshold = 0.9;


client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    meanmessage = message.content.split("?")
  if (meanmessage[0].toLowerCase() === 'toxic') {
    toxicity.load(threshold).then(model => {
        model.classify(meanmessage[1]).then(predictions => {
      
          var toxicityTypes = "`Warning!` This message was perceived as offensive for the following reasons: "
          for(i=0; i < predictions.length; i++){
            if(predictions[i].results[0].match === true || predictions[i].results[0].match === null){
              if (i == predictions.length - 1){
                  toxicityTypes += "`" + predictions[i].label + "`"
              }
              else {
                toxicityTypes += "`" + predictions[i].label + "`, "
              }
              }
          }
          message.channel.send(toxicityTypes)
        });
      });
  }
});

client.login(process.env.token);
