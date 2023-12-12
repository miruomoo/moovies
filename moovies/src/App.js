import { useEffect, useState } from "react";
import StarRating from "./starRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({children}) {
  return (<nav className="nav-bar">
    <Logo></Logo>
    {children}
  </nav>)
}

function Logo() {
  return (<div className="logo">
    <span role="img">🐮</span>
    <h1>moovies</h1>
  </div>)
}

function NumResults({movies}) {
  return (<p className = "num-results" >
    Found < strong >{movies.length}</strong > results
</p >)
}

function Search({query, setQuery}) {
  return (<input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />)
}

function Movie({movie, onSelectMovie}){
  return (<li onClick={() => onSelectMovie(movie.imdbID)}
  key={movie.imdbID}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>)
}

function MoviesList({movies, onSelectMovie}){

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID}
        onSelectMovie={onSelectMovie}></Movie>
      ))}
    </ul>
  )
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);

  return (      
  <div className="box">
  <button
    className="btn-toggle"
    onClick={() => setIsOpen((open) => !open)}
  >
    {isOpen ? "–" : "+"}
  </button>
  {isOpen && children}
</div>)
}

function WatchedMovie({movie, onDelete}){
  return (    <li key={movie.imdbID}>
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>🌟</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>
      <button class="btn-delete" onClick={() => onDelete(movie.imdbID)}>X</button>
    </div>
  </li>)
}

function WatchedMoviesList({watched, onDelete}){
  return (
  <ul className="list">
  {watched.map((movie) => (
    <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete}></WatchedMovie>
  ))}
</ul>)
}

function WatchedSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (<div className="summary">
  <h2>Movies you watched</h2>
  <div>
    <p>
      <span>#️⃣</span>
      <span>{watched.length} movies</span>
    </p>
    <p>
      <span>🌟</span>
      <span>{avgImdbRating.toFixed(2)}</span>
    </p>
    <p>
      <span>⭐️</span>
      <span>{avgUserRating.toFixed(2)}</span>
    </p>
    <p>
      <span>⏳</span>
      <span>{avgRuntime} min</span>
    </p>
  </div>
</div>)
}

function Main({children}) {

  return (
    <main className="main">
      {children}
    </main>
  )
}

function Loader(){
  return <p className="loader">Loading...</p>
}

function ErrorMessage({message}){
  return <p className="error">
    <span>😒 </span>{message}
  </p>
}

const KEY = '737aa262'

function MovieDetails({selectedId, onCloseMovie, onAddWatched, addedMovie}){
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState("")

  const {Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released,
  Actors: actors, Director: director, Genre: genre} = movie;

  useEffect(function(){
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  function handleAdd(){
    const newWatcedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    }
    onAddWatched(newWatcedMovie);
    onCloseMovie();
  }

  return (<div className="details">
{ isLoading?<Loader></Loader>:<><header>
    <button className="btn-back" onClick={onCloseMovie}>
      &larr;
    </button>
    <img src={poster} alt={`Poster of ${movie}`}></img>
    <div className="details-overview">
      <h2>{title}</h2>
      <p>{released} &bull; {runtime}</p>
      <p>{genre}</p>
      <p><span>🌟</span>{imdbRating} IMDb Rating</p>
    </div>
    </header>
    <section>
      <div className="rating">
      {!addedMovie && <StarRating maxRating={10} size={25} onSetRating={setUserRating} defaultRating={addedMovie?addedMovie.userRating:0}></StarRating>}
      {addedMovie && <p>You rated this movie {addedMovie.userRating}/10 <span>⭐</span></p>}
      {userRating>0 && (<button className="btn-add" onClick={handleAdd}>+ Add to List</button>)}
      </div>
      <p><em>{plot}</em></p>
      <p>Starring: {actors}</p>
      <p>Directed by: {director}</p>
    </section></>}
  </div>)
}

export default function App() {
  const [query, setQuery] = useState("jujutsu kaisen");
  const [watched, setWatched] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isWatched, setIsWatched] = useState(null);

  function handleSelectMovie(id){
    let addedMovie = null;
    if (id===selectedId){
      setSelectedId(null);
    }else{
      setSelectedId(id);
    }
    addedMovie = watched.find( movie => movie['imdbID'] === id)
    if (addedMovie){
      setIsWatched(addedMovie)
    }else{
      setIsWatched(null)
    }
  }

  function handleDeleteWatched(id){
    setWatched(watched => watched.filter((movie) => 
      movie.imdbID !== id
    ))
  }

  function handleCloseMovie(){
    setSelectedId(null);
  }

  function handleAddWatched(movie){
    setWatched((watched)=> [...watched, movie])
  }
  
  useEffect(function(){
    async function fetchMovies() {
    try{
    setIsLoading(true);
    setError("");
    const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`);

    if (!res.ok) throw new Error("Something went wrong");

    const data = await res.json()
    if (data.Response === 'False') throw new Error(`No movies found with name ${query}`)
    setMovies(data.Search);
    console.log(data.Search);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }
  if (query.length<3){
    setMovies([])
    setError("");
    return;
  }
  fetchMovies();
}, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}></Search>
        <NumResults movies={movies}></NumResults>
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader></Loader>}
          {!isLoading && !error && <MoviesList movies={movies}
          onSelectMovie={handleSelectMovie}></MoviesList>}
          {error && <ErrorMessage message={error}></ErrorMessage>}
        </Box>
        <Box>
          {selectedId? <MovieDetails
           selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} addedMovie={isWatched}/>:
          <>
          <WatchedSummary watched={watched}></WatchedSummary>
          <WatchedMoviesList watched={watched} onDelete={handleDeleteWatched}></WatchedMoviesList>
          </>
          }
        </Box>
      </Main>
    </>
  );
}
