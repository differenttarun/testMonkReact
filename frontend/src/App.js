import "./App.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestSuite from "./components/TestSuite";
import TestScript from "./components/TestScript";
import TestCase from "./components/TestCase";
import AppModel from "./components/AppModel";
import ScriptModel from "./components/ScriptModel";
import ResourceModel from "./components/ResourceModel";
import ExpectedResult from "./components/ExpectedResults";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/testSuite" element={<TestSuite />} />
          <Route path="/testCase" element={<TestCase />} />
          <Route path="/testScript" element={<TestScript />} />
          <Route path="/appModel" element={<AppModel />} />
          <Route path="/scriptModel" element={<ScriptModel />} />
          <Route path="/resourceModel" element={<ResourceModel />} />
          <Route path="/expectedResults" element={<ExpectedResult />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
