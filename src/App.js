import React, { useState } from 'react';
import axios from 'axios';
// trying to save this to github 
function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(10)
  const [selectedColors, setSelectedColors] = useState([]);

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleColorChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedColors([...selectedColors, value]);
    } else {
      setSelectedColors(selectedColors.filter((color) => color !== value));
    }
  };

  const handleSearch = async () => {
    try {
      const encodedQuery = encodeURIComponent(query); // Encode the query parameter
      const requestUrl = `http://localhost:5000/search?q=${encodedQuery}`;
      console.log('Request URL:', requestUrl); // Log the request URL
      const response = await axios.get(requestUrl);
      setCurrentPage(1);
      console.log('Received response:', response.data); // Log the response data
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching cards:', error);
      setSearchResults([]);
    }
  };
  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = searchResults.slice(indexOfFirstCard, indexOfLastCard)

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  
  return (
    <div className="container mt-5">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for cards..."
          value={query}
          onChange={handleChange}
        />
        <div>
  <label>
    <input
      type="checkbox"
      value="W"
      onChange={handleColorChange}
    />
    White
  </label>
  {/* Repeat similar lines for other colors */}
</div>
        <button className="btn btn-primary mt-2" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="card-rows d-flex flex-row flex-wrap">
  {searchResults && currentCards.map((card) => (
    <div className="card mb-3" style={{ maxWidth: '275px', marginRight: '2px' }} key={card.id}>
      {card.image_uris && card.image_uris.png && (
        <img src={card.image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
      )}
      <div className="card-body">
        <h5 className="card-title">{card.name}</h5>
        <p>Mana Cost: {card.mana_cost}</p>
        <p>Type: {card.type_line}</p>
        <p>Oracle Text: {card.oracle_text}</p>
        <div className="d-flex justify-content-around">
          <button className="btn btn-success">Add to Deck</button>
          <button className="btn btn-info">Add to Wishlist</button>
          <button className="btn btn-warning">Add to Trades</button>
        </div>
        {card.card_faces && card.card_faces.map((face, index) => (
          <div className="card-back" key={`${card.id}-face-${index}`}>
            {face.image_uris && face.image_uris.png && (
              <img src={face.image_uris.png} className="card-img-top" alt={card.name} />
            )}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
      {searchResults.length > cardsPerPage && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(Math.ceil(searchResults.length / cardsPerPage)).keys()].map((pageNumber) => (
              <li key={pageNumber} className="page-item">
                <button onClick={() => paginate(pageNumber + 1)} className="page-link">
                  {pageNumber + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default App;
