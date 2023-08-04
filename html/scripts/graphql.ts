const elements = {
  listDescription: document.querySelector('#listDescription'),
  gameData: document.querySelector('#gameData'),
  gameDataTable: document.querySelector('#gameDataTable'),
  paginationTop: document.querySelector('#paginationTop'),
  topFirst: document.querySelector('#topFirst'),
  topPrev: document.querySelector('#topPrev'),
  topGameCount: document.querySelector('#topGameCount'),
  topNext: document.querySelector('#topNext'),
  topLast: document.querySelector('#topLast'),
  paginationBottom: document.querySelector('#paginationBottom'),
  bottomFirst: document.querySelector('#bottomFirst'),
  bottomPrev: document.querySelector('#bottomPrev'),
  bottomGameCount: document.querySelector('#bottomGameCount'),
  bottomNext: document.querySelector('#bottomNext'),
  bottomLast: document.querySelector('#bottomLast'),
}

const bggBaseURL = "https://boardgamegeek.com/boardgame/";

const loadData = async (): Promise<void> => {
  await fetch('http://localhost:4000', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetGames {
            games {
              id
              title
              yearpublished
              thumbnail
              publisher
              description
            }
        }`
    })
  })
    .then(async res => await res.json())
    .then(res => {

      alert(res.data.games[0].title)

      let gameHTML = "<table cellspacing='0' cellpadding='0' id='gameDataTable'><tbody>";
      for (const game of res.data.games) {
          gameHTML += '<tr>';
          if (game.thumbnail) {
              gameHTML += `<td><img src='${game.thumbnail}' alt='Cover image for ${game.title}'></td>`;
          } else {
              gameHTML += '<td class="noImage">No Image</td>';
          }
          gameHTML += `<td>
            <h3><a href="${bggBaseURL}${game.id}">${game.title}</a> ${game.yearpublished ? `(${game.yearpublished})` : ''}</h3>
            ${game.description ? game.description : ''}</td>`;
          gameHTML += `<td class='people'>${game.publisher}</td>`;
          gameHTML += '</tr>';
      }
      gameHTML += "</tbody></table>";
      elements.gameData.innerHTML = gameHTML;
    })
}
