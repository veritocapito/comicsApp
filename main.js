const container = document.getElementById('container');
let contentHtml = '';
const results = document.getElementById('results');
let resultsHtml = '';

const urlBase = 'https://gateway.marvel.com:443/v1/public/';

// Function to fetch data (comics or characters)
function getData(searchValue = '', sortValue = '', type = 'comics') {
    let baseURL = `${urlBase}${type}?`;

    // Handle sorting
    if (sortValue) {
        if (type === 'comics') {
            if (sortValue === 'title-asc') {
                baseURL += 'orderBy=title&';
            } else if (sortValue === 'title-desc') {
                baseURL += 'orderBy=-title&';
            } else if (sortValue === 'date-asc') {
                baseURL += 'orderBy=focDate&';
            } else if (sortValue === 'date-desc') {
                baseURL += 'orderBy=-focDate&';
            }
        } else if (type === 'characters') {
            if (sortValue === 'name-asc') {
                baseURL += 'orderBy=name&';
            } else if (sortValue === 'name-desc') {
                baseURL += 'orderBy=-name&';
            }
        }
    }

    // Add search value filtering, if applicable
    if (searchValue) {
        if (type === 'comics') {
            baseURL += `titleStartsWith=${searchValue}&`;
        } else if (type === 'characters') {
            baseURL += `nameStartsWith=${searchValue}&`;
        }
    }

    baseURL += `ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`;
    console.log(baseURL);

    // Fetch and display results
    fetch(baseURL)
        .then(res => res.json())
        .then(info => {
            const totalResults = info.data.total;
            console.log('Total results: ', totalResults);

            resultsHtml = `
                <h5 class="results-title">RESULTS</h5>
                <p class="results-counter">${totalResults} TOTAL RESULTS</p>
            `;
            results.innerHTML = resultsHtml;

            // Render results based on type
            if (type === 'comics') {
                setComics(info.data.results);
            } else {
                setCharacters(info.data.results);
            }
        })
        .catch(err => console.log(err));
}

// Function to display comics (with forEach)
function setComics(comics) {
    contentHtml = '';
    comics.forEach(comic => {
        const comicTitle = comic.title;
        const comicAuthors = comic.creators.items;
        const authorName = comicAuthors.length > 0 ? comicAuthors[0].name : 'Marvel';

        const comicImg = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        const comicUrl = comic.urls.length > 0 ? comic.urls[0].url : '#';

        contentHtml += `
        <div class="card col-md-4 mt-3 mb-3 comic-card">
            <div class="img-container">
                <img src="${comicImg}" class="card-img img-fluid" alt="${comicTitle}">
            </div>
            <div class="card-body">
                <h5 class="card-title"><a href="${comicUrl}" target="_blank">${comicTitle}</a></h5>
                <p class="card-text">Creator: ${authorName}</p>
            </div>
        </div>`;
    });
    container.innerHTML = contentHtml;
}

// Function to display characters (with forEach)
function setCharacters(characters) {
    contentHtml = '';
    characters.forEach(character => {
        const characterId = character.id;
        const characterImg = `${character.thumbnail.path}.${character.thumbnail.extension}`;
        const characterName = character.name;
        const characterInfo = character.description || 'No description available';
        const characterComics = character.comics.available;

        contentHtml += `
        <div class="card col-md-4 mt-3 mb-3 comic-card" data-id="${characterId}" data-name="${characterName}" data-img="${characterImg}" data-info="${characterInfo}">
            <div class="img-container">
                <img src="${characterImg}" class="card-img img-fluid" alt="${characterName}">
            </div>
            <div class="card-body">
                <h5 class="card-title">${characterName}</h5>
                <p class="card-text">Comics: ${characterComics}</p>
            </div>
        </div>`;
    });
    container.innerHTML = contentHtml;

    // Add event listener to each character card
    document.querySelectorAll('.comic-card').forEach(card => {
        card.addEventListener('click', function () {
            const characterId = this.getAttribute('data-id');
            const characterName = this.getAttribute('data-name');
            const characterImg = this.getAttribute('data-img');
            const characterInfo = this.getAttribute('data-info');

            setCharacterComics(characterId, characterName, characterImg, characterInfo);
        });
    });
}

// Function to filter and combine input and selects
function filterData() {
    const searchInput = document.getElementById('search-input').value.trim();
    const searchType = document.getElementById('search-type').value;
    const searchSort = document.getElementById('search-sort').value;

    getData(searchInput, searchSort, searchType);
}

// Event listener for search form submission
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    filterData(); 
});

getData();


function setCharacterComics(characterId, characterName, characterImg, characterInfo) {
    contentHtml = ``;

    fetch(`https://gateway.marvel.com:443/v1/public/characters/${characterId}/comics?ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`)
        .then(res => res.json())
        .then(info => {
            const comics = info.data.results;
            const comicsCount = comics.length;

            contentHtml += `
                <div class="col-12 d-flex mb-3">
                    <div class="card-header col-md-4 mt-3 mb-3">
                        <img src="${characterImg}" class="card-img img-thumbnail character-img" alt="${characterName}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <h3 class="mt-3 mb-3">${characterName}</h3>
                        <p class="card-text text-wrap-balance">${characterInfo}</p>
                    </div>
                </div>
                <div class="col-12 mb-3">
                    <h4 class="mt-2 mb-3">COMICS</h4>
                    <p class="results-comics">${comicsCount} RESULTS</p>
                </div>
            `

            for (let i = 0; i < comics.length; i++) {
                const comicTitle = comics[i].title;
                const comicImg = `${comics[i].thumbnail.path}.${comics[i].thumbnail.extension}`;
                const comicUrl = comics[i].urls[0].url;


                contentHtml += `
                <div class="card col-md-4 mt-3 mb-3 comic-card card2">
                    <div class="character">
                        <img src="${comicImg}" class="card-img img-fluid" alt="${comicTitle}">
                    </div>
                    <div class="card-body">
                        <p class="card-title"><a href="${comicUrl}" class="text-dark" target="_blank">${comicTitle}</a></p>
                    </div>
                </div>`;
            }
            container.innerHTML = contentHtml;
        })
        .catch(err => console.log(err));
}


// Pagination controls
const add = document.querySelector('#add');
const subs = document.querySelector('#subs');
const firstPage = document.querySelector('#first-page');
const lastPage = document.querySelector('#last-page');
const pages = document.querySelector('#pages');

add.addEventListener('click', () => {
    pages.textContent = counter < 10 ? ++counter : pages.textContent;
    getData();
});

subs.addEventListener('click', () => {
    pages.textContent = counter > 1 ? --counter : pages.textContent;
    getData();
});

firstPage.addEventListener('click', () => {
    counter = 1;
    pages.textContent = counter;
    getData();
});

lastPage.addEventListener('click', () => {
    counter = 10;
    pages.textContent = counter;
    getData();
});
