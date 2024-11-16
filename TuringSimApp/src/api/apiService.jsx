import axios from "axios";
const baseURL = import.meta.env.VITE_SOURCE_URL;
const configurationsEndpoint = "/configurations";
const authenticationsEndpoint = "/authentications";
const registrationsEndpoint = "/registrations";
const savesEndpoint = "/saves";
const loadsEndpoint = "/loads";
const loadConfigsEndpoint = "/load-configs";

export const fetchData = async () => {
  try {
    const response = await axios.get(`${baseURL}${configurationsEndpoint}`);
    return response.data;
  } catch (error) {
    throw error; 
  }
};

export const getAuthentication = async (data) => {
  const response = await axios.post(`${baseURL}${authenticationsEndpoint}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export const getRegistration = async (data) => {
  const response = await axios.post(`${baseURL}${registrationsEndpoint}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export const getSave = async (data) => {
  const response = await axios.post(`${baseURL}${savesEndpoint}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export const getLoad = async (data) => {
  const response = await axios.post(`${baseURL}${loadsEndpoint}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}
 
export const getConfigs = async (username) => {
  const data = { username };
  const response = await axios.post(`${baseURL}${loadConfigsEndpoint}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}