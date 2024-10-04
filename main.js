const container = document.getElementById('container');
let contentHtml = '';
const results = document.getElementById('results');
let resultsHtml = '';

let query = 'comics'; // Default search is for comics
let counter = 1;

const urlBase = 'https://gateway.marvel.com:443/v1/public/';
const url = new URL(`${urlBase}${query}`);
url.searchParams.set('ts', TS);
url.searchParams.set('apikey', API_KEY);
url.searchParams.set('hash', API_HASH);

// Function to fetch data (comics or characters)
function getData(searchValue = '', sortValue = '', type = 'comics') {
    let baseURL = `${urlBase}${type}?`;

    // Handle sorting
    if (sortValue) {
        if (type === 'comics') {
            // Comics: allow sorting by title or release date (newest/oldest)
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
            // Characters: allow sorting only by name
            if (sortValue === 'name-asc') {
                baseURL += 'orderBy=name&';
            } else if (sortValue === 'name-desc') {
                baseURL += 'orderBy=-name&';
            }
        }
    }

    // Set search parameters based on input, but only if searchValue is not empty
    if (searchValue) {
        if (type === 'comics') {
            baseURL += `titleStartsWith=${encodeURIComponent(searchValue)}&`;
        } else if (type === 'characters') {
            baseURL += `nameStartsWith=${encodeURIComponent(searchValue)}&`;
        }
    }

    // Add the required API parameters at the end
    baseURL += `ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`;

    // Fetch the data and display the results
    fetch(baseURL)
        .then(res => res.json())
        .then(info => {
            const totalResults = info.data.total;
            console.log('Total results: ', totalResults);

            // Display the total number of results
            resultsHtml = `
                <h5 class="results-title">RESULTS</h5>
                <p class="results-counter">${totalResults} TOTAL RESULTS</p>
            `;
            results.innerHTML = resultsHtml;

            // Call the appropriate function to render results
            if (type === 'comics') {
                setComics(info.data.results);
            } else {
                setCharacters(info.data.results);
            }
        })
        .catch(err => console.log(err));
}

// Event listener for search form submission
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get values from the input and selects
    const searchInput = document.getElementById('search-input').value.trim();
    const searchType = document.getElementById('search-type').value;
    let searchSort = document.getElementById('search-sort').value; 

    // If searching for characters, ensure sorting is only by name
    if (searchType === 'characters') {
        if (searchSort === 'date-asc' || searchSort === 'date-desc') {
            searchSort = ''; // Disable date sorting for characters
        }
    }

    // Call getData with the search parameters from the form
    getData(searchInput, searchSort, searchType);
});

// Function to display comics
function setComics(comics) {
    contentHtml = '';

    for (let i = 0; i < comics.length; i++) {
        const comicTitle = comics[i].title;
        const comicAuthors = comics[i].creators.items;
        const authorName = comicAuthors.length > 0 ? comicAuthors[0].name : 'Marvel';

        const comicImg = `${comics[i].thumbnail.path}.${comics[i].thumbnail.extension}`;
        const comicUrl = comics[i].urls.length > 0 ? comics[i].urls[0].url : '#';

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
    }
    container.innerHTML = contentHtml;
}

// Function to display characters
function setCharacters(characters) {
    contentHtml = '';

    for (let i = 0; i < characters.length; i++) {
        const characterId = characters[i].id;
        const characterImg = `${characters[i].thumbnail.path}.${characters[i].thumbnail.extension}`;
        const characterName = characters[i].name;
        const characterInfo = characters[i].description || 'No description available';
        const characterComics = characters[i].comics.available;

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
    }
    container.innerHTML = contentHtml;

    // Add event listener to each character card to fetch and display comics for that character
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

// Event listener for search form submission
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const searchInput = document.getElementById('search-input').value.trim();
    const searchType = document.getElementById('search-type').value;
    const searchSort = document.getElementById('search-sort').value;

    // If searching for characters, ensure sorting is only by name
    if (searchType === 'characters') {
        if (searchSort === 'date-asc' || searchSort === 'date-desc') {
            searchSort = ''; // Disable date sorting for characters
        }
    }

    getData(searchInput, searchSort, searchType);
});

// Call getData() initially to load comics by default
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
