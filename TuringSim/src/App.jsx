import axios from "axios";
import React, { useEffect, useState } from "react";
import { fetchData } from './api';

const baseURL = import.meta.env.VITE_SOURCE_URL;

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(baseURL);
        setData(response.data);
      } catch (err) {
        setError(err.message); 
      }
    };

    fetchData();
  }, []);

  if (error) return <p>Error loading data: {error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Configurations</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
