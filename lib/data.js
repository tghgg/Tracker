/* Library for storing and editing data */
/* Falling Snowdin */

const fs = require('fs');

const data = {};

// Write data synchronously to a file
data.createSync = (path, data) => {
  const fd = fs.openSync(path, 'w');
  fs.writeFileSync(fd, data);
  fs.closeSync(fd);
};

// Write data asynchronously to a JSON file
data.create = (filepath, data, callback) => {
  fs.open(filepath, 'w', (err, file_descriptor) => {
    if (!err && file_descriptor) {
      fs.writeFile(file_descriptor, data, (err) => {
        if (!err) {
          fs.close(file_descriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback(`${err}\nCould not create new file. It may already exists.`);
    }
  });
};

// Create a directory
data.mkDir = (path, callback) => {
  if (!fs.existsSync(path)) fs.mkdir(path, callback);
};

// Read data synchronously from a file
data.readSync = (path) => {
  return fs.readFileSync(path, 'utf-8');
};

// Check if a file/folder exists with a given path
data.existsSync = (path) => {
  return fs.existsSync(path);
};

// Export the module
module.exports = data;
