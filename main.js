const container = document.getElementById('container');
let contentHtml = '';
const results = document.getElementById('results');
let resultsHtml = '';

const API_KEY = 'd0bac062c296448e513e8a3147810f19';
const TS = '1';
const API_HASH = '5e6eef74abfa220a102df0024190f6e7';

let currentPage = 1;
const resultsPerPage = 20;
let totalPages = 1;

let searchType = document.getElementById('search-type').value;
let searchValue = document.getElementById('search-input').value.trim();
let sortValue = document.getElementById('search-sort').value;

// Store previous search parameters
let previousSearchValue = '';
let previousSortValue = '';
let previousSearchType = '';

const urlBase = 'https://gateway.marvel.com:443/v1/public/';

// Update sorting options based on search type
function updateSortOptions() {
    const sortSelect = document.getElementById('search-sort');
    const searchType = document.getElementById('search-type').value;

    sortSelect.innerHTML = ''; 

    if (searchType === 'comics') {
        sortSelect.innerHTML = `
            <option value="title-asc">A-Z</option>
            <option value="title-desc">Z-A</option>
            <option value="date-asc">Oldest</option>
            <option value="date-desc">Newest</option>
        `;
    } else if (searchType === 'characters') {
        sortSelect.innerHTML = `
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
        `;
    }
}

// Event listener to update sorting options when search type changes
document.getElementById('search-type').addEventListener('change', updateSortOptions);

// Function to fetch data (comics or characters) with pagination
function getData(searchValue, sortValue, searchType) {
    const baseUrl = new URL(`${urlBase}${searchType}`);
    const offset = (currentPage - 1) * resultsPerPage;

    const params = new URLSearchParams();
    contentHtml = '';
    container.classList.add('loading');

    // Add sorting first
    if (sortValue) {
        const sortOptions = {
            'title-asc': 'title',
            'title-desc': '-title',
            'name-asc': 'name',
            'name-desc': '-name',
            'date-asc': 'focDate',
            'date-desc': '-focDate'
        };
        params.set('orderBy', sortOptions[sortValue] || '');
    }

    // Add limit and offset
    params.set('limit', resultsPerPage);
    params.set('offset', offset);

    // Add search filtering
    if (searchValue) {
        if (searchType === 'comics') {
            params.set('titleStartsWith', searchValue);
        } else if (searchType === 'characters') {
            params.set('nameStartsWith', searchValue);
        }
    }

    // Add authentication parameters
    params.set('apikey', API_KEY);
    params.set('ts', TS);
    params.set('hash', API_HASH);

    // Append search params to the base URL
    baseUrl.search = params.toString();

    // Fetch and display results
    fetch(baseUrl)
        .then(res => res.json())
        .then(info => {
            if (info.code !== 200) {
                throw new Error(`Error ${info.code}: ${info.status}`);
            }

            const totalResults = info.data.total;
            totalPages = Math.ceil(totalResults / resultsPerPage);
            console.log(`Total results: ${totalResults}, Total pages: ${totalPages}, Actual page: ${currentPage}`);

            resultsHtml = `
                <h5 class="results-title">RESULTS</h5>
                <p class="results-counter">${totalResults} TOTAL RESULTS</p>
            `;
            results.innerHTML = resultsHtml;

            // Render results based on searchType
            if (searchType === 'comics') {
                setComics(info.data.results);
            } else {
                setCharacters(info.data.results);
            }

            updatePaginationButtons();
        })
        .catch(err => console.log(err))
        .finally(() => {
            container.classList.remove('loading');
        });
}

