const brevo = require("@getbrevo/brevo");

    const sendOTPEmail = async (toEmail, toName, otp) => {
  console.log("API KEY:", process.env.BREVO_API_KEY ? "✅ Loaded" : "❌ UNDEFINED");
  

  const apiInstance = new brevo.TransactionalEmailsApi();
  
  // ✅ v2 correct way
  apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

  const email = new brevo.SendSmtpEmail();
  email.subject     = "Your AgriSense OTP";
email.sender = { name: "AgriSense", email: "yaminireddy2023@gmail.com" };
  email.to          = [{ email: toEmail, name: toName }];
  email.htmlContent = `
    <div style="font-family:Arial;max-width:400px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
      <h2 style="color:#2d7a3a">🌾 AgriSense</h2>
      <p>Hi <b>${toName}</b>,</p>
      <p>Your verification OTP is:</p>
      <h1 style="letter-spacing:8px;color:#2d7a3a">${otp}</h1>
      <p style="color:gray;font-size:12px">Valid for 10 minutes. Do not share.</p>
    </div>
  `;

  await apiInstance.sendTransacEmail(email);
};

module.exports = sendOTPEmail;
