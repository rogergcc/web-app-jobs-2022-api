'use strict'
class Movie {
  constructor (id, title, poster_path, backdrop_path, release_date, genre_ids, overview, vote_average) {
    this.id = id
    this.title = title
    this.poster_path = this.getFullImagePoster(poster_path)

    this.backdrop_path = this.getFullImagePoster(backdrop_path)
    this.release_date = release_date
    this.genres = this.getGenNames(genre_ids)
    this.overview = overview
    this.release_year = this.getYearFromDate(release_date)
    this.vote_average = vote_average
  }

  getFullImagePoster (image_path) {
    return `//image.tmdb.org/t/p/original${image_path}`
  }

  getNameGensFormId (idGenero) {
    const generosJsonString =
      '{ "genres": [ { "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" }, { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" }, { "id": 14, "name": "Fantasy" }, { "id": 36, "name": "History" }, { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" }, { "id": 9648, "name": "Mystery" }, { "id": 10749, "name": "Romance" }, { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "TV Movie" }, { "id": 53, "name": "Thriller" }, { "id": 10752, "name": "War" }, { "id": 37, "name": "Western" } ] }'

    let generoName = ''
    const obj = JSON.parse(generosJsonString)
    for (let i = 0; i < obj.genres.length; i++) {
      if (idGenero == obj.genres[i].id) {
        generoName = obj.genres[i].name
        break
      }
    }
    return generoName
  }

  getGenNames (gensArray) {
    let gensName = ''
    for (let i = 0; i < gensArray.length; i++) {
      gensName += ', ' + this.getNameGensFormId(gensArray[i])
    }
    gensName = gensName.substr(1)
    return gensName
  }

  // yy-mm-dd
  getYearFromDate (date) {
    const year = date.split('-').shift()
    return year
  }
}

module.exports = Movie
