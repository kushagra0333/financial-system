import { useState } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { GraphViewScreen } from "./components/GraphViewScreen";
import { JSONModal } from "./components/JSONModal";
import { type AnalysisData, type FraudRing } from "./components/types";

type Screen = "landing" | "dashboard" | "graph";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [runId, setRunId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const newRunId = response.headers.get("X-Run-ID");
      if (newRunId) setRunId(newRunId);

      const data = await response.json();
      setAnalysisData(data);
      setCurrentScreen("dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRing = (ringId: string) => {
    if (!analysisData) return;
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
        <LandingScreen onUploadComplete={handleUpload} isLoading={isLoading} error={error} />
      )}

      {currentScreen === "dashboard" && analysisData && (
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
        runId={runId}
      />
    </div>
  );
}
