const container = document.getElementById('container')
let contentHtml = ''

let counter = 1
let offset = 20
let total = 160
let limit = 16

//Fetching
function getComics() {
    offset = (parseInt(limit) * parseInt(counter)) - parseInt(limit);
    console.log(offset);
    fetch(`https://gateway.marvel.com:443/v1/public/comics?limit=${limit}&offset=${offset}&ts=1&apikey=d0bac062c296448e513e8a3147810f19&hash=5e6eef74abfa220a102df0024190f6e7`)
        .then(res => res.json())
        .then(info => setComics(info.data.results))
        .catch(err => console.log(err))
}

getComics();

function setComics(comics) {
    contentHtml = '';
    console.log(comics);

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

//Paging
const add = document.querySelector('#add');
const subs = document.querySelector('#subs');
const firstPage = document.querySelector('#first-page');
const lastPage = document.querySelector('#last-page');
const pages = document.querySelector('#pages');


add.addEventListener('click', () => {
    pages.textContent = counter < 10 ? ++counter : pages.textContent
    getComics()
});
subs.addEventListener('click', () => {
    pages.textContent = counter > 1 ? --counter : pages.textContent
    getComics()
});
firstPage.addEventListener('click', () => {
    counter = 1
    pages.textContent = counter
    getComics()
});
lastPage.addEventListener('click', () => {
    counter = 10
    pages.textContent = counter
    getComics()
});


//Search Params
//const params = apiUrl.searchParams

