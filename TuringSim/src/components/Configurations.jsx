import React, { useEffect, useState } from "react";
import { fetchData } from "../api/fetchData";

function Configurations() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    };

    getData();
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

export default Configurations;


