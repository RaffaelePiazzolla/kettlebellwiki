import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import env from '../config/env';
import print from '../utils/print';
import juice from 'juice';
import ServiceError from '../model/ServiceError';

const transport = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  tls: {
    secureProtocol: 'TLSv1_method',
  },
  auth: {
    user: env.mailer.emailAddress,
    pass: env.mailer.emailPassword,
  },
});

export function send({ to, subject = '', message = '', headers }: Email): Promise<boolean> {
  return new Promise(function (resolve, reject) {
    transport.sendMail({
      to: to,
      from: env.mailer.emailAddress,
      subject: subject,
      headers: headers,
      html: message,
    }, (error, info) => {
      if (!error) {
        print(`email sent to ${to}`);
        resolve(true);
      } else {
        print.error(`cannot send email to ${to}`);
        reject(error as ServiceError);
      }
    });
  });
};

export async function render(template: string, email: TemplateEmail, data: Object = {}): Promise<boolean> {
  try {
    const templateFile = template.endsWith('.ejs') ? template : `${template}.ejs`;
    const htmlEmail = await ejs.renderFile(
      path.join(require.main.path, 'views', 'emails', templateFile),
      { email, ...data, env },
    );
    const message = juice(htmlEmail);
    return await send({ ...email, message });
  } catch (error) {
    print.error('cannot render email:', error.message);
    throw new ServiceError(500, error.message);
  }
}

interface TemplateEmail {
  to: string,
  subject: string,
  headers?,
}

interface Email {
  to: string,
  subject: string,
  message: string,
  headers?,
}