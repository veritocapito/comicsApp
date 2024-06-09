const container = document.getElementById('container')
let contentHtml = ''

let counter = 1
let offset = 0


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
            <img src="${comicImg}" class="card-img-top img-fluid" alt="${comicTitle}">
            <div class="card-body">
                <h5 class="card-title">${comicTitle}</h5>
                <a href="${comicUrl}" target="_blank" class="btn btn-danger">More info</a>
            </div>
        </div>`;

        /*         console.log(comicTitle);
                console.log(comicImg);
                console.log(comicUrl);
                console.log(contentHtml); */
    }
    container.innerHTML = contentHtml;
}

//Paginado
const add = document.querySelector('#add');
const subs = document.querySelector('#subs');
const pages = document.querySelector('#pages');


add.addEventListener('click', () => {
    pages.textContent = ++counter
    getComics()
});
subs.addEventListener('click', () => {
    pages.textContent = counter > 1 ? --counter : pages.textContent
    getComics()
});


//Parametros de busqueda
const params = apiUrl.searchParams

