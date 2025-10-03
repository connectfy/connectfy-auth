export const signupVerifyMessage = (
  firstName: string,
  lastName: string,
  verifyCode: string,
) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #2ecc71;">Confirm Your Registration</h2>
            <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
            <p>Thank you for registering with us! To complete your registration process, please use the following confirmation code:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2ecc71; background: #f1f8ff; padding: 10px; border-radius: 5px; margin: 20px 0;">
              ${verifyCode}
            </div>
            <p>Please enter this code on the confirmation page to verify your email address and finish signing up.</p>
            <p>If you didn't request this code, you can ignore this email.</p>
            <p>If you have any questions or need assistance, feel free to contact our support team at 
              <a href="mailto:connectfy.team@gmail.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.
            </p>
            <p>Best regards,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};


export const forgotPasswordMessage = (resetToken: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #2ecc71;">Password Reset Request</h2>
            <p>We received a request to reset your password. If you made this request, please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:4800/auth?type=reset&token=${resetToken}" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #2ecc71; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset My Password</a>
            </div>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <a href="http://localhost:4800/auth?type=reset&token=${resetToken}" style="word-wrap: break-word; color: #2ecc71;">http://localhost:4800/auth?type=reset&token=${resetToken}</a>
            <p style="color: #777; font-size: 14px;">This link will expire in <strong>1 hours</strong>. If you did not request this, you can safely ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};


export const emailNotFoundMessage = (email: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #FF5722;">Email Not Found</h2>
            <p>Dear User,</p>
            <p>We could not find an account associated with the email address: <strong>${email}</strong>.</p>
            <p>If you believe this is a mistake, please ensure you have entered the correct email address. Alternatively, you can register for a new account:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:4800/auth" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF5722; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Register Now</a>
            </div>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};


export const googleSignInMessage = (email: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #FF9800;">Google Sign-In Detected</h2>
            <p>Dear User,</p>
            <p>The email address <strong>${email}</strong> is associated with a Google Sign-In account.</p>
            <p>If you want to access your account, please use the <strong>"Sign in with Google"</strong> option on the login page.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:4800/auth" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF9800; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Go to Login Page</a>
            </div>
            <p>If you did not try to reset your password and believe this is a mistake, you can ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};


export const deleteAccountMessage = (deleteToken: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #f44336;">Delete Account Request</h2>
            <p>We received a request to delete your account. If you initiated this request, please click the button below to confirm the deletion of your account.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:4800/auth?type=delete&token=${deleteToken}" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #f44336; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Confirm Account Deletion
              </a>
            </div>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <a href="http://localhost:4800/auth?type=delete&token=${deleteToken}" style="word-wrap: break-word; color: #f44336;">
              http://localhost:4800/auth?type=delete&token=${deleteToken}
            </a>
            <p style="color: #777; font-size: 14px;">This link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:connectfy.team@gmail.com" style="color: #f44336; text-decoration: none;">connectfy.team@gmail.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};


export const accountDeletedMessage = (restoreToken: string) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #f44336;">Your Account Has Been Deleted</h2>
          <p>Dear User,</p>
          <p>We confirm that your Connectfy account has been successfully deleted.</p>
          <p>If this action was intentional, no further action is needed. However, if you change your mind, you can restore your account within the next <strong>30 days</strong> by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:4800/auth?type=restore&token=${restoreToken}" 
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #4CAF50; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Restore My Account
            </a>
          </div>
          <p>If the button above does not work, you can use this link:</p>
          <a href="http://localhost:4800/auth?type=restore&token=${restoreToken}" 
             style="word-wrap: break-word; color: #4CAF50;">
            http://localhost:4800/auth?type=restore&token=${restoreToken}
          </a>
          <p style="color: #777; font-size: 14px;">Note: After 30 days, your account and all associated data will be permanently removed and cannot be recovered.</p>
          <p>If you did not request this deletion or need assistance, please contact our support team at 
            <a href="mailto:connectfy.team@gmail.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.
          </p>
          <p>Best regards,</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
        </div>
      </body>
    </html>
  `;
};


export const verifyYourselfMessage = (
  firstName: string,
  lastName: string,
  verifyCode: string,
) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #2ecc71;">Confirm Your Registration</h2>
            <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
            <p>Your confirmation code:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2ecc71; background: #f1f8ff; padding: 10px; border-radius: 5px; margin: 20px 0;">
              ${verifyCode}
            </div>
            <p>Please enter this code on the confirmation modal to verify yourself.</p>
            <p>If you have any questions or need assistance, feel free to contact our support team at 
              <a href="mailto:connectfy.team@gmail.com" style="color: #2ecc71; text-decoration: none;">connectfy.team@gmail.com</a>.
            </p>
            <p>Best regards,</p>
            <p style="text-align: center; font-weight: bold; color: #2ecc71;">Connectfy Team</p>
          </div>
        </body>
      </html>
    `;
};
