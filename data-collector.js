const fs = require('fs');
const convert = require('xml-js');

const user = process.argv[2] || 'BillLenoir';
const dataRequest = new Request(`https://boardgamegeek.com/xmlapi/collection/${user}`);

fetch(dataRequest)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then((response) => {
        response = convert.xml2json(response, { compact: true, spaces: 4 });
        return response;
    })
    .then((response) => {
        fs.writeFile('./rawData.json', response, err => {
            if (err) {
                console.log(err);
            } else {
                console.log('File successfully written');
            }
        });
        const jsonResponse = JSON.parse(response);
    });