// Function to display comics
function setComics(comics) {
    contentHtml = '';
    comics.forEach(comic => {
        const comicTitle = comic.title;
        const comicAuthors = comic.creators.items;
        const authorName = comicAuthors.length > 0 ? comicAuthors[0].name : 'Marvel';

        const comicImg = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        const comicUrl = comic.urls.length > 0 ? comic.urls[0].url : '#';

        const comicId = comic.id;

        contentHtml += `
        <div class="card col-md-4 mt-3 mb-3 comic-card" data-id="${comicId}">
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

    document.querySelectorAll('.comic-card').forEach(card => {
        card.addEventListener('click', function () {
            const comicId = this.getAttribute('data-id');
            displayComicDetails(comicId);
        });
    });
}

// Function to display comic details
function displayComicDetails(comicId) {
    document.getElementById('main').classList.add('d-none');
    container.classList.add('loading');

    fetch(`https://gateway.marvel.com:443/v1/public/comics/${comicId}?ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`)
        .then(res => res.json())
        .then(info => {
            const comic = info.data.results[0];
            console.log(comic);
            console.log(comic.characters);

            const comicTitle = comic.title;
            const comicImg = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
            const comicReleaseDate = comic.dates.find(date => date.type === 'onsaleDate').date;
            const comicWriters = comic.creators.items
                .filter(creator => creator.role.toLowerCase() === 'writer')
                .map(writer => writer.name)
                .join(', ');
            const comicDescription = comic.description || 'No description available.';
            const comicCharacters = comic.characters.items;

            const comicDetailsHtml = `
                <div class="col-12 d-flex flex-column gap-5 mt-3 mb-3" id="comic-details">
                    <div class="col-12 d-flex col-md-8 gap-3 mt-3 mb-3 comic">
                        <div class="img-character col-md-4 mt-3 mb-3">
                            <img src="${comicImg}" class="card-img img-fluid" alt="${comicTitle}">
                        </div>
                        <div class="col-md-8 mt-3 mb-3 info">
                            <h2>${comicTitle}</h2>
                            <p class="card-text mt-3 mb-3"><strong>Release Date:</strong> ${new Date(comicReleaseDate).toLocaleDateString()}</p>
                            <p class="card-text mt-3 mb-3"><strong>Writers:</strong> ${comicWriters || 'Unknown'}</p>
                            <p class="card-text mt-3 mb-3"><strong>Description:</strong> ${comicDescription}</p>
                            <button id="back-button" class="btn btn-dark mt-5">Back to Comics</button>
                        </div>
                    </div>
                    <div id="characters-section" class="characters-section col gap-3 mt-3 mb-3">
                        <h4>Characters:</h4>
                        <p class="results-counter">${comic.characters.available} RESULTS</p>
                        <div class="d-flex col gap-3 flex-wrap" id="characters-container"></div>
                    </div>
                </div>
            `;

            results.innerHTML = comicDetailsHtml;

            // If there are characters, fetch their details
            if (comicCharacters.length > 0) {
                displayComicCharacters(comicCharacters); // New function to fetch character details
            } else {
                document.getElementById('characters-container').innerHTML = '<p>No characters available.</p>';
            }

            // Back button to return to comics list
            document.getElementById('back-button').addEventListener('click', function () {
                document.getElementById('main').classList.remove('d-none');
                document.getElementById('comic-details').classList.add('d-none');
                getData(searchValue, sortValue, 'comics');
            });
        })
        .catch(err => console.log(err))
        .finally(() => {
            container.classList.remove('loading');
        });
        
}

// Function to display characters
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
            <div class="card-body mt-2">
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

// Function to display character's comics and add back button
function setCharacterComics(characterId, characterName, characterImg, characterInfo) {

    contentHtml = ``;
    document.getElementById('pagination-controls').classList.add('d-none');
    console.log(previousSearchValue, previousSearchType, previousSortValue);

    container.classList.add('loading');

    fetch(`https://gateway.marvel.com:443/v1/public/characters/${characterId}/comics?ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`)
        .then(res => res.json())
        .then(info => {
            const comics = info.data.results;
            const comicsCount = comics.length;

            contentHtml += `
            <div class="col-12 col-md-8 d-flex flex-column character-container gap-5 mt-3 mb-3">
                <div class="col-12 d-flex flex-wrap gap-4 mb-3 character-info">
                    <div class="card-header col-md-4 mt-3 mb-3">
                        <img src="${characterImg}" class="card-img img-fluid character-img" alt="${characterName}">
                    </div>
                    <div class="col-md-6 mt-2 mb-3 flex-column gap-4 info">
                        <h3 class="mt-3 mb-3">${characterName}</h3>
                        <p class="card-text text-wrap-balance mt-3 mb-3">${characterInfo}</p>
                        <div class="col-12 mt-4">
                            <button id="back-button" class="btn btn-dark">Back to Characters</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container results">
                <h4 class="mt-2 mb-3">COMICS</h4>
                <p class="results-comics">${comicsCount} RESULTS</p>
            </div>
            `;

            if (comicsCount > 0) {
                comics.forEach(comic => {
                    const comicTitle = comic.title;
                    const comicImg = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
                    const comicUrl = comic.urls[0].url;

                    contentHtml += `
                    <div class="card col-md-4 mt-3 mb-3 comic-card character-card bg-dark">
                        <div class="character-img">
                            <img src="${comicImg}" class="card-img img-fluid" alt="${comicTitle}">
                        </div>
                        <div class="card-body">
                            <p class="card-title"><a href="${comicUrl}" class="text-white" target="_blank">${comicTitle}</a></p>
                        </div>
                    </div>`;
                });
            } else {
                contentHtml += `<p>No comics available for this character.</p>`;
            }

            container.innerHTML = contentHtml;

            document.getElementById('back-button').addEventListener('click', function () {
                document.getElementById('pagination-controls').classList.remove('d-none');
                getData(previousSearchValue, previousSortValue, 'characters');
            });
        })
        .catch(err => console.log(err))
        .finally(() => {
            container.classList.remove('loading');
        });
}

// Function to fetch and display characters based on resourceURI
function displayComicCharacters(characters) {
    let contentHtml = '';

    characters.forEach(character => {
        const characterName = character.name;
        let characterResourceURI = character.resourceURI;

        if (characterResourceURI.startsWith('http://')) {
            characterResourceURI = characterResourceURI.replace('http://', 'https://');
        }
        console.log(characterResourceURI);
        

        // Fetch each character's details (including the image)
        fetch(`${characterResourceURI}?ts=${TS}&apikey=${API_KEY}&hash=${API_HASH}`)
            .then(res => res.json())
            .then(info => {
                const characterDetails = info.data.results[0];
                const characterImg = `${characterDetails.thumbnail.path}.${characterDetails.thumbnail.extension}`;

                contentHtml += `
                <div class="card col-md-4 mt-3 mb-3 bg-dark text-bg-dark character-card">
                    <div class="character-img">
                        <img src="${characterImg}" class="card-img img-fluid" alt="${characterName}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${characterName}</h5>
                    </div>
                </div>
                `;

                 // Insert characters into the container
                document.getElementById('characters-container').innerHTML = contentHtml;

            })
            .catch(err => console.log(err));
    });
}

// Event listener for search form submission
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    currentPage = 1;  // Reset to page 1 for new searches

    // Update search variables based on user input
    searchValue = document.getElementById('search-input').value.trim();
    searchType = document.getElementById('search-type').value;
    sortValue = document.getElementById('search-sort').value;

    // Execute the search with updated values
    getData(searchValue, sortValue, searchType);
});

