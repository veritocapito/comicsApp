const container = document.getElementById('container')
let contentHtml = ''

let counter = 1
let offset = 0
let total = 80

//Fetching
function getComics() {
    offset = (parseInt(20) * parseInt(counter)) - parseInt(20);
    console.log(offset);
    fetch(`https://gateway.marvel.com:443/v1/public/comics?limit=20&offset=${offset}&ts=1&apikey=d0bac062c296448e513e8a3147810f19&hash=5e6eef74abfa220a102df0024190f6e7`)
        .then(res => res.json())
        .then(data => setComics(data.data.results))
        .catch(err => console.log(err))
}

getComics();

function setComics(comics) {
    console.log(comics);

    for (let i = 0; i < comics.length; i++) {
        const comicTitle = comics[i].title;
        const comicImg = `${comics[i].thumbnail.path}.${comics[i].thumbnail.extension}`;
        const comicUrls = comics[i].urls;
        let comicUrl = {}

        for (let j = 0; j < comicUrls.length; j++) {
            comicUrl = comicUrls[j].url;
        }

        contentHtml += `
        <div class="card col-md-4 gap-2 justify-items-between" style="width: 18rem;">
            <img src="${comicImg}" class="card-img-top h-100" alt="${comicTitle}">
            <div class="card-body gap-2 mt-2 h-20">
                <h5 class="card-title mt-2">${comicTitle}</h5>
                <a href="${comicUrl}" target="_blank" class="btn btn-danger">More info</a>
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
    pages.textContent = counter < 6 ? ++counter : pages.textContent
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
    counter = 6
    pages.textContent = counter
    getComics()
});


//Search Params
//const params = apiUrl.searchParams

