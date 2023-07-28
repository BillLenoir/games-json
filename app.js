"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fsApp = require("fs");
const app = express();
// Serves Express Yourself website
app.use(express.static('public'));
let PORT;
if (process.env.PORT != null) {
    PORT = Number(process.env.PORT);
}
else {
    PORT = 4001;
}
app.use(express.static('html'));
// File names for the various data we store.
// I've commented this out becuase I'm having difficulties
// typing the sourceFile variable
// const dataFiles: { have: string, want: string, gone: string, selling: string } = {
//  have: './data/haveData.json',
//  want: './data/wantData.json',
//  gone: './data/hadData.json',
//  selling: './data/sellingData.json'
// }
// Display the indicated page of the games from the indicated file
// BILL ==> fix the ANY!!!
app.get('/games/:file/:page', (req, res) => {
    const url = req.url.split('/');
    const sourceFile = `./data/${url[2]}Data.json`;
    //    const sourceFile: string = dataFiles[req.params.file]
    // BILL ==> fix the ANY!!!
    fsApp.readFile(sourceFile, (err, data) => {
        if (err != null) {
            console.log(err);
        }
        else {
            const readData = JSON.parse(data);
            const currentPage = Number(url[3]);
            const from = (currentPage - 1) * 50;
            const to = currentPage * 50;
            const sendData = readData.slice(from, to);
            sendData.push(Math.ceil(readData.length / 50));
            res.send(sendData);
        }
    });
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
