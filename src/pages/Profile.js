import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = ({ username }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`/user/${username}`);
        setUserInfo(response.data);
        setBio(response.data.bio);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [username]);

  const handleBioChange = async () => {
    try {
      await axios.put(`/user/bio/${username}`, { bio });
      console.log('Bio updated successfully');
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  return (
    <div>
      {userInfo ? (
        <div>
          <h2>Welcome, {userInfo.username}!</h2>
          <div>
            <strong>Email:</strong> {userInfo.email}
          </div>
          <div>
            <strong>Bio:</strong>{' '}
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            <button onClick={handleBioChange}>Save</button>
          </div>
          <DecksSection username={username} />
          <WishlistSection username={username} />
          <TradesSection username={username} />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

const DecksSection = ({ username }) => {
  // Implement fetching and displaying decks
};

const WishlistSection = ({ username }) => {
  // Implement fetching and displaying wishlist
};

const TradesSection = ({ username }) => {
  // Implement fetching and displaying trades
};

export default ProfilePage;