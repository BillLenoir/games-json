import * as convertHydrate from 'xml-js'
import * as fsHydrate from 'fs/promises'

const bggBaseURL = 'https://boardgamegeek.com/xmlapi/'

interface GameItem {
  id: string
  title: string
  yearpublished: string
  thumbnail: string
  publisher: string
  description: string
}

// This is the main function. It triggers all of the work needed
// to request, transform, process, and save the collection data.
async function fetchAndProcessCollectionData (username: string): Promise<void> {
  try {
    // Fetch the data from BGG.
    const collectionData = await fetchCollectionDataFromBGG(username)
    const rawDataFile = './data/rawData.json'
    const message = 'Raw Data File'

    // Write the transformed response from BGG to disk.
    await writeDataToFile(rawDataFile, collectionData, message)

    // Process the returned list of games, sorting them into files
    // according to their status within my collection
    // BILL ==> fix the ANY!!!

    const parsedData: any = await parseData(rawDataFile)

    const dataFiles = [
      { file: './data/haveData.json', data: parsedData.sendHaveData, message: 'Games I HAVE file' },
      { file: './data/wantData.json', data: parsedData.sendWantData, message: 'Games I WANT File' },
      { file: './data/hadData.json', data: parsedData.sendHadData, message: 'Games I HAD File' },
      { file: './data/sellingData.json', data: parsedData.sendSellingData, message: 'Games I am SELLING File' }
    ]

    // Write each file after the system is done parsing the data.
    for (const { file, data, message } of dataFiles) {
      await writeDataToFile(file, data, message)
    }
    // BILL ==> fix the ANY!!!
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// Requests the data from BGG, which returns XML.
// Transform the XML into JSON and return it.
// BILL ==> fix the ANY!!!
async function fetchCollectionDataFromBGG (username: string): Promise<any> {
  const collectionDataRequest = new Request(`${bggBaseURL}collection/${username}`)
  const response = await fetch(collectionDataRequest)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const xmlData = await response.text()
  const responseData = convertHydrate.xml2json(xmlData, { compact: true, spaces: 4 })
  const returnData = JSON.parse(responseData)
  return returnData
}

// Handles all writing to disk.
async function writeDataToFile (file: string, data: object, message: string): Promise<void> {
  await fsHydrate.writeFile(file, JSON.stringify(data))
  console.log(`${message} successfully written`)
}

// Once the collection request has been returned, transformed and saved to disk,
// open the newly saved file and transform each game's games data and save it
// in the appropriate data file.
async function parseData (rawData: string): Promise<{
  sendHaveData: string
  sendWantData: string
  sendHadData: string
  sendSellingData: string
}> {
  const data = await fsHydrate.readFile(rawData)
  const readData = JSON.parse(data.toString())

  const haveData: GameItem[] = []
  const wantData: GameItem[] = []
  const hadData: GameItem[] = []
  const sellingData: GameItem[] = []

  for (const game of readData.items.item) {
    // Data from the collection request.
    // There's no guarantee that the response
    // will contain all of the needed elements.

    const gameID: string = game._attributes.objectid

    const gameTitle: string = game.name._text

    let gameYearPublished: string = ''
    if (game.yearpublished != null) {
      gameYearPublished = game.yearpublished._text
    }

    let gameThumbnail: string = ''
    if (game.thumbnail != null) {
      gameThumbnail = game.thumbnail._text
    }

    const gameData = await fetchGameDataFromBGG(gameID)

    // Data from the game request

    let gameDescription: string = ''
    if (gameData.boardgames.boardgame.description._text != null) {
      gameDescription = gameData.boardgames.boardgame.description._text
    }

    // Some games have more than 1 publisher and the data structure for this differs
    // If it is an array, that means there's more than one. We extract just the publisher
    // name, adding it to an array which is then joined and saved as gamePublisher.
    let gamePublisher: string = ''
    if (gameData.boardgames.boardgame.boardgamepublisher[0] != null) {
      const publisherArray = []
      for (const publisher of gameData.boardgames.boardgame.boardgamepublisher) {
        publisherArray.push(publisher._text)
        gamePublisher = publisherArray.join('xxxxx')
      }
    } else {
      gamePublisher = gameData.boardgames.boardgame.boardgamepublisher._text
    }

    // If the collection request didn't return a thumbnail,
    // maybe the game request did. (maybe)
    if (gameThumbnail === null && gameData.boardgames.boardgame.thumbnail != null) {
      gameThumbnail = gameData.boardgames.boardgame.thumbnail
    }

    // This is the JSON extracted for each game.
    const gameJSON: GameItem = {
      id: gameID,
      title: gameTitle,
      yearpublished: gameYearPublished,
      thumbnail: gameThumbnail,
      publisher: gamePublisher,
      description: gameDescription
    }

    // This is how we determine in which file the game belongs.
    const { own, wanttobuy, prevowned, fortrade } = game.status._attributes
    if (own === '1' || wanttobuy === '1' || prevowned === '1' || fortrade === '1') {
      if (own === '1') haveData.push(gameJSON)
      if (wanttobuy === '1') wantData.push(gameJSON)
      if (prevowned === '1') hadData.push(gameJSON)
      if (fortrade === '1') sellingData.push(gameJSON)
    } else {
      console.log(`-- This game doesn't count: ${gameTitle}`)
    }
  }

  const sendHaveData: string = JSON.stringify(haveData)
  const sendWantData: string = JSON.stringify(wantData)
  const sendHadData: string = JSON.stringify(hadData)
  const sendSellingData: string = JSON.stringify(sellingData)

  return { sendHaveData, sendWantData, sendHadData, sendSellingData }
}

// Not all of the data needed for the website is included in the collection request.
// When parsing the data, make a request for each game. (There's a bunch.)
// BILL ==> fix the ANY!!!
async function fetchGameDataFromBGG (gameID: string): Promise<any> {
  const gameDataRequest = new Request(`${bggBaseURL}boardgame/${gameID}`)
  const response = await fetch(gameDataRequest)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  // As with the collection response, need to tranform the XML into JSON
  const xmlData = await response.text()
  const responseData = convertHydrate.xml2json(xmlData, { compact: true, spaces: 4 })
  const returnData: string = JSON.parse(responseData)
  return returnData
}

// The BGG user ID is an optional paramater when running the system.
// If not present, set to my user name.
let user: string
if (process.argv[2] != null) {
  user = process.argv[2]
} else {
  user = 'BillLenoir'
}

void fetchAndProcessCollectionData(user)
