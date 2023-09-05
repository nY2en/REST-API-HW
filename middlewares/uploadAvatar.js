const multer = require("multer");
const path = require("path");

const tempPath = path.join(__dirname, "../", "temp");

const storage = multer.diskStorage({
  destination: tempPath,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
