const fs = require('fs').promises;
const convert = require('xml-js');

const bggBaseURL = 'https://boardgamegeek.com/xmlapi/';

// This is the main function. It triggers all of the work needed
// to request, transform, process, and save the collection data.
async function fetchAndProcessCollectionData(username) {
    try {

        // Fetch the data from BGG.
        const collectionData = await fetchCollectionDataFromBGG(username);
        const rawDataFile = './data/rawData.json';
        const message = 'Raw Data File';

        // Write the transformed response from BGG to disk.
        await writeDataToFile(rawDataFile, collectionData, message);

        // Process the returned list of games, sorting them into files 
        // according to their status within my collection
        const parsedData = await parseData(rawDataFile);

        const dataFiles = [
            { file: './data/haveData.json', data: parsedData.haveData, message: 'Games I HAVE file' },
            { file: './data/wantData.json', data: parsedData.wantData, message: 'Games I WANT File' },
            { file: './data/hadData.json', data: parsedData.hadData, message: 'Games I HAD File' },
            { file: './data/sellingData.json', data: parsedData.sellingData, message: 'Games I am SELLING File' },
        ];

        // Write each file after the system is done parsing the data.
        for (const { file, data, message } of dataFiles) {
            await writeDataToFile(file, data, message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Requests the data from BGG, which returns XML. 
// Transform the XML into JSON and return it.
async function fetchCollectionDataFromBGG(username) {
    const collectionDataRequest = new Request(`${bggBaseURL}collection/${username}`);
    const response = await fetch(collectionDataRequest);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();
    const responseData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
    const returnData = JSON.parse(responseData);
    return returnData;
}

// Handles all writing to disk.
async function writeDataToFile(file, data, message) {
    await fs.writeFile(file, JSON.stringify(data));
    console.log(`${message} successfully written`);
}

// Once the collection request has been returned, transformed and saved to disk,
// open the newly saved file and transform each game's games data and save it 
// in the appropriate data file.
async function parseData(rawData) {
    const data = await fs.readFile(rawData);
    const readData = JSON.parse(data);
    const haveData = [];
    const wantData = [];
    const hadData = [];
    const sellingData = [];

    for (const game of readData.items.item) {

        // Data from the collection request.
        // There's no guarantee that the response
        // will contain all of the needed elements.

        let gameID = "";
        if (game._attributes.objectid) {
            gameID = game._attributes.objectid;
        }

        let gameTitle = "";
        if (game.name._text) {
            gameTitle = game.name._text;
        }

        let gameYearPublished = "";
        if (game.yearpublished) {
            gameYearPublished = game.yearpublished._text;
        }

        let gameThumbnail = "";
        if (game.thumbnail) {
            gameThumbnail = game.thumbnail._text;
        }

        const gameData = await fetchGameDataFromBGG(gameID);

        // Data from the game request

        let gameDescription = "";
        if (gameData.boardgames.boardgame.description._text) {
            gameDescription = gameData.boardgames.boardgame.description._text;
        }


        // Some games have more than 1 publisher and the data structure for this differs
        // If it is an array, that means there's more than one. We extract just the publisher
        // name, adding it to an array which is then joined and saved as gamePublisher.
        let gamePublisher = "";
        if (gameData.boardgames.boardgame.boardgamepublisher[0]) {
            let publisherArray = [];
            for (const publisher of gameData.boardgames.boardgame.boardgamepublisher) {
                publisherArray.push(publisher._text);
                gamePublisher = publisherArray.join('xxxxx');
            }
        } else {
            gamePublisher = gameData.boardgames.boardgame.boardgamepublisher._text;
        }

        // If the collection request didn't return a thumbnail,
        // maybe the game request did. (maybe)
        if (!gameThumbnail && gameData.boardgames.boardgame.thumbnail) {
            gameThumbnail = gameData.boardgames.boardgame.thumbnail;
        }

        // This is the JSON extracted for each game.
        const gameJSON = {
            "id": gameID,
            "title": gameTitle,
            "yearpublished": gameYearPublished,
            "thumbnail": gameThumbnail,
            "publisher": gamePublisher,
            "description": gameDescription
        }

        // This is how we determine in which file the game belongs.
        const { own, wanttobuy, prevowned, fortrade } = game.status._attributes;
        if (own === '1' || wanttobuy === '1' || prevowned === '1' || fortrade === '1') {
            if (own === '1') haveData.push(gameJSON);
            if (wanttobuy === '1') wantData.push(gameJSON);
            if (prevowned === '1') hadData.push(gameJSON);
            if (fortrade === '1') sellingData.push(gameJSON);
        } else {
            console.log(`-- This game doesn't count: ${game.name._text}`);
        }
    }

    return { haveData, wantData, hadData, sellingData };
}

// Not all of the data needed for the website is included in the collection request.
// When parsing the data, make a request for each game. (There's a bunch.)
async function fetchGameDataFromBGG(gameID) {
    const gameDataRequest = new Request(`${bggBaseURL}boardgame/${gameID}`);
    const response = await fetch(gameDataRequest);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // As with the collection response, need to tranform the XML into JSON
    const xmlData = await response.text();
    const responseData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
    const returnData = JSON.parse(responseData);
    return returnData;
}


// The BGG user ID is an optional paramater when running the system.
// If not present, set to my user name.
const user = process.argv[2] || 'BillLenoir';

fetchAndProcessCollectionData(user);