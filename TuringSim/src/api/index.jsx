import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SOURCE_URL,
});

export const fetchData = async () => {
  try {
    const response = await api.get('/configurations') 
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default api;


