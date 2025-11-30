import i18n from '@/src/i18n';
import { LANGUAGE } from './common.enum';

const supportMail = 'connectfy.team@gmail.com';
const supportMailLink = `mailto:${supportMail}`;

export const signupVerifyMessage = (
  firstName: string,
  lastName: string,
  verifyCode: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const team = i18n.t('email_messages.signup_verify.team', { lng: lang });
  const ignore = i18n.t('email_messages.signup_verify.ignore', { lng: lang });
  const support = i18n.t('email_messages.signup_verify.support', { lng: lang });
  const subject = i18n.t('email_messages.verify_yourself.subject', {
    lng: lang,
  });
  const greeting = i18n.t('email_messages.signup_verify.greeting', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.signup_verify.thank_you', {
    lng: lang,
  });
  const signature = i18n.t('email_messages.signup_verify.signature', {
    lng: lang,
  });
  const instruction = i18n.t('email_messages.signup_verify.instruction', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #2ecc71;">${subject}</h2>
          <p>${greeting} <strong>${firstName} ${lastName}</strong>,</p>
          <p>${thankYou}</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2ecc71; background: #f1f8ff; padding: 10px; border-radius: 5px; margin: 20px 0;">
            ${verifyCode}
          </div>
          <p>${instruction}</p>
          <p>${ignore}</p>
          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>
          <p>${signature}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const forgotPasswordMessage = (
  resetToken: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const resetUrl = `http://localhost:4800/auth/reset-password?token=${resetToken}`;

  const team = i18n.t('email_messages.forgot_password.team', { lng: lang });
  const intro = i18n.t('email_messages.forgot_password.intro', { lng: lang });
  const expiry = i18n.t('email_messages.forgot_password.expiry', { lng: lang });
  const support = i18n.t('email_messages.forgot_password.support', {
    lng: lang,
  });
  const subject = i18n.t('email_messages.forgot_password.subject', {
    lng: lang,
  });
  const buttonText = i18n.t('email_messages.forgot_password.button', {
    lng: lang,
  });
  const fallback = i18n.t('email_messages.forgot_password.fallback', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.forgot_password.thank_you', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #2ecc71;">${subject}</h2>
          <p>${intro}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #2ecc71; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${fallback}</p>
          <a href="${resetUrl}" style="word-wrap: break-word; color: #2ecc71;">${resetUrl}</a>

          <p style="color: #777; font-size: 14px;">${expiry}</p>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${thankYou}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const emailNotFoundMessage = (
  email: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const registerUrl = `http://localhost:4800/auth`;

  const team = i18n.t('email_messages.email_not_found.team', { lng: lang });
  const intro = i18n.t('email_messages.email_not_found.intro', { lng: lang });
  const subject = i18n.t('email_messages.email_not_found.subject', {
    lng: lang,
  });
  const support = i18n.t('email_messages.email_not_found.support', {
    lng: lang,
  });
  const buttonText = i18n.t('email_messages.email_not_found.button', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.email_not_found.thank_you', {
    lng: lang,
  });
  const instruction = i18n.t('email_messages.email_not_found.instruction', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #FF5722;">${subject}</h2>
          <p>${intro} <strong>${email}</strong>.</p>
          <p>${instruction}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${registerUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF5722; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${thankYou}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const googleSignInMessage = (
  email: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const loginUrl = `http://localhost:4800/auth`;

  const team = i18n.t('email_messages.google_sign_in.team', { lng: lang });
  const intro = i18n.t('email_messages.google_sign_in.intro', { lng: lang });
  const ignore = i18n.t('email_messages.google_sign_in.ignore', { lng: lang });
  const subject = i18n.t('email_messages.google_sign_in.subject', {
    lng: lang,
  });
  const support = i18n.t('email_messages.google_sign_in.support', {
    lng: lang,
  });
  const buttonText = i18n.t('email_messages.google_sign_in.button', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.google_sign_in.thank_you', {
    lng: lang,
  });
  const instruction = i18n.t('email_messages.google_sign_in.instruction', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #FF9800;">${subject}</h2>
          <p>${intro}</p>
          <p><strong>${email}</strong></p>
          <p>${instruction}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF9800; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${ignore}</p>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${thankYou}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const deleteAccountMessage = (
  deleteToken: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const deleteUrl = `http://localhost:4800/auth/delete-account?token=${deleteToken}`;

  const team = i18n.t('email_messages.delete_account.team', { lng: lang });
  const intro = i18n.t('email_messages.delete_account.intro', { lng: lang });
  const expiry = i18n.t('email_messages.delete_account.expiry', { lng: lang });
  const support = i18n.t('email_messages.delete_account.support', {
    lng: lang,
  });
  const subject = i18n.t('email_messages.delete_account.subject', {
    lng: lang,
  });
  const buttonText = i18n.t('email_messages.delete_account.button', {
    lng: lang,
  });
  const fallback = i18n.t('email_messages.delete_account.fallback', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.delete_account.thank_you', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #f44336;">${subject}</h2>
          <p>${intro}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${deleteUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #f44336; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${fallback}</p>
          <a href="${deleteUrl}" style="word-wrap: break-word; color: #f44336;">${deleteUrl}</a>

          <p style="color: #777; font-size: 14px;">${expiry}</p>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #f44336; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${thankYou}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const accountDeletedMessage = (
  restoreToken: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const restoreUrl = `http://localhost:4800/auth?type=restore&token=${restoreToken}`;

  const team = i18n.t('email_messages.delete_account_completed.team', {
    lng: lang,
  });
  const note = i18n.t('email_messages.delete_account_completed.note', {
    lng: lang,
  });
  const intro = i18n.t('email_messages.delete_account_completed.intro', {
    lng: lang,
  });
  const support = i18n.t('email_messages.delete_account_completed.support', {
    lng: lang,
  });
  const subject = i18n.t('email_messages.delete_account_completed.subject', {
    lng: lang,
  });
  const buttonText = i18n.t('email_messages.delete_account_completed.button', {
    lng: lang,
  });
  const fallback = i18n.t('email_messages.delete_account_completed.fallback', {
    lng: lang,
  });
  const signature = i18n.t(
    'email_messages.delete_account_completed.signature',
    { lng: lang },
  );
  const optionalRestore = i18n.t(
    'email_messages.delete_account_completed.optional_restore',
    { lng: lang },
  );

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #f44336;">${subject}</h2>
          <p>${intro}</p>
          <p>${optionalRestore}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${restoreUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #4CAF50; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${fallback}</p>
          <a href="${restoreUrl}" style="word-wrap: break-word; color: #4CAF50;">${restoreUrl}</a>

          <p style="color: #777; font-size: 14px;">${note}</p>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${signature}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const verifyYourselfMessage = (
  firstName: string,
  lastName: string,
  verifyCode: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const team = i18n.t('email_messages.verify_yourself.team', { lng: lang });
  const subject = i18n.t('email_messages.verify_yourself.subject', {
    lng: lang,
  });
  const support = i18n.t('email_messages.verify_yourself.support', {
    lng: lang,
  });
  const greeting = i18n.t('email_messages.verify_yourself.greeting', {
    lng: lang,
  });
  const codeInfo = i18n.t('email_messages.verify_yourself.code_info', {
    lng: lang,
  });
  const signature = i18n.t('email_messages.verify_yourself.signature', {
    lng: lang,
  });
  const instruction = i18n.t('email_messages.verify_yourself.instruction', {
    lng: lang,
  });

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #2ecc71;">${subject}</h2>
          <p>${greeting} <strong>${firstName} ${lastName}</strong>,</p>
          <p>${codeInfo}</p>

          <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2ecc71; background: #f1f8ff; padding: 10px; border-radius: 5px; margin: 20px 0;">
            ${verifyCode}
          </div>

          <p>${instruction}</p>

          <p>${support} 
            <a href="${supportMailLink}" style="color: #2ecc71; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${signature}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};

export const changeEmailMessage = (
  token: string,
  lang: LANGUAGE = LANGUAGE.EN,
) => {
  const changeUrl = `http://localhost:4800/auth/change-email?token=${token}`;

  const team = i18n.t('email_messages.change_email.team', { lng: lang });
  const intro = i18n.t('email_messages.change_email.intro', { lng: lang });
  const subject = i18n.t('email_messages.change_email.subject', { lng: lang });
  const support = i18n.t('email_messages.change_email.support', { lng: lang });
  const buttonText = i18n.t('email_messages.change_email.button', {
    lng: lang,
  });
  const fallback = i18n.t('email_messages.change_email.fallback', {
    lng: lang,
  });
  const thankYou = i18n.t('email_messages.change_email.thank_you', {
    lng: lang,
  });
  const instruction = i18n.t('email_messages.change_email.instruction', {
    lng: lang,
  });
  const expiryNotice = i18n.t('email_messages.change_email.expiry', {
    lng: lang,
  }); // New expiry message

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #FF9800;">${subject}</h2>
          <p>${intro}</p>
          <p>${instruction}</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${changeUrl}"
               style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF9800; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${buttonText}
            </a>
          </div>

          <p>${expiryNotice}</p> <!-- Expiry notice here -->

          <p>${fallback}</p>
          <a href="${changeUrl}" style="word-wrap: break-word; color: #FF9800;">${changeUrl}</a>

          <p>${support} 
            <a href="mailto:${supportMail}" style="color: #FF9800; text-decoration: none;">${supportMail}</a>.
          </p>

          <p>${thankYou}</p>
          <p style="text-align: center; font-weight: bold; color: #2ecc71;">${team}</p>
        </div>
      </body>
    </html>
  `;
};
