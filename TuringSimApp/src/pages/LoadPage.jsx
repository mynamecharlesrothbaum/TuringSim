import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";

const LoadPage = () => {
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { load, loadConfigs, deleteConfigId } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const configs = await loadConfigs();
        setConfigurations(configs); 
      } catch (error) {
        console.error("Error fetching configurations:", error);
        setErrorMessage("Unexpected error occurred while fetching configurations");
      }
    };
    fetchConfigurations();
  }, [loadConfigs]);

  const handleLoad = async (configId) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await load({ configId });
  
      if (!result || !result.rules) {
        setErrorMessage("Failed to load rules for the configuration.");
        return;
      }
  
      console.log("Rules received in handleLoad:", result.rules);
  
      const newRules = result.rules.map((rule, index) => {
        console.log(`Rule ${index} name:`, rule.name);
        return {
          name: rule.name === undefined || rule.name === '' ? 'defaultName' : rule.name,
          previousState: rule.previousState === undefined ? '' : rule.previousState,
          readSymbol: rule.readSymbol === "na" ? "" : rule.readSymbol,
          writeSymbol: rule.writeSymbol === "na" ? "" : rule.writeSymbol,
          nextState: rule.nextState === undefined ? '' : rule.nextState,
          moveDirection: rule.moveDirection,
        };
      });
      console.log("Navigating with rules:", newRules);
      navigate("/editor", { state: { rules: newRules, configName: result.configName } });


      setSuccessMessage(`Configuration loaded successfully`);
    } catch (error) {
      console.error("Error loading configuration:", error);
      setErrorMessage("Failed to load the configuration");
    }
  };

  const handleDelete = async (configId) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteConfigId({ configId });
      setConfigurations(configurations.filter(config => config.config_id !== configId));
      setSuccessMessage("Configuration deleted successfully");
    } catch (error) {
      console.error(`Error deleting configuration with ID ${configId}:`, error);
      setErrorMessage("Failed to delete the configuration");
    }
  };

  return (
    <div>
      <div className="title-container">
        <h2>Saved Configurations</h2>
      </div>
      <div className="saved-configs">
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          <ul>
            {configurations.map(config => (
                <div>
                  <strong>{config.name}</strong>
                  <p>Last updated: {new Date(config.date_last_updated).toLocaleString()}</p>
                  <button onClick={() => handleLoad(config.config_id)}>Load</button>
                  <button onClick={() => handleDelete(config.config_id)}>Delete</button>
                </div>
            ))}
          </ul>
        </div>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
  
};

export default LoadPage;
