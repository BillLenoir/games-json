const fs = require('fs');
const convert = require('xml-js');

// File names for the various data we store.
const rawDataFile = './data/rawData.json';
const ownDataFile = './data/ownData.json';
const prevownedDataFile = './data/prevownedData.json';
const fortradeDataFile = './data/fortradeData.json';
const wanttobuyDataFile = './data/wanttobuyData.json';


const fetchData = () => {

    // The argument passed in to indicate for whose collection should we collect data.
    // Defaults to BillLenoir if not provided.
    const user = process.argv[3] || 'BillLenoir';

    // This is the URL used to request the collection data.
    const dataRequest = new Request(`https://boardgamegeek.com/xmlapi/collection/${user}`);

    // Fetch the data from Board Game Geek,
    // convert it to XML, and then
    // write it to disk.
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
            fs.writeFile(rawDataFile, response, err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Raw Data File successfully written');
                }
            });
        })
        .then(() => {
            parseData(rawDataFile);
        });
}

const parseData = (rawData) => {
    const ownData = [];
    const prevownedData = [];
    const fortradeData = [];
    const wanttobuyData = [];

    fs.readFile(rawData, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            const readData = JSON.parse(data);
            for (let i = 0; i < readData.items.item.length; i++) {
                if (readData.items.item[i].status._attributes.own === '1') {
                    ownData.push(readData.items.item[i]);
                } else if (readData.items.item[i].status._attributes.wanttobuy === '1') {
                    wanttobuyData.push(readData.items.item[i])
                } else if (readData.items.item[i].status._attributes.prevowned === '1') {
                    prevownedData.push(readData.items.item[i])
                } else if (readData.items.item[i].status._attributes.fortrade === '1') {
                    fortradeData.push(readData.items.item[i])
                } else {
                    console.log(`This game doesn't count: ${readData.items.item[i].name._text}`);
                }
            }
            writeFile(ownDataFile, ownData, 'Own File');
            writeFile(wanttobuyDataFile, wanttobuyData, 'Want To Buy File');
            writeFile(prevownedDataFile, prevownedData, 'Previously Owned File');
            writeFile(fortradeDataFile, fortradeData, 'For Sale File');
        }
    });
    return;
}

const writeFile = (file, data, message) => {
    fs.writeFile(file, JSON.stringify(data), err => {
        if (err) {
            console.log(err);
        } else {
            console.log(`${message} successfully written`);
        }
    });
    return;
}

// This triggers everything
fetchData();