// Pagination logic
const add = document.querySelector('#add');
const subs = document.querySelector('#subs');
const firstPage = document.querySelector('#first-page');
const lastPage = document.querySelector('#last-page');

// Event listeners for pagination buttons
add.addEventListener('click', () => changePage(1));
subs.addEventListener('click', () => changePage(-1));
firstPage.addEventListener('click', () => goToPage(1));
lastPage.addEventListener('click', () => goToPage(totalPages));

// Function to change page (next or previous)
function changePage(step) {
    const nextPage = currentPage + step;
    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        getData(searchValue, sortValue, searchType);
    }
}

// Function to go directly to a specific page
function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        getData(searchValue, sortValue, searchType);
    }
}

// Function to update the pagination buttons
function updatePaginationButtons() {
    // Disable/enable buttons based on the current page
    toggleButtonState(subs, currentPage === 1);
    toggleButtonState(firstPage, currentPage === 1);
    toggleButtonState(add, currentPage === totalPages);
    toggleButtonState(lastPage, currentPage === totalPages);

    // Update the page number display
    document.getElementById('pages').textContent = currentPage;
}

// Helper function to toggle button state
function toggleButtonState(button, shouldDisable) {
    button.disabled = shouldDisable;
}

// Initial call to load comics on page load
window.onload = function () {
    currentPage = 1;
    searchType = 'comics';
    searchValue = '';
    sortValue = '';
    getData(searchValue, sortValue, searchType);
};
