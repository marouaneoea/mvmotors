import {BrowserRouter as Router, Route, Routes} from "react-router-dom";


import './App.css'
import CarsOverview from "./components/Cars/CarsOverview.tsx";
import Navbar from "./components/Navbar.tsx";

function App() {
    return (
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/cars" element={<CarsOverview />} />
                    </Routes>
                </Router>
    );
}

export default App;
