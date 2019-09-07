var fs = require('fs'),
  cloudconvert = new (require('cloudconvert'))('WIQoY7PLpD97fmkww1yKsCqDDouYUa3ecOGj6UNfeJpGz8QlFtNBtWQSuaflb3D4');

const pdfToEpub = (file) => {
  fs.createReadStream(file)
    .pipe(cloudconvert.convert({
      "inputformat": "pdf",
      "outputformat": "epub",
      "input": "upload"
    }))
    .pipe(fs.createWriteStream('outputfile.epub'));
}

module.exports = pdfToEpub