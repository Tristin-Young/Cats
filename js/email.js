const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tristinyoung0507@gmail.com',
    pass: 'yhhnvlvyogdaqrxd'
  }
});

const sendVerificationEmail = (email, token) => {
  const mailOptions = {
    from: 'tristinyoung0507@gmail.com',
    to: email,
    subject: 'Confirm your email',
    html: `<a href="http://localhost:3000/confirm-email/${token}">Click here to confirm your email</a>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendVerificationEmail;

