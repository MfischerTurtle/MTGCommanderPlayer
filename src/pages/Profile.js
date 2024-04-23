import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Profile = () => {
  const { username } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [bio, setBio] = useState('');

  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    twitch: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${username}`);
    console.log('User info response:', response.data); // Log the response data
    setUserInfo(response.data);
    setBio(response.data.bio);
    setSocialMedia(response.data.socialMedia);
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
};
    fetchUserInfo();
  }, [username]);

  const handleBioChange = async () => {
    try {
      await axios.put(`${BASE_URL}/user/bio/${username}`, { bio });
      console.log('Bio updated successfully');
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleSocialMediaChange = (event) => {
    const { name, value } = event.target;
    setSocialMedia(prevState => ({
      ...prevState,
      [name]: value,
    }));
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
          
          <div>
            <strong>Social Media:</strong>
            <input type="text" name="facebook" placeholder="Facebook" value={socialMedia?.facebook || ''} onChange={handleSocialMediaChange} />
            <input type="text" name="twitter" placeholder="Twitter" value={socialMedia?.twitter || ''} onChange={handleSocialMediaChange} />
            <input type="text" name="instagram" placeholder="Instagram" value={socialMedia?.instagram || ''} onChange={handleSocialMediaChange}/>
          </div>
          <div>
            <Link to="/decks">My Decks</Link>
            <Link to="/wishlist">My Wishlist</Link>
            <Link to="/trades">My Trades</Link>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Profile;
