import axios from "axios";

const baseURL = import.meta.env.VITE_SOURCE_URL;
const configurationsEndpoint = "/configurations";
const authenticationsEndpoint = "/authentications"

export const fetchData = async () => {
  try {
    const response = await axios.get(`${baseURL}${configurationsEndpoint}`);
    return response.data;
  } catch (error) {
    throw error; 
  }
};

export const getAuthentication = async (data) => {
  try{
    const response = await axios.post(`${baseURL}${authenticationsEndpoint}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
