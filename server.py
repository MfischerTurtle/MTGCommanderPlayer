from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
import requests
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Initialize CORS

# Determine MongoDB URI based on the environment
if os.environ.get('FLASK_ENV') == 'development':
    mongodb_uri = os.environ.get('MONGODB_URI')  # Use the MongoDB URI from the .env file
else:
    mongodb_uri = os.environ.get('APTIBLE_MONGODB_URI')  # Connect to local MongoDB instance

try:
    # Connect to MongoDB using the determined URI
    client = MongoClient(mongodb_uri)
    db = client[os.environ.get('DATABASE_NAME')]
    users_collection = db['users']
    print("Connected to MongoDB successfully")
except Exception as e:
    print("Error connecting to MongoDB:", e)

app.secret_key = os.urandom(24)

# Scryfall API base URL for card search
SCRYFALL_BASE_URL = os.environ.get('SCRYFALL_BASE_URL')

# Function to construct Scryfall API search URL
def url_constructor(order=None, q=None, color=None, cmc=None, types=None, creature_types=None, rule_text=None, enchantment_types=None, land_types=None, spell_types=None):
    queryParams = []

    if order: queryParams.append(f'order={order}')
    if q: queryParams.append(f'q={q}')
    if color: queryParams.append(f'color={color}')
    if cmc: queryParams.append(f'cmc={cmc}')
    if types: queryParams.extend([f'type={card_type}' for card_type in types])
    if creature_types: queryParams.extend([f't:{creature_type}' for creature_type in creature_types])
    if rule_text: queryParams.append(f'o:~"{rule_text}"')  # Enclose rule text in double quotes
    if enchantment_types: queryParams.extend([f'e:{enchantment_type}' for enchantment_type in enchantment_types])
    if land_types: queryParams.extend([f'l:{land_type}' for land_type in land_types])
    if spell_types: queryParams.extend([f's:{spell_type}' for spell_type in spell_types])

    fullUrl = SCRYFALL_BASE_URL + '&'.join(queryParams)
    return fullUrl


def fetch_cards(api_url):
    try:
        print("API URL:", api_url)  # Print out the API URL for debugging
        response = requests.get(api_url)
        data = response.json()
        return data.get('data', [])
    except Exception as e:
        print("Error fetching cards:", e)
        return None

def fetch_creature_types():
    try:
        response = requests.get('https://api.scryfall.com/catalog/creature-types')
        data = response.json()
        creature_types = data.get('data', [])
        return creature_types
    except Exception as e:
        print("Error fetching creature types:", e)
        return []

@app.route('/creature-types', methods=['GET'])
def get_creature_types():
    try:
        creature_types = fetch_creature_types()
        return jsonify(creature_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 
    
def fetch_land_types():
    try:
        response = requests.get('https://api.scryfall.com/catalog/land-types')
        data = response.json()
        land_types = data.get('data', [])
        return land_types
    except Exception as e:
        print("Error fetching land types:", e)
        return []

@app.route('/land-types', methods=['GET'])
def get_land_types():
    try:
        land_types = fetch_land_types()
        return jsonify(land_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def fetch_enchantment_types():
    try:
        response = requests.get('https://api.scryfall.com/catalog/enchantment-types')
        data = response.json()
        enchantment_types = data.get('data', [])
        return enchantment_types
    except Exception as e:
        print("Error fetching enchantment types:", e)
        return []

@app.route('/enchantment-types', methods=['GET'])
def get_enchantment_types():
    try:
        enchantment_types = fetch_enchantment_types()
        return jsonify(enchantment_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def fetch_spell_types():
    try:
        response = requests.get('https://api.scryfall.com/catalog/spell-types')
        data = response.json()
        spell_types = data.get('data', [])
        return spell_types
    except Exception as e:
        print("Error fetching spell types:", e)
        return []

@app.route('/spell-types', methods=['GET'])
def get_spell_types():
    try:
        spell_types = fetch_spell_types()
        return jsonify(spell_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Endpoint for searching cards using Scryfall API
@app.route('/search', methods=['GET'])
def search_cards():
    print('Received search request')
    query = request.args.get('q', default='')  # Make query parameter optional
    colors = request.args.get('colors')
    creature_types = request.args.getlist('creature_types')  # Get list of creature types
    rule_text = request.args.get('rule_text')  # Get the rule text query parameter

    if not query and not colors and not creature_types and not rule_text:  # If none of the parameters provided
        return jsonify({'error': 'At least one of q, colors, creature_types, or rule_text are required'}), 400

    try:
        api_url = url_constructor(q=query, color=colors, creature_types=creature_types, rule_text=rule_text)
        data = fetch_cards(api_url)
        if data:
            return jsonify(data), 200
        else:
            return jsonify({'error': 'Error fetching cards'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Endpoint for user registration
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username and password:
        if users_collection.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 400
        else:
            user_data = {
                'username': username,
                'password': password,
                'decks': [],
                'wishlist': [],
                'trade_cards': []
            }
            users_collection.insert_one(user_data)
            return jsonify({'message': 'User registered successfully'}), 201
    else:
        return jsonify({'error': 'Username and password are required'}), 400
# trying to save to git hub hope this works 
# Endpoint for user login
@app.route('/check-login', methods=['GET'])
def check_login():
    if 'username' in session:  # Check if username is stored in session (indicating user is logged in)
        return jsonify({'isLoggedIn': True}), 200
    else:
        return jsonify({'isLoggedIn': False}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username and password:
        user = users_collection.find_one({'username': username, 'password': password})
        if user:
            session['username'] = username  # Store username in session upon successful login
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    else:
        return jsonify({'error': 'Username and password are required'}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)  # Remove username from session upon logout
    return jsonify({'message': 'Logout successful'}), 200
# Endpoint for adding a deck
@app.route('/user/deck', methods=['POST'])
def add_deck():
    data = request.json
    username = data.get('username')
    deck_name = data.get('deck_name')
    if username and deck_name:
        user = users_collection.find_one({'username': username})
        if user:
            users_collection.update_one({'username': username}, {'$push': {'decks': deck_name}})
            return jsonify({'message': 'Deck added successfully'}), 201
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return jsonify({'error': 'Username and deck name are required'}), 400




# Endpoint for managing wishlist
@app.route('/user/wishlist', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_wishlist():
    if request.method == 'GET':
        username = request.args.get('username')
        if username:
            user = users_collection.find_one({'username': username})
            if user:
                return jsonify({'wishlist': user.get('wishlist', [])}), 200
            else:
                return jsonify({'error': 'User not found'}), 404
        else:
            return jsonify({'error': 'Username is required for GET request'}), 400

    elif request.method == 'POST':
        data = request.json
        username = data.get('username')
        card_info = data.get('card_info')
        if username and card_info:
            users_collection.update_one({'username': username}, {'$push': {'wishlist': card_info}})
            return jsonify({'message': 'Card added to wishlist successfully'}), 201
        else:
            return jsonify({'error': 'Username and card info are required'}), 400
        

    # Add handling for PUT and DELETE requests similarly

# Endpoint for managing trade cards (similar to wishlist)

if __name__ == '__main__':
    app.run(debug=True)
