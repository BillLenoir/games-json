// All of the HTML elements we manipulate
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
};

let maxPage;

const bggBaseURL = "https://boardgamegeek.com/boardgame/";

// The main function. This makes the call back to the server
// and triggers the functions that process the response.
const loadGames = (url) => {
    fetch(url)
        .then(handleFetchErrors)
        .then(response => response.json())
        .then(data => {
            maxPage = data.pop();
            renderGameList(data);
            const urlArray = url.split('/');
            const pageNum = Number(urlArray.pop());
            const route = urlArray.join('/');
            renderPagination(pageNum, route);
        })
        .then(() => {
            setWidths();
            window.scrollTo(0, 0);
        })
        .catch(error => console.error('Error:', error.message));
};

// Finally wrote a catchall error processor
const handleFetchErrors = (response) => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;
};

// Creates a row in the table for each game.
const renderGameList = (games) => {
    elements.listDescription.textContent = "Games Bill owns, sorted alphabetically by title.";
    let gameHTML = "<table cellspacing='0' cellpadding='0' id='gameDataTable'><tbody>";
    for (const game of games) {
        gameHTML += '<tr>';
        if (game.thumbnail) {
            gameHTML += `<td><img src='${game.thumbnail}' alt='Cover image for ${game.title}'></td>`;
        } else {
            gameHTML += '<td class="noImage">No Image</td>';
        }
        gameHTML += `<td>
          <h3><a href="${bggBaseURL}${game.id}">${game.title}</a> ${game.yearpublished ? `(${game.yearpublished})` : ''}</h3>
          ${game.description ? game.description : ''}</td>`;
        gameHTML += `<td class='people'>${game.publisher ? getPublisherHTML(game.publisher) : ''}</td>`;
        gameHTML += '</tr>';
    }
    gameHTML += "</tbody></table>";
    elements.gameData.innerHTML = gameHTML;
};

// Publisher data needs some extra process because there might be more than one
// The data is formatted difference for 1 publisher vs. multiple.
const getPublisherHTML = (publisher) => {
    const publisherList = publisher.split('xxxxx');
    let html = publisherList.shift();
    if (publisherList.length > 0) {
        const otherPublishers = publisherList.join(', ');
        html += ` <span class='publisherList' title='${otherPublishers}'>+ ${publisherList.length} more</span>`;
    }
    return html;
};

// Turns off/on the pagination buttons depending upon which page the user is viewing.
const renderPagination = (pageNum, route) => {
    elements.topFirst.disabled = elements.bottomFirst.disabled = pageNum <= 2;
    elements.topFirst.onclick = elements.bottomFirst.onclick = () => loadGames(`${route}/1`);

    elements.topPrev.disabled = elements.bottomPrev.disabled = pageNum <= 1;
    elements.topPrev.onclick = elements.bottomPrev.onclick = () => loadGames(`${route}/${pageNum - 1}`);

    elements.topGameCount.textContent = elements.bottomGameCount.textContent = `Page ${pageNum} of ${maxPage}`;

    elements.topNext.disabled = elements.bottomNext.disabled = pageNum >= maxPage;
    elements.topNext.onclick = elements.bottomNext.onclick = () => loadGames(`${route}/${pageNum + 1}`);

    elements.topLast.disabled = elements.bottomLast.disabled = pageNum >= maxPage - 1;
    elements.topLast.onclick = elements.bottomLast.onclick = () => loadGames(`${route}/${maxPage}`);
};

// Makes the pagination width equal to the game table's width.
const setWidths = () => {
    newWidth = document.getElementById('gameDataTable').clientWidth;
    listDescription.style.width = paginationTop.style.width = paginationBottom.style.width = `${newWidth}px`;
}