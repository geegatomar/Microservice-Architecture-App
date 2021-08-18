const express = require("express");
const amqp = require('amqplib/callback_api');
const bodyParser = require("body-parser");
const googleSheetUpdate = require(__dirname + "/google-sheet-update.js");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));

amqp.connect('amqp://message-queue-2:5672', function(error0, connection) {
    if (error0) {
        console.log(error0);
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            console.log(error1);
        }
        var queue = 'MessageQueueFormResults';
        channel.assertQueue(queue);

        
        channel.consume(queue, async(msg) => {
            console.log(JSON.parse(msg.content));
            let obj = JSON.parse(msg.content);

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                  var val = obj[key];
                  if(key == "subscribed-checkboxes" && val.includes("google-sheet-checkbox")) {
                      // If the checkbox is checked, only then the google sheets service is subscribed to this message.
                      // Now we need to add to the google sheets data here.
                      console.log("SUBSCRIBED");
                      
                      googleSheetUpdate(obj);
                  } 
                  console.log(key, val);
                }
            }
            channel.ack(msg);
        });
    });
});
