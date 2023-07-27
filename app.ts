import express from "express"
import { readFile } from 'fs/promises'
const fsApp = express()

// Serves Express Yourself website
fsApp.use(express.static('public'))

let PORT: number
if (process.env.PORT != null) {
  PORT = Number(process.env.PORT)
} else {
  PORT = 4001
}

fsApp.use(express.static('html'))

fsApp.get('/games/:file/:page', async (req: express.Request, res: express.Response) => {
  const url: string[] = req.url.split('/')
  const sourceFile: string = `./data/${url[2]}Data.json`

  fsApp.readFile(sourceFile)
    .then((data: { toString: () => any }) => {
      let readData = data.toString()
      readData = JSON.parse(readData)
      console.log(readData)
      const currentPage = Number(url[3])
      const from = (currentPage - 1) * 50
      const to = currentPage * 50
      const sendData = readData.slice(from, to)
      sendData.push(Math.ceil(readData.length / 50))
      res.send(sendData)
    })
    .catch((error: { message: any }) => {
      console.error('Error reading file:', error.message)
      res.status(500).send('Error reading file')
    })
})

fsApp.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
