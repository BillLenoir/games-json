const fs = require('fs');
const convert = require('xml-js');

// File names for the various data we store.
const rawDataFile = './rawData.json';
const ownDataFile = './ownData.json';
const prevownedDataFile = './prevownedData.json';
const fortradeDataFile = './fortradeData.json';
const wanttobuyDataFile = './wanttobuyData.json';


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
            fs.writeFile(ownDataFile, JSON.stringify(ownData), err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Own File successfully written');
                }
            });
            fs.writeFile(wanttobuyDataFile, JSON.stringify(wanttobuyData), err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Want To Buy File successfully written');
                }
            });
            fs.writeFile(prevownedDataFile, JSON.stringify(prevownedData), err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Previously Owned File successfully written');
                }
            });
            fs.writeFile(fortradeDataFile, JSON.stringify(fortradeData), err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('For Sale File successfully written');
                }
            });
        }
    });
    return;
}

// Only fetch the data if the call requests it.
if (process.argv[2] === true) {
    fetchData();
}

// Always parse the data.
parseData(rawDataFile);