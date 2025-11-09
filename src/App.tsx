import React from "react";
import "./global.scss";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import DeckPage from "./components/inputComponents/DeckPage";
import Header from "./components/Header";
import EditPage from "./components/editComponents/EditPage";
import TestPage from "./components/TestPage";
import HelpPage from "./components/HelpPage";
import LoginPage from "./components/loginComponents/LoginPage";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Header />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/deck/:deckId" element={<DeckPage />} />
                    <Route path="/edit/:deckId" element={<EditPage />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/help" element={<HelpPage />} />
                </Route>
            </Routes>
        </Router>
    );
}
