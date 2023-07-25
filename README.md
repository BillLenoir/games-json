# Bill's Game collection

After downloading the code, run:

`npm init`

## Collection Hydration

Then, from the command line, run (this will take a couple of minutes):

`node hydrate-collection-json.js [BGG User Name]`

The BGG User Name is optional, will use BillLenoir if one is not provided.

### Data Files
- **rawData.json**: This contains the whole response from BGG, converted to JSON from XML
- These files contain only those elements needed for the website.
    - **fortradeData.json**: This list of games that I own, which I'm trying to sell or trade away.
    - **ownData.json**: These are the games currently in my posession.
    - **prevownedData.json**: Games I have gotten rid of.
    - **wanttobuyData.json**: This is my want list.

## Website

Run from the command line:

`node app.js`

You will know it's running if you see `Listening on port 4001`