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
  if (meanmessage[0] === 'toxic') {
    toxicity.load(threshold).then(model => {
        model.classify(meanmessage[1]).then(predictions => {
      
          for(i=0; i < predictions.length; i++){
              if(predictions[i].results[0].match === true || predictions[i].results[0].match === null){
                  message.channel.send(predictions[i].label)
              }
          }
        });
      });
  }
});

client.login(process.env.token);
