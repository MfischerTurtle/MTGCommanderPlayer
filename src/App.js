import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;
  const [selectedColors, setSelectedColors] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [cmcValue, setCmcValue] = useState('');

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
    // Clear CMC value when color is changed
    setCmcValue('');
  };

  const handleCmcChange = (event) => {
    setCmcValue(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const encodedQuery = encodeURIComponent(query);
      let colorQuery = '';
  
      if (selectedColors.length > 0) {
        const includedColorsQuery = selectedColors.map(color => `c:${color}`).join('+');
        const excludedColorsQuery = ['W', 'U', 'B', 'R', 'G'].filter(color => !selectedColors.includes(color)).map(color => `-c:${color}`).join('+');
        colorQuery = `${includedColorsQuery}+${excludedColorsQuery}`;
      }
  
      let cmcQuery = '';
      if (cmcValue !== '') {
        cmcQuery = `cmc=${cmcValue}`;
      }
  
      // Construct the request URL based on provided parameters
      let requestUrl = `https://api.scryfall.com/cards/search?q=${encodedQuery}`;
      if (colorQuery !== '' || cmcQuery !== '') {
        requestUrl += `+${colorQuery}`;
      }
      if (cmcQuery !== '') {
        requestUrl += `&${cmcQuery}`;
      }
      console.log('Filtered search results:', filteredSearchResults); // Log filtered search results

      console.log('CMC value:', cmcValue); // Log CMC value
      console.log('Request URL:', requestUrl); // Log request URL
      console.log('Request URL:', requestUrl);
      
      const response = await axios.get(requestUrl);
      setCurrentPage(1);
      console.log('Received response:', response.data);
      setSearchResults(response.data);
      console.log('Search results:', response.data.data);
    } catch (error) {
      console.error('Error searching cards:', error);
      setSearchResults([]);
    }
  };
  const filterByCmc = (cards, targetCmc) => {
    // Check if cards is defined and is an array
    if (!Array.isArray(cards)) {
        console.error('Error: Input is not an array');
        return [];
    }

    return cards.filter((card) => {
        // Check if the card's cmc matches the target cmc
        return card.cmc === targetCmc;
    });
};
 
  const filterDuplicates = (cards) => {
    // Check if cards is not an array or is empty
    if (!Array.isArray(cards) || cards.length === 0) {
        console.error('Error: Input is not a non-empty array');
        return [];
    }

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

const flipCard = (cardId) => {
  console.log('Flipping card:', cardId);
  const cardIdParts = cardId.split("-");
  const cardIdPart = cardIdParts.slice(0, -1).join("-");
  const faceIndex = cardIdParts.slice(-1)[0];
  console.log('Card ID Part:', cardIdPart, 'Face Index:', faceIndex);
  
  const card = filteredSearchResults.find((c) => c.id === cardIdPart); // Find the card object from search results
  console.log('Card:', card);

  // Check if the card has two faces
  if (card && card.card_faces && card.card_faces.length === 2) {
    const newFlippedCards = new Set(flippedCards);
    const isFlipped = newFlippedCards.has(cardId);
    if (isFlipped) {
      newFlippedCards.delete(cardId);
    } else {
      // Check if the opposite face is already flipped, if yes, flip it back
      const oppositeFaceIndex = faceIndex === '0' ? '1' : '0';
      const oppositeCardId = `${cardIdPart}-${oppositeFaceIndex}`;
      if (newFlippedCards.has(oppositeCardId)) {
        newFlippedCards.delete(oppositeCardId);
      }
      newFlippedCards.add(cardId);
    }
    console.log('Before flipping:', flippedCards);
    setFlippedCards(newFlippedCards);
    console.log('After flipping:', flippedCards);
  }
};


  const paginate = (pageNumber) => {
    console.log("Pagination requested for page:", pageNumber);
    setCurrentPage(pageNumber);
  };
  const filteredByCmc = filterByCmc(searchResults.data, parseInt(cmcValue));
  console.log('Filtered by CMC:', filteredByCmc);

  // Filter search results for duplicates
  const filteredSearchResults = filterDuplicates(filteredByCmc.length > 0 ? filteredByCmc : searchResults.data);
  console.log('Filtered search results:', filteredSearchResults);
  // Filter duplicates first, then paginate
  

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
          <label>
            <input
              type="checkbox"
              value="U"
              onChange={handleColorChange}
            />
            Blue
          </label>
          <label>
            <input
              type="checkbox"
              value="R"
              onChange={handleColorChange}
            />
            Red
          </label>
          <label>
            <input
              type="checkbox"
              value="B"
              onChange={handleColorChange}
            />
            Black
          </label>
          <label>
            <input
              type="checkbox"
              value="G"
              onChange={handleColorChange}
            />
            Green
          </label>
          <label>
            <input
              type="checkbox"
              value="C"
              onChange={handleColorChange}
            />
            Colorless
          </label>
        </div>
        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Enter CMC"
            value={cmcValue}
            onChange={handleCmcChange}
          />
        </div>
        <button className="btn btn-primary mt-2" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="card-rows d-flex flex-row flex-wrap">
  {currentCards.map((card) => (
    <div className="card mb-3" style={{ maxWidth: '275px', marginRight: '2px', marginBottom: '20px' }} key={card.id}>
      <div className="d-flex flex-column align-items-center">
      {card.layout === "adventure" &&  (
  <div className={`card-inner `}>
    <div className="card-front mb-2">
      {card.image_uris && card.image_uris.png && (
        <img src={card.image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
      )}
      <div className="card-body text-center">
        <h5 className="card-title">{card.card_faces[0].name}</h5>
        <p>Mana Cost: {card.card_faces[0].mana_cost}</p>
        <p>Oracle Text (Side 1): {card.card_faces[0].oracle_text}</p>
        <h5 className="card-title">{card.card_faces[1].name}</h5>
        <p>Oracle Text (Side 2): {card.card_faces[1].oracle_text}</p>
      </div>
    </div>
    <div className="card-back mb-2">
      {card.card_faces[1] && card.card_faces[1].image_uris && (
        <img src={card.card_faces[1].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
      )}
      <div className="card-body text-center">
        <h5 className="card-title">{card.card_faces[1].name}</h5>
        <p>Mana Cost: {card.card_faces[1].mana_cost}</p>
        <p>Oracle Text: {card.card_faces[1].oracle_text}</p>
      </div>
    </div>
  </div>
)}
{(card.layout === "split") && (
          <div className={`card-inner`}>
            <div className="card-front mb-2">
              {card.image_uris && card.image_uris.png && (
                <img src={card.image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              <div className="card-body text-center">
                <h5 className="card-title">{card.name}</h5>
                <p>Mana Cost: {card.mana_cost}</p>
                <h5 className="card-title">{card.card_faces[0].name}</h5>
                <p>Oracle Text (Side 1): {card.card_faces[0].oracle_text}</p>
               <h5 className="card-title">{card.card_faces[1].name}</h5>
                <p>Oracle Text (Side 2): {card.card_faces[1].oracle_text}</p>
              </div>
            </div>
          </div>
        )}
        {card.layout === "transform" && (
          <div className={`card-inner ${flippedCards.has(`${card.id}-0`) ? 'flipped' : ''}`}>
            <div className="card-front mb-2" onClick={() => flipCard(`${card.id}-0`)}>
              {card.card_faces[0].image_uris && card.card_faces[0].image_uris.png && (
                <img src={card.card_faces[0].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              <div className="flip-indicator">{flippedCards.has(`${card.id}-0`) ? 'Click to Flip Back' : 'Click to Read Other Side'}</div>
              <div className="card-body text-center">
                <h5 className="card-title">{card.name}</h5>
                <p>Mana Cost: {card.card_faces[0].mana_cost}</p>
                <p>Oracle Text: {card.card_faces[0].oracle_text}</p>
              </div>
            </div>
            <div className="card-back mb-2" onClick={() => flipCard(`${card.id}-1`)}>
              {card.card_faces[1].image_uris && card.card_faces[1].image_uris.png && (
                <img src={card.card_faces[1].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              <div className="card-body text-center">
                <h5 className="card-title">{card.card_faces[1].name}</h5>
                <p>Mana Cost: {card.card_faces[1].mana_cost}</p>
                <p>Oracle Text: {card.card_faces[1].oracle_text}</p>
              </div>
            </div>
          </div>
        )}
        {card.layout === "modal_dfc" && (
          <div className={`card-inner ${flippedCards.has(`${card.id}-0`) ? 'flipped' : ''}`}>
            <div className="card-front mb-2" onClick={() => flipCard(`${card.id}-0`)}>
              {card.card_faces[0].image_uris && card.card_faces[0].image_uris.png && (
                <img src={card.card_faces[0].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              <div className="flip-indicator">{flippedCards.has(`${card.id}-0`) ? 'Click to Flip Back' : 'Click to Read Other Side'}</div>
              <div className="card-body text-center">
                <h5 className="card-title">{card.name}</h5>
                <p>Mana Cost: {card.card_faces[0].mana_cost}</p>
                <p>Oracle Text: {card.card_faces[0].oracle_text}</p>
              </div>
            </div>
            <div className="card-back mb-2" onClick={() => flipCard(`${card.id}-1`)}>
              {card.card_faces[1].image_uris && card.card_faces[1].image_uris.png && (
                <img src={card.card_faces[1].image_uris.png} className="card-img-top" alt={card.name} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              <div className="card-body text-center">
                <h5 className="card-title">{card.card_faces[1].name}</h5>
                <p>Mana Cost: {card.card_faces[1].mana_cost}</p>
                <p>Oracle Text: {card.card_faces[1].oracle_text}</p>
              </div>
            </div>
          </div>
        )}
        {card.layout !== "split" && card.layout !== "adventure" && card.layout !== "transform" && (!card.card_faces || card.card_faces.length !== 2) && (
          <div className={`card-inner `}>
            <div className="card-front mb-2">
              {card.image_uris && card.image_uris.png && (
                <img src={card.image_uris.png} className="card-img-top" alt={''} style={{ maxWidth: '100%', height: 'auto' }} />
              )}
              {card.card_faces && card.card_faces.length !== 2 && <div className="flip-indicator"></div>}
              <div className="card-body text-center">
                <h5 className="card-title">{card.name}</h5>
                <p>Mana Cost: {card.mana_cost}</p>
                <p>Oracle Text: {card.oracle_text}</p>
              </div>
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
