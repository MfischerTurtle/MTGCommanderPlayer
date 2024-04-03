import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;
  const [selectedColors, setSelectedColors] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());

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
      const encodedQuery = encodeURIComponent(query);
      const requestUrl = `http://localhost:5000/search?q=${encodedQuery}`;
      console.log('Request URL:', requestUrl);
      const response = await axios.get(requestUrl);
      setCurrentPage(1);
      console.log('Received response:', response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching cards:', error);
      setSearchResults([]);
    }
  };

  const filterDuplicates = (cards) => {
    const seenArenaIds = new Set();
    return cards.filter((card) => {
      // If arena_id is undefined or null, use card name as a unique identifier
      const uniqueIdentifier = card.arena_id ? card.arena_id : card.name;
      if (!seenArenaIds.has(uniqueIdentifier)) {
        seenArenaIds.add(uniqueIdentifier);
        return true;
      }
      return false;
    });
  };

  const flipCard = (cardId, faceIndex) => {
    const newFlippedCards = new Set(flippedCards);
    const uniqueCardId = `${cardId}-${faceIndex}`; // Combine card ID and face index
    if (newFlippedCards.has(uniqueCardId)) {
      newFlippedCards.delete(uniqueCardId);
    } else {
      // Check if the opposite face is already flipped, if yes, flip it back
      const oppositeFaceIndex = faceIndex === 0 ? 1 : 0;
      const oppositeCardId = `${cardId}-${oppositeFaceIndex}`;
      if (newFlippedCards.has(oppositeCardId)) {
        newFlippedCards.delete(oppositeCardId);
      }
      newFlippedCards.add(uniqueCardId);
    }
    setFlippedCards(newFlippedCards);
  };

  const paginate = (pageNumber) => {
    console.log("Pagination requested for page:", pageNumber);
    setCurrentPage(pageNumber);
  };

  // Filter duplicates first, then paginate
  const filteredSearchResults = filterDuplicates(searchResults);
  console.log("Filtered search results length:", filteredSearchResults.length);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredSearchResults.slice(indexOfFirstCard, indexOfLastCard);
  console.log("Current page cards length:", currentCards.length);

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
  {currentCards.map((card) => (
    <div className="card mb-3" style={{ maxWidth: '275px', marginRight: '2px', marginBottom: '20px' }} key={card.id}>
      <div className="d-flex flex-column align-items-center">
        {card.card_faces && card.card_faces.length === 2 ? (
          <div className={`card-inner ${flippedCards.has(`${card.id}-0`) ? 'flipped' : ''}`}>
            <div className="card-front mb-2" onClick={() => flipCard(card.id, 0)}>
              <img src={card.card_faces[0].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              <div className="flip-indicator">{flippedCards.has(`${card.id}-0`) ? 'Click to Flip Back' : 'Click to Flip'}</div>
              <div className="card-body text-center">
                <h5 className="card-title">{card.card_faces[0].name}</h5>
                <p>Mana Cost: {card.card_faces[0].mana_cost}</p>
                <p>Type: {card.card_faces[0].type_line}</p>
                <p>Oracle Text: {card.card_faces[0].oracle_text}</p>
              </div>
            </div>
            <div className="card-back mb-2" onClick={() => flipCard(card.id, 1)}>
              <img src={card.card_faces[1].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              <div className="card-body text-center">
                <h5 className="card-title">{card.card_faces[1].name}</h5>
                <p>Mana Cost: {card.card_faces[1].mana_cost}</p>
                <p>Type: {card.card_faces[1].type_line}</p>
                <p>Oracle Text: {card.card_faces[1].oracle_text}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-front mb-2" onClick={() => flipCard(card.id, 0)}>
            <img src={card.image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
            <div className="card-body text-center">
              <h5 className="card-title">{card.name}</h5>
              <p>Mana Cost: {card.mana_cost}</p>
              <p>Type: {card.type_line}</p>
              <p>Oracle Text: {card.oracle_text}</p>
            </div>
          </div>
        )}
        <div className="d-flex justify-content-around">
          <button className="btn btn-success">Add to Deck</button>
          <button className="btn btn-info">Add to Wishlist</button>
          <button className="btn btn-warning">Add to Trades</button>
        </div>
      </div>
    </div>
  ))}
</div>

      {filteredSearchResults.length > cardsPerPage && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(Math.ceil(filteredSearchResults.length / cardsPerPage)).keys()].map((pageNumber) => (
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
