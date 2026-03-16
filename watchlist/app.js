// --- SECRETS ---
const SECRET_API_KEY = "INJECT_API_KEY_HERE"; 
const GOOGLE_APP_SCRIPT_URL = "INJECT_GAS_URL_HERE";

// --- STATE ---
let movies = [];
let editingId = null;

// --- DOM ELEMENTS ---
const darkModeToggle = document.getElementById('darkModeToggle');
const formTitle = document.getElementById('formTitle');
const submitMovieBtn = document.getElementById('submitMovieBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const movieTitleInput = document.getElementById('movieTitle');
const movieRatingInput = document.getElementById('movieRating');
const movieCommentInput = document.getElementById('movieComment');
const apiKeyInput = document.getElementById('apiKeyInput');
const movieList = document.getElementById('movieList');
const loadingText = document.getElementById('loadingText');
const searchInput = document.getElementById('searchInput');

// --- INITIAL LOAD ---
async function fetchMovies() {
  if (GOOGLE_APP_SCRIPT_URL === "INJECT_GAS_URL_HERE") {
    if (loadingText) loadingText.innerText = "waiting for github actions to inject script url...";
    return;
  }

  try {
    const response = await fetch(GOOGLE_APP_SCRIPT_URL);
    const data = await response.json();
    movies = data;
    renderMovies();
  } catch (error) {
    if (loadingText) loadingText.innerText = "failed to load movies.";
    console.error(error);
  }
}

// --- EVENT LISTENERS ---
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    renderMovies(searchTerm);
  });
}

if (submitMovieBtn) {
  submitMovieBtn.addEventListener('click', async () => {
    const title = movieTitleInput.value.trim();
    const rating = movieRatingInput.value;
    const comment = movieCommentInput.value.trim();
    const typedKey = apiKeyInput.value;

    // Security Check
    if (typedKey !== SECRET_API_KEY) return alert('unauthorized: invalid api key');
    if (!title) return alert('please enter a movie title');

    // Prepare payload
    const action = editingId ? 'edit' : 'add';
    const moviePayload = {
      id: editingId ? editingId : Date.now().toString(),
      movie: title,
      rating: rating,
      comment: comment
    };

    // Optimistic UI Update
    if (action === 'add') {
      movies.push({ ...moviePayload, date: new Date().toISOString().split('T')[0] });
    } else {
      const index = movies.findIndex(m => m.id === editingId);
      if (index > -1) {
        movies[index] = { ...movies[index], ...moviePayload };
      }
    }
    
    // Update screen instantly
    resetForm();
    renderMovies();
    switchTab('list');

    // Send to Google Sheet
    await sendToGoogle(action, moviePayload);
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', () => {
    resetForm();
    switchTab('list');
  });
}

// --- HELPER FUNCTIONS ---
function switchTab(tabName) {
  const tabList = document.getElementById('tabList');
  const tabAdd = document.getElementById('tabAdd');
  const tabBtnList = document.getElementById('tabBtnList');
  const tabBtnAdd = document.getElementById('tabBtnAdd');

  if (!tabList || !tabAdd) return;

  if (tabName === 'list') {
    tabList.classList.remove('hidden');
    tabAdd.classList.add('hidden');
    tabBtnList.classList.add('active');
    tabBtnAdd.classList.remove('active');
  } else {
    tabAdd.classList.remove('hidden');
    tabList.classList.add('hidden');
    tabBtnAdd.classList.add('active');
    tabBtnList.classList.remove('active');
  }
}

function resetForm() {
  editingId = null;
  formTitle.innerText = "add a new movie";
  submitMovieBtn.innerText = "submit movie";
  cancelEditBtn.classList.add('hidden');
  movieTitleInput.value = '';
  movieRatingInput.value = '';
  movieCommentInput.value = '';
}

function startEdit(id) {
  const movie = movies.find(m => m.id === id);
  if (!movie) return;

  editingId = movie.id;
  formTitle.innerText = "edit movie";
  submitMovieBtn.innerText = "update movie";
  cancelEditBtn.classList.remove('hidden');
  
  movieTitleInput.value = movie.movie;
  movieRatingInput.value = movie.rating;
  movieCommentInput.value = movie.comment;
  
  switchTab('add'); 
  window.scrollTo(0, 0); 
}

async function deleteMovie(id) {
  const typedKey = prompt("enter admin api key to delete:");
  if (typedKey !== SECRET_API_KEY) return alert("unauthorized");

  if (!confirm("are you sure you want to delete this?")) return;

  // Update screen instantly
  movies = movies.filter(m => m.id !== id);
  renderMovies();

  // Update Google Sheet
  await sendToGoogle('delete', { id: id });
}

async function sendToGoogle(action, movieData) {
  // Prevent sending data if testing locally without URL
  if (GOOGLE_APP_SCRIPT_URL === "INJECT_GAS_URL_HERE") return; 

  try {
    await fetch(GOOGLE_APP_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: action, movie: movieData })
    });
  } catch (error) {
    console.error('error saving to sheet:', error);
  }
}

// --- RENDER ---
function renderMovies(filterText = '') {
  if (loadingText) loadingText.classList.add('hidden');
  if (!movieList) return;

  movieList.innerHTML = ''; 
  
  const safeFilterText = filterText ? filterText.toString().toLowerCase() : '';

  // Filter movies
  const filteredMovies = movies.filter(movie => {
    const titleMatch = (movie.movie || "").toString().toLowerCase().includes(safeFilterText);
    const commentMatch = (movie.comment || "").toString().toLowerCase().includes(safeFilterText);
    return titleMatch || commentMatch;
  });

  // Handle empty states
  if (filteredMovies.length === 0) {
    if (movies.length === 0) {
      movieList.innerHTML = '<p>no movies watched yet.</p>';
    } else {
      movieList.innerHTML = '<p>no matching movies found.</p>';
    }
    return;
  }

  // Draw the movies list
  [...filteredMovies].reverse().forEach(movie => {
    const numRating = parseFloat(movie.rating) || 0;
    let ratingClass = 'rating-low';
    let borderColor = '#e57373'; 
    
    if (numRating >= 8) {
      ratingClass = 'rating-high';
      borderColor = '#81c784'; 
    } else if (numRating >= 5) {
      ratingClass = 'rating-medium';
      borderColor = '#ffd54f'; 
    }

    const li = document.createElement('li');
    li.style.borderLeft = `5px solid ${borderColor}`;

    li.innerHTML = `
      <div class="movie-header">
        <strong>${movie.movie || 'untitled'}</strong>
        <span class="rating-badge ${ratingClass}">${numRating} / 10</span>
      </div>
      <div class="movie-comment">"${movie.comment || ''}"</div>
      <div class="movie-date">watched: ${movie.date ? new Date(movie.date).toLocaleDateString() : 'unknown'}</div>
      
      <div class="action-btns" style="margin-top: 10px;">
        <button onclick="startEdit('${movie.id}')">edit</button>
        <button onclick="deleteMovie('${movie.id}')">delete</button>
      </div>
    `;
    movieList.appendChild(li);
  });
}

// Start application
fetchMovies();