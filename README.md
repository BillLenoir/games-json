# Bill's Game collection

After downloading the code, run:

`npm init`

Then, from the command line, run:

`node data-collector.js [BGG User Name]`

The BGG User Name is optional, will use BillLenoir if one is not provided.

## Data Files
- **rawData.json**: This contains the whole response from BGG, converted to JSON from XML
- **fortradeData.json**: This list of games that I own, which I'm trying to sell or trade away.
- **ownData.json**: These are the games currently in my posession.
- **prevownedData.json**: Games I have gotten rid of.
- **wanttobuyData.json**: This is my want list.