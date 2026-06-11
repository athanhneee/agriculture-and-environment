import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Fallback: Sử dụng Ethereal Email để test nếu không có Webhook URL
export const createTransporter = async () => {
  console.warn('⚠️ Google Apps Script Webhook chưa được cấu hình. Sử dụng Ethereal Email để test...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const subject = 'Mã xác nhận khôi phục mật khẩu (OTP)';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #059669; text-align: center;">Khôi phục mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản <strong>${to}</strong>. Vui lòng sử dụng mã OTP dưới đây để thiết lập lại mật khẩu. Mã này có hiệu lực trong vòng 5 phút.</p>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
      </div>
      <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      <br/>
      <p>Trân trọng,<br/><strong>Thành Phát An Smart Farm</strong></p>
    </div>
  `;

  try {
    if (env.gasEmailWebhookUrl) {
      // 🚀 Sử dụng Google Apps Script Webhook (Không bị chặn Port trên Render)
      console.log('Đang gửi email qua Google Apps Script Webhook...');
      const response = await fetch(env.gasEmailWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Lỗi không xác định từ Webhook');
      }
      console.log('✅ Đã gửi email OTP thành công qua Google Apps Script!');
    } else {
      // 🛠 Fallback: Sử dụng Ethereal
      const transporter = await createTransporter();
      const info = await transporter.sendMail({
        from: '"Thành Phát An Smart Farm" <noreply@smartfarm.com>',
        to,
        subject,
        html,
      });

      console.log('✅ Đã gửi email OTP test thành công qua Ethereal!');
      if (info.messageId) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email OTP');
  }
};
