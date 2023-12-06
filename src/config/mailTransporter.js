import nodemailer from 'nodemailer';
import { config } from "dotenv";

config({ path: '.env' });

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export { transporter };