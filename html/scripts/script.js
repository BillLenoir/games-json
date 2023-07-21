const listDescription = document.getElementById('listDescription');
const gameData = document.getElementById('gameData');
const gameDataTable = document.getElementById('gameDataTable');

const paginationTop = document.getElementById('paginationTop');
const topFirst = document.getElementById('topFirst');
const topPrev = document.getElementById('topPrev');
const topGameCount = document.getElementById('topGameCount');
const topNext = document.getElementById('topNext');
const topLast = document.getElementById('topLast');

const paginationBottom = document.getElementById('paginationBottom');
const bottomFirst = document.getElementById('bottomFirst');
const bottomPrev = document.getElementById('bottomPrev');
const bottomGameCount = document.getElementById('bottomGameCount');
const bottomNext = document.getElementById('bottomNext');
const bottomLast = document.getElementById('bottomLast');

let maxPage;

const bggBaseURL = "https://boardgamegeek.com/boardgame/";

const loadGames = (url) => {
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then((response) => {
            response = JSON.parse(response);
            maxPage = response.pop();
            renderGameList(response);
            const urlArray = url.split('/');
            const pageNum = urlArray.pop();
            const route = urlArray.join('/');
            renderPagination(pageNum, route);
        })
        .then(() => {
            setWidths();
            window.scrollTo(0, 0);
        });
}

const renderGameList = (games) => {
    listDescription.innerHTML = "Games Bill owns, sorted alphabetically by title.";

    let gameHTML = "<table cellspacing='0' cellpadding='0' id='gameDataTable'><tbody>";
    for (let i = 0; i < games.length; i++) {
        gameHTML += '<tr>';
        if (games[i].thumbnail) {
            gameHTML += `<td><img src='${games[i].thumbnail}' alt='Cover image for ${games[i].title}'></td>`;
        } else {
            gameHTML += '<td class="noImage">No Image</td>';
        }
        gameHTML += '<td>';
        gameHTML += `<a href='${bggBaseURL}${games[i].id}'>${games[i].title}</a> `;
        if (games[i].yearpublished) {
            gameHTML += `(${games[i].yearpublished})`;
        }
        if (games[i].publisher) {
            gameHTML += '<br>';
            const publisherList = games[i].publisher.split('xxxxx');
            gameHTML += publisherList.shift();
            if (publisherList.length > 0) {
                const otherPublishers = publisherList.join(', ');
                gameHTML += ` <span class='publisherList' title='${otherPublishers}'>+ ${publisherList.length} more</span>`;
            }
        }
        gameHTML += '</td>';
        gameHTML += '</tr>';
    }
    gameHTML += "</tbody></table>";
    gameData.innerHTML = gameHTML;

}

const renderPagination = (pageNum, route) => {
    pageNum = Number(pageNum);
    let newPageNum;

    if (pageNum > 2) {
        newPageNum = 1;
        topFirst.removeAttribute('disabled');
        topFirst.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
        bottomFirst.removeAttribute('disabled');
        bottomFirst.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
    } else {
        topFirst.removeAttribute('onclick');
        topFirst.setAttribute('disabled', '');
        bottomFirst.removeAttribute('onclick');
        bottomFirst.setAttribute('disabled', '');
    }

    if (pageNum > 1) {
        newPageNum = pageNum - 1;
        topPrev.removeAttribute('disabled');
        topPrev.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
        bottomPrev.removeAttribute('disabled');
        bottomPrev.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
    } else {
        topPrev.removeAttribute('onclick');
        topPrev.setAttribute('disabled', '');
        bottomPrev.removeAttribute('onclick');
        bottomPrev.setAttribute('disabled', '');
    }

    topGameCount.innerHTML = `Page ${pageNum} of ${maxPage}`;
    bottomGameCount.innerHTML = `Page ${pageNum} of ${maxPage}`;

    if (pageNum < maxPage) {
        newPageNum = pageNum + 1;
        topNext.removeAttribute('disabled');
        topNext.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
        bottomNext.removeAttribute('disabled');
        bottomNext.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
    } else {
        topNext.removeAttribute('onclick');
        topNext.setAttribute('disabled', '');
        bottomNext.removeAttribute('onclick');
        bottomNext.setAttribute('disabled', '');
    }

    if (pageNum < maxPage - 1) {
        newPageNum = maxPage;
        topLast.removeAttribute('disabled');
        topLast.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
        bottomLast.removeAttribute('disabled');
        bottomLast.setAttribute('onclick', `loadGames("/games/own/${newPageNum}")`);
    } else {
        topLast.removeAttribute('onclick');
        topLast.setAttribute('disabled', '');
        bottomLast.removeAttribute('onclick');
        bottomLast.setAttribute('disabled', '');
    }

}

const setWidths = () => {
    newWidth = document.getElementById('gameDataTable').clientWidth;
    listDescription.style.width =  `${newWidth}px`;
    paginationTop.style.width = `${newWidth}px`;
    paginationBottom.style.width = `${newWidth}px`;
}