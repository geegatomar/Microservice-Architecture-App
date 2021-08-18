const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dummy.atlan.collect@gmail.com',
      pass: 'atlancollect'
    }
});

module.exports = function(gmailId, shareableFormLink) {
    // Ideally make a hash and that will route to different forms, 
    // example- https://clone-atlan/forms/njhb678huy67ahash

    var mailOptions = {
        from: 'dummy.atlan.collect@gmail.com',
        to: gmailId,
        subject: 'Dummy Atlan Form Created',
        text: `Your shareable form has been created and can be found here: ${shareableFormLink}`
    };
            
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}
