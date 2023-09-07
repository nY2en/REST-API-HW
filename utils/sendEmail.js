const sendGrid = require("@sendgrid/mail");

const { SENDGRID_API_KEY } = process.env;

sendGrid.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const emailOptions = {
    ...data,
    from: "chebanikita@icloud.com",
  };
  await sendGrid.send(emailOptions);
  return true;
};

module.exports = sendEmail;
