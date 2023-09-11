const sendGrid = require("@sendgrid/mail");

const { SENDGRID_API_KEY } = process.env;

sendGrid.setApiKey(SENDGRID_API_KEY);

const sendEmail = (data) => {
  const emailOptions = {
    ...data,
    from: "chebanikita@icloud.com",
  };

  return new Promise(function (resolve, reject) {
    sendGrid
      .send(emailOptions)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

module.exports = sendEmail;
