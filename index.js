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

var lastMessage = ""
// Create an event listener for messages
client.on('message', message => {
  
      // do what you need with lastMessage below
    
  // message.channel.messages.fetch({ limit: 10 })
//     .then(messages => console.log(`Received ${messages.cache[0]} messages`))
//     .catch(console.error);
  if (message.content.toLowerCase() === 'toxic?') {
    message.channel.messages.fetch({ limit: 2 }).then(messages => {
    lastMessage = messages.last().content

  })
    toxicity.load(threshold).then(model => {
        model.classify(lastMessage).then(predictions => {
      
          var toxicityTypes = ""
          for(i=0; i < predictions.length; i++){
            var appendedType
            if(predictions[i].results[0].match === true || predictions[i].results[0].match === null){
              switch(predictions[i].label){
                case "identity_attack": 
                  appendedType = "Attacking Identity"
                  break;
                case "insult":
                  appendedType = "Insulting"
                  break;
                case "obscene":
                  appendedType = "Obscene"
                  break;
                case "severe_toxicity":
                  appendedType = "Harassing"
                  break;
                case "sexual_explicit":
                  appendedType = "Sexually Explicit"
                  break;
                case "threat":
                  appendedType = "Threatening"
                  break;
                case "toxicity":
                  appendedType = "Toxic"
                  break;

              }
              if (i == predictions.length - 1){
                  toxicityTypes += "and `" + appendedType + "`"
              }
              else {
                toxicityTypes += "`" + appendedType + "`, "
              }
              }
          }
          if (toxicityTypes != "") {
          message.channel.send("`Warning!` This message was perceived as offensive for the following reasons: " + toxicityTypes)
          }
          else {
          message.channel.send("The message was not perceived as offensive by the AI.")
          }
        });
      });
  }
});

client.login(process.env.token);
