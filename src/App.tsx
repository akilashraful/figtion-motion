import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { EditorProvider } from './context/EditorContext';
import { EditorPage } from './pages/EditorPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ExplorePage } from './pages/ExplorePage';
import { ShortcutsPage } from './pages/ShortcutsPage';

export const App: React.FC = () => {
  return (
    <EditorProvider>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/shortcuts" element={<ShortcutsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </EditorProvider>
  );
};
export default App;
