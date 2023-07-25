const express = require('express');
const app = express();
const fs = require('fs');
const convert = require('xml-js');

// Serves Express Yourself website
app.use(express.static('public'));
const PORT = process.env.PORT || 4001;
app.use(express.static('html'));

// File names for the various data we store.
const dataFiles = {
  "have": './data/haveData.json',
  "want": './data/wantData.json',
  "gone": './data/hadData.json',
  "selling": './data/sellingData.json'
};

// Display the indicated page of the games from the indicated file
app.get('/games/:file/:page', (req, res, next) => {

  const sourceFile = dataFiles[req.params.file];

  fs.readFile(sourceFile, (err, data) => {

    if (err) {

      console.log(err);
    } else {

      const readData = JSON.parse(data);
      const currentPage = Number(req.params.page);
      const from = (currentPage - 1) * 50;
      const to = currentPage * 50;
      const sendData = readData.slice(from,to);
      sendData.push(Math.ceil(readData.length / 50));
      res.send(sendData);

    }
  })
});

// app.get('/expressions/:id', (req, res, next) => {
//   const foundExpression = getElementById(req.params.id, expressions);
//   if (foundExpression) {
//     res.send(foundExpression);
//   } else {
//     res.status(404).send();
//   }
// });

// app.put('/expressions/:id', (req, res, next) => {
//   console.log(res);
//   if (getElementById(req.params.id)) {
//     updateElement(req.params.id, req.query, expressions);
//   }
// });


// Start the server
app.listen(PORT, () => {

  console.log(`Listening on port ${PORT}`);

});