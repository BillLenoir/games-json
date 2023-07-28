import express from 'express'
import { readFile } from 'fs/promises'
const app = express()

// Serves Express Yourself website
app.use(express.static('public'))

let PORT: number
if (process.env.PORT != null && typeof process.env.PORT === 'number') {
  PORT = process.env.PORT
} else {
  PORT = 4001
}

app.use(express.static('html'))

// Display the indicated page of the games from the indicated file
app.get('/games/:file/:page', (req: express.Request, res: express.Response) => {
  const url: string[] = req.url.split('/')
  const sourceFile: string = `./data/${url[2]}Data.json`
  const currentPage = Number(url[3])

  readSourceFile(sourceFile)
    .then((data) => {
      const readData = JSON.parse(data)
      const from = (currentPage - 1) * 50
      const to = currentPage * 50
      const sendData = readData.slice(from, to)
      sendData.push(Math.ceil(readData.length / 50))
      res.send(sendData)
    })
    .catch((error) => {
      console.error('Error reading file:', error.message)
      res.status(500).send('Error reading file')
    })
})

async function readSourceFile (sourceFile: string): Promise<any> {
  const fileData = await readFile(sourceFile)
  const returnData = JSON.parse(fileData.toString())
  return returnData
}

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
  console.log(`Listening on port ${PORT}`)
})
