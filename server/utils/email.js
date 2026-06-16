import https from "https";

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (toEmail, otp, userName) => {
  // If EmailJS is not configured, log OTP for development
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log(`\n========================================`);
    console.log(`OTP for ${toEmail}: ${otp}`);
    console.log(`========================================\n`);
    return true;
  }

  const templateParams = {
    to_email: toEmail,
    to_name: userName,
    otp_code: otp,
    app_name: "Chat Application",
  };

  const data = JSON.stringify({
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: templateParams,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.emailjs.com",
        path: "/api/v1.0/email/send",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            console.error("EmailJS error:", body);
            reject(new Error(`EmailJS failed: ${body}`));
          }
        });
      }
    );

    req.on("error", (error) => {
      console.error("Email send error:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};
