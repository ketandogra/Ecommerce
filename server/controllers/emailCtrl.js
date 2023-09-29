const nodemailer = require("nodemailer")
const asyncHandler = require('express-async-handler')

const sendEmail = asyncHandler(async(data,req,res)=>{


    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
         
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS
        }
      });
        const info = await transporter.sendMail({
          from: '"Hey 👻" <foo@example.com>', // sender address
          to: data.to, // list of receivers
          text:"Hey User!",
          subject: data.subject, // Subject line
          text: data.text, // plain text body
          html: data.html, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
   
      


})

module.exports = sendEmail