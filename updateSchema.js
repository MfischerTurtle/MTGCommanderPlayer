const { MongoClient } = require('mongodb');

async function updateSchema() {
  const uri = 'mongodb://localhost:27017'; // Your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('MTGDeckBuilder');
    const collection = database.collection('users'); // Your collection name

    await collection.updateMany(
      { }, // Update all documents
      { $set: { 
          social_media: {
            twitter: "",
            instagram: "",
            facebook: "",
            twitch: "",
            
          },
          bio: "",
          profile_picture: ""
      } }
    );
    
    console.log('Schema updated successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.close();
  }
}

updateSchema();