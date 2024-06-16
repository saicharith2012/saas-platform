import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Plans from './pages/Plans';

function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/plans" element={<Plans/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
