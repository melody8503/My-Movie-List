// 顯示全部電影清單
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 顯示頁數
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 依page顯示哪12筆電影資料
function getMoviesByPage(page) {
  // 計算起始index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 顯示點擊的對應modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
        <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
      `
    })
}

// 加入收藏
function addToFavorite(id) {
  // 取出localStorage的值，JSON.parse會將取出的字串轉成物件或陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 取出每部電影的id中有符合點擊的id的資料
  const movie = movies.find((movie) => movie.id === id)

  // 判斷是否重複加入收藏
  if (list.some((movie) => movie.id === id)) {
    alert('此電影已加入收藏清單')
    return 
  }

  // 傳入電影資料
  list.push(movie)
  // 存進JSON字串資料
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 一頁12筆電影資料
const MOVIES_PER_PAGE = 12
// 將取得的資料放入空陣列
const movies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


// 監聽 data-panel，當符合點擊到的.btn-show-movie，會呼叫函式執行
dataPanel.addEventListener('click', event => {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽 paginator，點擊頁數會顯示該頁電影資料
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 更新畫面
  renderMovieList(getMoviesByPage(page))
})

// 監聽 search-form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  // 存放篩選後符合條件的電影資料
  let filteredMovies = []

  //條件篩選
  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword)
  })

  // 當符合條件筆數為0 或 未輸入、連續輸入空白，會跳alert
  if (filteredMovies.length === 0 || keyword.length === 0) {
    searchInput.value = ''
    renderMovieList(movies)
    alert(`您輸入的關鍵字："${keyword}" 沒有符合條件的電影，請輸入其他關鍵字`)
  }
  else {
    // 渲染分頁，依篩選資料的長度顯示頁數
    renderPaginator(filteredMovies.length)
    // 預設顯示第1頁搜尋資料
    renderMovieList(filteredMovies)
  }
})


// 取得資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((error) => {
    console.warn(error);
  });