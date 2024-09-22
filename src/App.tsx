import React from "react";
import "./global.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import DeckPage from "./components/inputComponents/DeckPage";
import Header from "./components/Header";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Header />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/deck/:id" element={<DeckPage />} />
                </Route>
            </Routes>
        </Router>
    );
}
