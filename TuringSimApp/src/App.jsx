import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import EditorPage  from "./pages/EditorPage";
import LoadPage from "./pages/LoadPage";
import "./App.css";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AuthProvider } from "./hooks/UseAuth";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/loads"
          element={
            <ProtectedRoute>
              <LoadPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;