const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dummy.atlan.collect@gmail.com',
      pass: 'atlancollect'
    }
  });

  module.exports = function(userGmailId, spreadsheetId){
    var mailOptions = {
        from: 'dummy.atlan.collect@gmail.com',
        to: 'dummy.atlan.collect@gmail.com',
        subject: '[ACTION REQUIRED] Share Google Sheets',
        text: `Share the sheet https://docs.google.com/spreadsheets/d/${spreadsheetId} with ${userGmailId}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}