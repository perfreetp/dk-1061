import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { PersonalityLibrary } from "@/pages/PersonalityLibrary";
import { ComparePage } from "@/pages/ComparePage";
import { PurchasePage } from "@/pages/PurchasePage";
import { MonitorPage } from "@/pages/MonitorPage";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/personalities" element={<PersonalityLibrary />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/monitor" element={<MonitorPage />} />
      </Routes>
    </Router>
  );
}
