const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD
    }
})

async function SendResetRequestEmail(emailAddress, url){
    return new Promise((resolve, reject) =>{
        try{
            transporter.sendMail({
                from: process.env.GMAIL_EMAIL,
                to: emailAddress,
                subject: 'Password Reset',
                html: `
                <p>Click link to reset your password. ${url}</p>
                `,
            }, (error, info) => {
                if(error){ 
                    console.log(error)
                    reject()
                } else {
                    console.log(`Email sent: ${info.response}`)
                    return resolve()
                }
            })
        } catch (error) {
            console.log(error)
            return reject()
        }
    })
    
}
async function sendResetSuccessfulEmail(emailAddress){
    return new Promise((resolve, reject) =>{
        transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: emailAddress,
            subject: 'Password Reset Successful',
            html: `
            <p>Password has been reset successfully</p>
            `,
        }, (error, info) => {
            if(error){ 
                console.log(error)
                reject()
            } else {
                console.log(`Email sent: ${info.response}`)
                return resolve()
            }
        })
    })
    
}

module.exports = { SendResetRequestEmail, sendResetSuccessfulEmail }