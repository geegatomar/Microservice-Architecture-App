// This service is one of the 'subscribers' for the message published. It creates the DB 
// with these questions in the questionairre form, and then shares a link to the creator
// which has the created form (so creator can share the created form), and obtain responses.


const express = require("express");
const amqp = require('amqplib/callback_api');
const bodyParser = require("body-parser");
const addToMongo = require(__dirname + "/mongo.js");
const sendFormLinkToCreator = require(__dirname + "/mail-form-link.js");
const app = express();
const PORT = "3002";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

let subscribersCheckboxed = []; 
let questionsInForm = [];
var mySchema;


amqp.connect('amqp://message-queue-1:5672', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'MessageQueueCreateForm';
        channel.assertQueue(queue);

        channel.consume(queue, function(msg){

            let obj = JSON.parse(msg.content);
            console.log(obj);

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // val is the question to be stored in db as columns.
                    // If val is 'on', then its for a checkbox, so we need to pass this in 
                    // the next message queue which is for all the add-on services like
                    // google-sheets service, or SMS service, etc.
                    var val = obj[key];
                    console.log(key, val);
                    if(key.includes("-checkbox") && val == "on") {
                        // then its one of the selected checkboxes, sowe need to make sure 
                        // its corresponding subcribers can carry out necessary actions.
                        subscribersCheckboxed.push(key);
                    } else {
                        questionsInForm.push(val);
                    }
                }
            }
            
            sendFormLinkToCreator("geegatomar@gmail.com", "http://localhost:3002/form");

            channel.ack(msg);
        });
    });
});

// Ideally this form will be followed by a hash which denotes which form it is.
app.get("/form", function(req, res){
    // Depending on the form and hash, the correct form id determined from the db, and
    // those questions are sent over to the html via EJS.
    console.log(questionsInForm[0]);
    res.render('index', {questionsInForm: questionsInForm}); 
});

app.post("/form", function(req, res){
    // The results obtained need to be stored in the DB, and also sent to a new MQ
    amqp.connect('amqp://message-queue-2:5672', function(error0, connection) {
        if (error0) {
            console.log(error0);
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                console.log(error1);
            }
            var queue = 'MessageQueueFormResults';
            
            // addToMongo(questionsInForm, req);

            var msg = req.body;
            console.log(msg);
            msg["questions"] = questionsInForm;
            msg["subscribed-checkboxes"] = subscribersCheckboxed;
            channel.assertQueue(queue);

            console.log(JSON.stringify(msg));
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
            console.log("Sent to MessageQueueFormResults");
        });
    });
    res.send("Response captured!");
});

app.listen(PORT, function(){
    console.log(PORT);
});