//external module
const fs = require("fs");
const path = require("path");

//variable
const filesPath = path.join(__dirname, "..", "/FOLDER");

console.log();

//funtions for cleanup inactivefiles
const fileCleanupCheck = (cleanupPeriod) => {
  const cleanupTimestamp = Date.now() - cleanupPeriod;

  fs.readdir(filesPath, (error, files) => {
    if (error) {
      console.error("Error reading file directory", error);
      return;
    }

    files.forEach((file) => {
      const currentFilePath = `${filesPath}/${file}`;
      fs.stat(currentFilePath, (statError, stats) => {
        if (statError) {
          console.error("Error getting file stats", statError);
        } else {
          if (stats.mtimeMs < cleanupTimestamp) {
            fs.unlink(currentFilePath, (removeError) => {
              if (removeError) {
                console.error("Error removing file", removeError);
              } else {
                console.log(`File named ${file} removed successfully`);
              }
            });
          }
        }
      });
    });
  });
};

module.exports = fileCleanupCheck;
