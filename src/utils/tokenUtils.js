export const isValidToken = () => {
  const token = getTokenFromSession();
  console.log('Token from session:', token);
  if (!token) {
    console.log('Token not present');
    return false; 
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token structure');
      return false;
    }

    const payload = JSON.parse(atob(tokenParts[1])); 
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token has expired');
      return false; // Token has expired
    }
    
    console.log('Token is valid');
    return true; 
  } catch (error) {
    console.error('Error decoding token:', error);
    return false; 
  }
};

export const storeTokenInSession = (token) => {
    sessionStorage.setItem('token', token); 
  };
  
  export const getTokenFromSession = () => {
    return sessionStorage.getItem('token');
  };
  
  export const clearTokenFromSession = () => {
    sessionStorage.removeItem('token');
  };
  
  export const isTokenInSession = () => {
    return !!sessionStorage.getItem('token'); 
  };
  
  export const clearSessionStorage = () => {
    sessionStorage.clear();
  };

  