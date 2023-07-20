const gameData = document.getElementById('gameData');
const bggBaseURL = "https://boardgamegeek.com/boardgame/";
let route = "/games/own";
let pageNum = 1;

const loadGames = () => {
    const fetchUrl = `${route}/${pageNum}`;
    fetch(fetchUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then((response) => {
            response = JSON.parse(response);
            const maxPage = response.pop();
            gameData.innerHTML = "<h2>Games Bill owns, sorted alphabetically by title.</h2>";
            
            let gameHTML = "<table cellspacing='0'><tbody>";
            for (let i = 0; i < response.length; i++) {
                gameHTML += '<tr>';
                if (response[i].thumbnail) {
                    gameHTML += `<td><img src='${response[i].thumbnail}' alt='Cover image for ${response[i].title}'></td>`;
                } else {
                    gameHTML += '<td class="noImage">No Image</td>';
                }
                gameHTML += '<td>';
                gameHTML += `<a href='${bggBaseURL}${response[i].id}'>${response[i].title}</a> `;
                if (response[i].yearpublished) {
                    gameHTML += `(${response[i].yearpublished})`;
                }
                if (response[i].publisher) {
                    gameHTML += `<br>${response[i].publisher}`;
                }
                gameHTML += '</td>';
                gameHTML += '</tr>';
            }
            gameHTML += "</tbody></table>";
            gameData.innerHTML += gameHTML;
        })
}

const renderGameList = (gameData) => {
}

