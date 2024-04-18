export const isValidToken = () => {
  const token = getTokenFromSession();
  console.log('Token from session:', token); // Log the token from session storage
  if (!token) {
    console.log('Token not present');
    return false; // Token is not present
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token structure');
      return false; // Token structure is invalid
    }

    const payload = JSON.parse(atob(tokenParts[1])); // Decode the payload part of the token
    const currentTime = Date.now() / 1000; // Convert current time to seconds
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token has expired');
      return false; // Token has expired
    }
    // Add additional validation logic as needed (e.g., signature verification, audience, issuer)
    console.log('Token is valid');
    return true; // Token is valid
  } catch (error) {
    console.error('Error decoding token:', error);
    return false; // Error decoding token
  }
};


export const storeTokenInSession = (token) => {
    sessionStorage.setItem('token', token); // Store the token in session storage
  };
  
  // Retrieve token from session storage
  export const getTokenFromSession = () => {
    return sessionStorage.getItem('token'); // Retrieve the token from session storage
  };
  
  // Remove token from session storage
  export const clearTokenFromSession = () => {
    sessionStorage.removeItem('token'); // Remove the token from session storage
  };
  
  // Check if token exists in session storage
  export const isTokenInSession = () => {
    return !!sessionStorage.getItem('token'); // Return true if token exists, false otherwise
  };
  
  // Clear all session storage
  export const clearSessionStorage = () => {
    sessionStorage.clear(); // Clear all items from session storage
  };

  