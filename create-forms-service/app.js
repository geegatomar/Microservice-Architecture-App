// This service renders the form to create the questionairre form, and 'publishes' the
// data to the RabbitMQ messaging queue.

const express = require("express");
const bodyParser = require("body-parser");
const amqp = require('amqplib/callback_api');
const PORT = "3000";

app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res){
    console.log(req.body);
    amqp.connect('amqp://message-queue-1:5672', function(error0, connection) {
        if (error0) {
            console.log(error0);
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                console.log(error1);
            }
            var queue = 'MessageQueueCreateForm';
            var msg = req.body;
            channel.assertQueue(queue);

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
            console.log("Sent to MessageQueueCreateForm");
        });
    });
    res.send("Form has been created. You will receive an email regarding form details shortly.");
});

app.listen(PORT, function(){
    console.log(`create-forms-service listening on port ${PORT}`);
});
