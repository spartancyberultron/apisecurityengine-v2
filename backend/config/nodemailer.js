const nodemailer=require('nodemailer')
const fs=require("fs")
const sendMail= async(email,subject,path)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:'lavanyapadala666@gmail.com',
                pass:"fhaydxbkvcvqwevr"
            }
        })

        await transporter.sendMail({
            from: 'APISecurityEngine <lavanyapadala666@gmai.com>',
            to:email,
            subject:subject,
            text:`Hi,

Your API scan report is attached with this email. You can also get the same from APISecurityEngine Dashboard anytime.

Regards,
APISecurityEngine Team`,
            attachments: [
                {
                  filename: "API_Scanreport.pdf",
                  //path:path,
                  content: fs.readFileSync(path)
                }
              ]
        })

        console.log("Email sent successfully");


    } catch (error) {
        console.log(error,"Email not sent succesfully");
    }
    
}
module.exports={sendMail}