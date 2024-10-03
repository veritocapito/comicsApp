const container = document.getElementById('container')
let contentHtml = ''
const results = document.getElementById('results')
let resultsHtml = ''

let query = 'comics'


const url = new URL(`https://gateway.marvel.com:443/v1/public/${query}`)
url.searchParams.set('ts', TS)
url.searchParams.set('apikey', API_KEY)
url.searchParams.set('hash', API_HASH)

//Fetching
function getData() {

    fetch(`${url}`)
        .then(res => res.json())
        .then(info => query === 'comics' ? setComics(info.data.results) : setCharacters(info.data.results))
        .catch(err => console.log(err))
}

getData();

function setComics(comics) {
    contentHtml = '';
    console.log(comics);

    const comicsCount = comics.length;
    console.log(comicsCount);
    

    resultsHtml += `
        <h5 class="results-title">RESULTS</h5>
        <p class="results-counter">${comicsCount} RESULTS</p>
    `
    results.innerHTML = resultsHtml;

    for (let i = 0; i < comics.length; i++) {
        const comicTitle = comics[i].title;
        const comicAuthors = comics[i].creators.items

        let authorName = 'Marvel'
        for (let j = 0; j < comicAuthors.length; j++) {
            if (comicAuthors.length > 0) {
                authorName = comicAuthors[j].name || 'Marvel';
            }
        }

        const comicImg = `${comics[i].thumbnail.path}.${comics[i].thumbnail.extension}`;

        const comicUrls = comics[i].urls;
        let comicUrl = {}
        for (let j = 0; j < comicUrls.length; j++) {
            comicUrl = comicUrls[j].url
        }

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

function setCharacters(characters) {
    console.log(characters);
    contentHtml = '';
    for (let i = 0; i < characters.length; i++) {
        const characterId = characters[i].id;
        const characterImg = `${characters[i].thumbnail.path}.${characters[i].thumbnail.extension}`;
        const characterName = characters[i].name;
        const characterInfo = characters[i].description
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

    document.querySelectorAll('.comic-card').forEach(card => {
        card.addEventListener('click', function() {
            const characterId = this.getAttribute('data-id');
            const characterName = this.getAttribute('data-name');
            const characterImg = this.getAttribute('data-img');
            const characterInfo = this.getAttribute('data-info')
            setCharacterComics(characterId, characterName, characterImg, characterInfo);
        });
    });
}


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



//Paging
const add = document.querySelector('#add');
const subs = document.querySelector('#subs');
const firstPage = document.querySelector('#first-page');
const lastPage = document.querySelector('#last-page');
const pages = document.querySelector('#pages');


add.addEventListener('click', () => {
    pages.textContent = counter < 10 ? ++counter : pages.textContent
    getData()
});
subs.addEventListener('click', () => {
    pages.textContent = counter > 1 ? --counter : pages.textContent
    getData()
});
firstPage.addEventListener('click', () => {
    counter = 1
    pages.textContent = counter
    getData()
});
lastPage.addEventListener('click', () => {
    counter = 10
    pages.textContent = counter
    getData()
});



