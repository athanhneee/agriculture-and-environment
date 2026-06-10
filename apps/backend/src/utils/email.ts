import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Tạo transporter dùng cấu hình SMTP hoặc Ethereal Email (nếu không có cấu hình)
export const createTransporter = async () => {
  if (env.smtpUser && env.smtpPass && env.smtpHost) {
    return nodemailer.createTransport({
      host: env.smtpHost,
      port: Number(env.smtpPort) || 587,
      secure: Number(env.smtpPort) === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  // Nếu không có cấu hình SMTP, sử dụng Ethereal để test (in ra console)
  console.warn('⚠️ SMTP chưa được cấu hình. Sử dụng Ethereal Email để test...');
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
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"Thành Phát An Smart Farm" <noreply@smartfarm.com>',
      to,
      subject: 'Mã xác nhận khôi phục mật khẩu (OTP)',
      html: `
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
      `,
    });

    console.log('✅ Đã gửi email OTP thành công!');
    // Nếu dùng Ethereal, in ra đường dẫn để xem email test
    if (info.messageId && !env.smtpUser) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email OTP');
  }
};
