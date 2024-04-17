import { writeFileSync } from "fs";
import nodemailer from "nodemailer";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;
const RECEIVER_EMAILS = JSON.parse(process.env.RECEIVER_EMAILS ?? "[]");

if (SENDER_EMAIL === "enter sender email here") {
  throw new Error("SENDER_EMAIL is not set. Please set it in the .env file.");
}

export function notifyHomes(homesToNotify) {
  if (homesToNotify.length === 0) {
    console.log("No new homes to notify. returning...");
    return;
  }

  // just in case. For debugging...
  writeFileSync("homesToNotify.json", JSON.stringify(homesToNotify, null, 2));

  console.log("preparing email content");
  const homesToNotifyString = homesToNotify
    .map((home) => {
      return `${home.name} - ${home.living_area}m2 - ${home.basic_rent}€ - ${home.link}`;
    })
    .join("\n");

  console.log("booting up nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_EMAIL_PASSWORD,
    },
  });

  console.log("sending emails to ", RECEIVER_EMAILS.join(" and "));
  RECEIVER_EMAILS.forEach((receiverEmail) => {
    console.log("sending email to ", receiverEmail);
    const mailOptions = {
      from: SENDER_EMAIL,
      to: receiverEmail,
      subject: "New H2S homes " + new Date().toDateString() + "!",
      text: homesToNotifyString,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("error sending mail to ", receiverEmail, ":", error);
      } else {
        console.log("Email sent to ", receiverEmail, ": " + info.response);
      }
    });
  });
}
