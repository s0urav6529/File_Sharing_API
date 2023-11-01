const rateLimit = require("express-rate-limit");
const time = 24 * 60 * 60 * 1000;
const maxlimit = 5;

const downloadLimiter = rateLimit({
  windowMs: time,
  max: maxlimit,
  message: "You exit maximum download per day",
});
const uploadLimiter = rateLimit({
  windowMs: time,
  max: maxlimit,
  message: "You exit maximum upload per day",
});

module.exports = { downloadLimiter, uploadLimiter };
