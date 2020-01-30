const searchForm = document.querySelector('#search-form');
const movie = document.querySelector("#movies");
const urlPoster = 'https://image.tmdb.org/t/p/w500';

function apiSearch(event) {
    event.preventDefault();
    const searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Searchfield should not be blank</h2>';
        return;
    }
    movie.innerHTML = ' <div class="spinner"></div>';

    fetch('https://api.themoviedb.org/3/search/multi?api_key=9dd57bdcf58f9d7ad02cd4e2a9d0fc22&language=en-US&query=' + searchText)
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function (output) {
            let inner = '';
            if (output.results.length === 0) {
                inner = '<h2 class="col-12 text-center text-info">Nothing found</h2>';
            }

            output.results.forEach(function (item) {
                let nameItem = item.name || item.title;
                let posterImage = item.poster_path ? urlPoster + item.poster_path : './Out_Of_Poster.jpg';
                let dataInfo = '';
                if (item.media_type !== 'person') dataInfo = `data-id='${item.id}' data-type='${item.media_type}'`;

                inner += `<div class='col-12 col-md-6 col-xl-3 item'>
      <img src='${posterImage}' class= 'img_poster' alt="${nameItem}" ${dataInfo}></img>
      <h5>${nameItem}</h5>
      </div>`;
            });
            movie.innerHTML = inner;

            addEventMedia();

        })
        .catch(function (reason) {
            movie.innerHTML = "Something goes wrong...";
            console.error("error: " + reason.status);
        });


}


searchForm.addEventListener('submit', apiSearch);

function addEventMedia() {
    const media = movie.querySelectorAll('img[data-id]');
    media.forEach(function (elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });

}

function showFullInfo() {
    let url = '';
    if (this.dataset.type === 'movie') {
        url = 'https://api.themoviedb.org/3/movie/' + this.dataset.id + '?api_key=9dd57bdcf58f9d7ad02cd4e2a9d0fc22&language=en-US';
    } else if (this.dataset.type === 'tv') {
        url = 'https://api.themoviedb.org/3/tv/' + this.dataset.id + '?api_key=9dd57bdcf58f9d7ad02cd4e2a9d0fc22&language=en-US';
    } else {
        movie.innerHTML = '<h2 class="col-12 text-center text-info">Error. Please try later</h2>';
    }

    fetch(url)
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(new Error(value.status));
            }
            return value.json();
        })
        .then((output) => {

            movie.innerHTML = `
        <h4 class="col-12 text-center text-success">${output.name || output.title}</h4>
        <div class="col-4">
        <img src='${urlPoster + output.poster_path}' alt="${output.name || output.title}">
        ${(output.homepage) ? `<p class= "text-center"><a href="${output.homepage}" target:"_blank"> Official page </a></p>` : ""}
        ${(output.imdb_id) ? `<p class= "text-center"><a href="https://imdb.com/title/${output.imdb_id}" target:"_blank" > IMDB.com </a></p>` : ""}

        </div>
        <div class= "col-8">
        <p> Rating:  ${output.vote_average}</p>
        <p> Status:  ${output.status}</p>
        <p> World premier:  ${output.first_air_date || output.release_date}</p>

        ${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} season<br> ${output.last_episode_to_air.episode_number} episodes released </p>` : ''}
       
        <p> Overview: ${output.overview}</p>
       
        

        <br>

        <div class="youtube"></div>

        </div>`
                ;

            getVideo(this.dataset.type, this.dataset.id);
        })



        .catch(function (reason) {
            movie.innerHTML = "Something goes wrong...";
            console.error(reason || reason.status);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.themoviedb.org/3/trending/all/week?api_key=9dd57bdcf58f9d7ad02cd4e2a9d0fc22'
    )
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function (output) {
            console.log("output: ", output);
            let inner = '<h4 class="col-12 text-center text-success">Most popolar</h4>';
            if (output.results.length === 0) {
                inner = '<h2 class="col-12 text-center text-info">Nothing found</h2>'
            }

            output.results.forEach(function (item) {
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';
                let posterImage = item.poster_path ? urlPoster + item.poster_path : './Out_Of_Poster.jpg';
                let dataInfo = `data-id='${item.id}' data-type='${mediaType}'`;

                inner += `<div class='col-12 col-md-6 col-xl-3 item'>
      <img src='${posterImage}' class= 'img_poster' alt="${nameItem}" ${dataInfo}></img>
      <h5>${nameItem}</h5>
      </div>`;
            });
            movie.innerHTML = inner;

            addEventMedia();

        })
        .catch(function (reason) {
            movie.innerHTML = "Something goes wrong...";
            console.error("error: " + reason.status);
        });
});



function getVideo(type, id) {
    let youtube = movie.querySelector(".youtube");

    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=9dd57bdcf58f9d7ad02cd4e2a9d0fc22&language=en-US`)
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(new Error(value.status));
            }
            return value.json();
        })

        .then((output) => {
            console.log(output);
            let videoFrame = '<h5 class="text-success">Recent videos:</h5>'

            if (output.results.length === 0) {
                videoFrame = '<p>No videos available</p>'
            }



            output.results.forEach((item) => {
                videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + item.key + ' " frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
            });
            youtube.innerHTML = videoFrame;

        })
        .catch((reason) => {
            youtube.innerHTML = "Something goes wrong again";
            console.error(reason || reason.status);

        });
}


