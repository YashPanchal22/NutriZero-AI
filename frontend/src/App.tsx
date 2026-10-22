import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatPage } from './pages/ChatPage';
import { PantryChefPage } from './pages/PantryChefPage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { FoodWastePage } from './pages/FoodWastePage';
import { FoodStoragePage } from './pages/FoodStoragePage';
import { NutritionExplorerPage } from './pages/NutritionExplorerPage';
import { GroceryPlannerPage } from './pages/GroceryPlannerPage';
import { SDG2Page } from './pages/SDG2Page';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { getCurrentSessionId, setCurrentSessionId } from './services/storage';
import { HistoryModal } from './components/HistoryModal';
import { useNavigate } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [currentSessionId, setSessionId] = useState<string | null>(getCurrentSessionId());
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    setCurrentSessionId(id);
  };

  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    setSessionId(newId);
    setCurrentSessionId(newId);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'AI Food & Nutrition Assistant';
      case '/pantry-chef': return 'Pantry Chef Recipe Generator';
      case '/meal-planner': return 'Budget Meal Planner';
      case '/food-waste': return 'Food Waste Reducer & Revival';
      case '/food-storage': return 'Food Storage Guidelines';
      case '/nutrition-explorer': return 'Nutrient Breakdown & Explorer';
      case '/grocery-planner': return 'Smart Grocery Shopping Planner';
      case '/sdg-2': return 'UN SDG 2: Zero Hunger Education';
      case '/dashboard': return 'Impact & Household Metrics';
      case '/settings': return 'Application Settings';
      default: return 'NutriZero AI';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-950 font-sans text-slate-100">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenHistory={() => setHistoryModalOpen(true)}
          title={getPageTitle()}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <ChatPage
                  currentSessionId={currentSessionId}
                  onSessionUpdated={(id) => {
                    setSessionId(id);
                    setCurrentSessionId(id);
                  }}
                />
              }
            />
            <Route path="/pantry-chef" element={<PantryChefPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/food-waste" element={<FoodWastePage />} />
            <Route path="/food-storage" element={<FoodStoragePage />} />
            <Route path="/nutrition-explorer" element={<NutritionExplorerPage />} />
            <Route path="/grocery-planner" element={<GroceryPlannerPage />} />
            <Route path="/sdg-2" element={<SDG2Page />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <ChatPage
                  currentSessionId={currentSessionId}
                  onSessionUpdated={(id) => {
                    setSessionId(id);
                    setCurrentSessionId(id);
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>

      {/* Global All Recent Chats Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          handleSelectSession(id);
          navigate('/');
        }}
        onNewChat={() => {
          handleNewChat();
          navigate('/');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
