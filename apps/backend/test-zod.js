const { z } = require('zod');

const schema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số'),
    confirmNewPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  })
});

const req = {
  body: {
    oldPassword: 'oldPassword123',
    newPassword: 'newPassword123',
    confirmNewPassword: 'newPassword123'
  },
  query: {},
  params: {}
};

try {
  schema.parse(req);
  console.log('Success');
} catch (e) {
  console.log(JSON.stringify(e.errors, null, 2));
}
