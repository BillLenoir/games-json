const fs = require('fs').promises;
const convert = require('xml-js');

const collectionDataUrl = 'https://boardgamegeek.com/xmlapi/collection/';

async function fetchAndProcessCollectionData(username) {
    try {
        const xmlData = await fetchCollectionDataFromBGG(username);
        const rawDataFile = './data/rawData.json';
        const message = 'Raw Data File';
        await writeDataToFile(rawDataFile, xmlData, message);
        const parsedData = await parseData(rawDataFile);

        const dataFiles = [
            { file: './data/ownData.json', data: parsedData.ownData, message: 'Own File' },
            { file: './data/wanttobuyData.json', data: parsedData.wanttobuyData, message: 'Want To Buy File' },
            { file: './data/prevownedData.json', data: parsedData.prevownedData, message: 'Previously Owned File' },
            { file: './data/fortradeData.json', data: parsedData.fortradeData, message: 'For Sale File' },
        ];

        for (const { file, data, message } of dataFiles) {
            await writeDataToFile(file, data, message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function fetchCollectionDataFromBGG(username) {
    const collectionDataRequest = new Request(`${collectionDataUrl}${username}`);
    const response = await fetch(collectionDataRequest);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();
    const responseData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
    const returnData = JSON.parse(responseData);
    return returnData;
}

async function writeDataToFile(file, data, message) {
    await fs.writeFile(file, JSON.stringify(data));
    console.log(`${message} successfully written`);
}

async function parseData(rawData) {
    const data = await fs.readFile(rawData);
    const readData = JSON.parse(data);
    const ownData = [];
    const prevownedData = [];
    const fortradeData = [];
    const wanttobuyData = [];

    for (const game of readData.items.item) {
        const { own, wanttobuy, prevowned, fortrade } = game.status._attributes;

        if (own === '1' || wanttobuy === '1' || prevowned === '1' || fortrade === '1') {
            if (own === '1') ownData.push(game);
            if (wanttobuy === '1') wanttobuyData.push(game);
            if (prevowned === '1') prevownedData.push(game);
            if (fortrade === '1') fortradeData.push(game);
        } else {
            console.log(`-- This game doesn't count: ${game.name._text}`);
        }
    }

    return { ownData, wanttobuyData, prevownedData, fortradeData };
}

fetchAndProcessCollectionData('BillLenoir');
