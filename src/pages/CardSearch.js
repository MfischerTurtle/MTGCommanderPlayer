import React, { useContext ,useState, useEffect } from 'react';
import axios from 'axios';
import '../../src/App.css';
import AuthContext from '../utils/AuthContext'

const BASE_URL = process.env.REACT_APP_SCRYFALL_BASE_URL;
const SUBTYPE_URL = process.env.REACT_APP_SCRYFALL_SUBTYPE_URL


function CardSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedPage, setHighlightedPage] = useState(1); 
  const cardsPerPage = 12;
  const [selectedColors, setSelectedColors] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [cmcValue, setCmcValue] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState([]); 
  const [subtypes, setSubtypes] = useState([]);
  const [subtypeSearchInput, setSubtypeSearchInput] = useState('');
  const [rulesTextSearchInput, setRulesTextSearchInput] = useState('');
  const { isLoggedIn } = useContext(AuthContext);
  
  


  useEffect(() => {
    const fetchCreatureTypes = async () => {
      try {
        const response = await axios.get(`${SUBTYPE_URL}creature-types`);
        setSubtypes(prevState => [...prevState, ...response.data.data]); 
      } catch (error) {
        console.error('Error fetching creature types:', error);
      }
    };
    fetchCreatureTypes();
  }, []);

  useEffect(() => {
    const fetchLandTypes = async () => {
      try {
        const response = await axios.get(`${SUBTYPE_URL}land-types`);
        setSubtypes(prevState => [...prevState, ...response.data.data]); 
      } catch (error) {
        console.error('Error fetching land types:', error);
      }
    };
    fetchLandTypes();
  }, []);

  useEffect(() => {
    const fetchSpellTypes = async () => {
      try {
        const response = await axios.get(`${SUBTYPE_URL}spell-types`);
        setSubtypes(prevState => [...prevState, ...response.data.data]); 
      } catch (error) {
        console.error('Error fetching spell types:', error);
      }
    };
    fetchSpellTypes();
  }, []);

  useEffect(() => {
    const fetchEnchantmentTypes = async () => {
      try {
        const response = await axios.get(`${SUBTYPE_URL}enchantment-types`);
        setSubtypes(prevState => [...prevState, ...response.data.data]); 
      } catch (error) {
        console.error('Error fetching enchantment types:', error);
      }
    };
    fetchEnchantmentTypes();
  }, []);
  
  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubtypeInputChange = (event) => {
    const inputValue = event.target.value.toLowerCase();
    setSubtypeSearchInput(inputValue);
  
    const closestMatch = subtypes.find(subtype => subtype.toLowerCase().startsWith(inputValue));

    if (closestMatch) {
      const element = document.getElementById(closestMatch);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  const handleSelectSubtype = (event) => {
    const selectedSubtypes = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedSubtypes(selectedSubtypes);
  };

  const handleColorChange = (event) => {
    const color = event.target.value;
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleCmcChange = (event) => {
    setCmcValue(event.target.value);
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const clearAll = () => {
    setQuery('');
    setSelectedColors([]);
    setCmcValue('');
    setSelectedTypes([]);
    setSelectedSubtypes([]);
    setSubtypeSearchInput('');
    setRulesTextSearchInput('');
    setSearchResults([]); 
  };

  const clearAllTypes = () => {
    setSelectedTypes([]);
    setSelectedSubtypes([]);
  };

  const clearSelectedType = (type) => {
    setSelectedTypes(selectedTypes.filter((t) => t !== type));
  };


  const clearSelectedSubtype = (subtype) => {
    setSelectedSubtypes(selectedSubtypes.filter((st) => st !== subtype));
  };

  const handleSearch = async () => {
    try {
      let requestUrl = `${BASE_URL}q=`;
  
      if (query) {
        const encodedQuery = encodeURIComponent(query);
        requestUrl += encodedQuery;
      }
  
      let colorQuery = '';
      if (selectedColors.length > 0) {
        colorQuery = selectedColors.map((color) => `c:${color}`).join('+');
      }
  
      const cmcQuery = cmcValue !== '' ? `cmc=${cmcValue}` : '';
      const typeQuery = selectedTypes.map((type) => `t:${type}`).join('+');
      const subtypeQuery = selectedSubtypes.map((subtype) => `t:${subtype}`).join('+');
  
      const excludedColorsQuery = ['W', 'U', 'B', 'R', 'G']
        .filter(color => !selectedColors.includes(color))
        .map(color => `-c:${color}`)
        .join('+');
  
      if (colorQuery !== '' || cmcQuery !== '' || typeQuery !== '' || subtypeQuery !== '') {
        const queryParams = [colorQuery, cmcQuery, typeQuery, subtypeQuery].filter(Boolean);
        requestUrl += `+${queryParams.join('+')}`;
      }
  
      if (selectedColors.length > 0 && excludedColorsQuery !== '') {
        requestUrl += `+${excludedColorsQuery}`;
      }
  
      if (rulesTextSearchInput) {
        const ruleTextQuery = `o:"${encodeURIComponent(rulesTextSearchInput)}"`;
        requestUrl += `+${ruleTextQuery}`;
      }
  
      const response = await axios.get(requestUrl);
      setCurrentPage(1);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching cards:', error);
      setSearchResults([]);
    }
  };
  

  const filterByCmc = (cards, targetCmc) => {
   
    if (!Array.isArray(cards)) {
        return [];
    }

    return cards.filter((card) => {
        return card.cmc === targetCmc;
    });
};


 
  const filterDuplicates = (cards) => {
    if (!Array.isArray(cards) || cards.length === 0) {
        return [];
    }
    const seenArenaIds = new Set();
    return cards.filter((card) => {
        const uniqueIdentifier = card.arena_id ? card.arena_id : card.name;
        if (!seenArenaIds.has(uniqueIdentifier)) {
            seenArenaIds.add(uniqueIdentifier);
            return true;
        }
        return false;
    });
};

const flipCard = (cardId) => {
  const cardIdParts = cardId.split("-");
  const cardIdPart = cardIdParts.slice(0, -1).join("-");
  const faceIndex = cardIdParts.slice(-1)[0];
  const card = filteredSearchResults.find((c) => c.id === cardIdPart); 

  if (card && card.card_faces && card.card_faces.length === 2) {
    const newFlippedCards = new Set(flippedCards);
    const isFlipped = newFlippedCards.has(cardId);
    if (isFlipped) {
      newFlippedCards.delete(cardId);
    } else {
      const oppositeFaceIndex = faceIndex === '0' ? '1' : '0';
      const oppositeCardId = `${cardIdPart}-${oppositeFaceIndex}`;
      if (newFlippedCards.has(oppositeCardId)) {
        newFlippedCards.delete(oppositeCardId);
      }
      newFlippedCards.add(cardId);
    }
    setFlippedCards(newFlippedCards); 
  }
};

const paginate = (pageNumber) => {
  console.log("Pagination requested for page:", pageNumber);
  setCurrentPage(pageNumber);
  setHighlightedPage(pageNumber);
};
  const filteredByCmc = filterByCmc(searchResults.data, parseInt(cmcValue));
  
  const filteredSearchResults = filterDuplicates(filteredByCmc.length > 0 ? filteredByCmc : searchResults.data);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredSearchResults.slice(indexOfFirstCard, indexOfLastCard);

  const renderActionButton = () => {
    if (isLoggedIn) {
      return (
        <div className="d-flex justify-content-around">
          <button className="btn btn-success">Add to Deck</button>
          <button className="btn btn-info">Add to Wishlist</button>
          <button className="btn btn-warning">Add to Trades</button>
        </div>
      );
    }
    return null; // If user is not logged in, don't render the buttons
  };

  return (
    <div className="container mt-5">
      <h4>Search by Name</h4>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for cards..."
          value={query}
          onChange={handleChange}
        />
        <div>
          <h4>Search By Color</h4>
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
        <h4>Types</h4>
        <select
          multiple
          className="form-select mb-3"
          onChange={handleTypeChange}
          value={selectedTypes}
        >
          <option value="Artifact">Artifact</option>
          <option value="Basic">Basic</option>
          <option value="Battle">Battle</option>
          <option value="Conspiracy">Conspiracy</option>
          <option value="Creature">Creature</option>
          <option value="Dungeon">Dungeon</option>
          <option value="Eaturecray">Eaturecray</option>
          <option value="Enchantment">Enchantment</option>
          <option value="Ever">Ever</option>
          <option value="Host">Host</option>
          <option value="Instant">Instant</option>
          <option value="Legendary">Legendary</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Phenomenon">Phenomenon</option>
          <option value="Plane">Plane</option>
          <option value="Planeswalker">Planeswalker</option>
          <option value="Scariest">Scariest</option>
          <option value="Scheme">Scheme</option>
          <option value="See">See</option>
          <option value="Snow">Snow</option>
          <option value="Sorcery">Sorcery</option>
          <option value="Tribal">Tribal</option>
          <option value="Summon">Summon</option>
          <option value="Vanguard">Vanguard</option>
          <option value="World">World</option>
          <option value="You'll">You'll</option>
        </select>
        <div>
    {selectedTypes.map((type) => (
        <span key={type} className="badge bg-primary me-2">
            {type}
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => clearSelectedType(type)}
            ></button>
        </span>
    ))}
    {selectedSubtypes.map((subtype) => (
        <span key={subtype} className="badge bg-primary me-2">
            {subtype}
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => clearSelectedSubtype(subtype)}
            ></button>
        </span>
    ))}
</div>

<div className="container mt-5">
  <h4>Subtypes</h4>
    <input
  type="text"
  className="form-control"
  placeholder="Search for subtypes..."
  value={subtypeSearchInput}
  onChange={handleSubtypeInputChange}
/>

<select
  multiple
  className="form-select mb-3"
  value={selectedSubtypes}
  onChange={handleSelectSubtype}
>
  {[...new Set(subtypes.filter(subtype => subtype.toLowerCase().includes(subtypeSearchInput)))]
    .map((subtype, index) => (
      <option
        key={`${subtype}-${index}`}
        value={subtype}
        id={subtype}
      >
        {subtype}
      </option>
    ))}
</select>
</div>

<input
  type="text"
  value={rulesTextSearchInput}
  onChange={(e) => setRulesTextSearchInput(e.target.value)}
  placeholder="Enter rule text..."
/>

<button className="btn btn-primary mt-2 me-2" onClick={handleSearch}>
 Search
</button>
<button className="btn btn-secondary mt-2" onClick={clearAllTypes}>
 Clear All Types
 </button>
<button className="btn btn-warning mt-2" onClick={clearAll}>
Clear All
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
              {renderActionButton()}
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
          <button 
            onClick={() => paginate(pageNumber + 1)} 
            className={`page-link ${highlightedPage === pageNumber + 1 ? 'highlighted' : ''}`} // Apply 'highlighted' class if current page
          >
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

export default CardSearch;
