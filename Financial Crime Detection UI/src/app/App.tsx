import { useState } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { GraphViewScreen } from "./components/GraphViewScreen";
import { JSONModal } from "./components/JSONModal";
import { generateMockData, type FraudRing } from "./components/mockData";

type Screen = "landing" | "dashboard" | "graph";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);
  const [showJSONModal, setShowJSONModal] = useState(false);
  
  const analysisData = generateMockData();

  const handleUploadComplete = () => {
    setCurrentScreen("dashboard");
  };

  const handleViewRing = (ringId: string) => {
    const ring = analysisData.rings.find(r => r.id === ringId);
    if (ring) {
      setSelectedRing(ring);
      setCurrentScreen("graph");
    }
  };

  const handleBackToDashboard = () => {
    setSelectedRing(null);
    setCurrentScreen("dashboard");
  };

  const handleDownloadJSON = () => {
    setShowJSONModal(true);
  };

  return (
    <div className="dark">
      {currentScreen === "landing" && (
        <LandingScreen onUploadComplete={handleUploadComplete} />
      )}
      
      {currentScreen === "dashboard" && (
        <DashboardScreen
          data={analysisData}
          onViewRing={handleViewRing}
          onDownloadJSON={handleDownloadJSON}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
      )}
      
      {currentScreen === "graph" && selectedRing && (
        <GraphViewScreen
          ring={selectedRing}
          onBack={handleBackToDashboard}
        />
      )}

      <JSONModal
        isOpen={showJSONModal}
        onClose={() => setShowJSONModal(false)}
        data={analysisData}
      />
    </div>
  );
}
