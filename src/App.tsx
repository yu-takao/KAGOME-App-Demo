import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ShellLayout from './layouts/Shell';
import Personal from './pages/Personal';
import Group from './pages/Group';
import Settings from './pages/Settings';
import MarkSettings from './pages/settings/MarkSettings';
import MarkList from './pages/settings/MarkList';
import TextRuleList from './pages/settings/TextRuleList';
import TextRuleSettings from './pages/settings/TextRuleSettings';
import ResultDetail from './pages/ResultDetail';
import BasePaper from './pages/settings/BasePaper';
import BasePaperList from './pages/settings/BasePaperList';
import BasePaperForm from './pages/settings/BasePaperForm';
import NgDetail from './pages/NgDetail';
function Placeholder({ title }: { title: string }) {
  return (
    <div className="app-root app-with-sidebar">
      <main className="content">
        <div className="content-inner">
          <h1 className="app-title">{title}</h1>
          <p className="app-subtitle">準備中のダミーページです。</p>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Navigate to="/personal" replace />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/personal/ng" element={<NgDetail />} />
          <Route path="/group" >
            <Route index element={<Group />} />
            <Route path=":id" element={<ResultDetail />} />
          </Route>
            <Route path="/settings" element={<Settings />} >
            <Route index element={<Navigate to="/settings/base" replace />} />
            <Route path="base" element={<BasePaper />} >
              <Route index element={<BasePaperList />} />
              <Route path="new" element={<BasePaperForm />} />
            </Route>
            <Route path="mark" >
              <Route index element={<MarkList />} />
              <Route path="new" element={<MarkSettings />} />
            </Route>
            <Route path="text" >
              <Route index element={<TextRuleList />} />
              <Route path="new" element={<TextRuleSettings />} />
            </Route>
            {/* 工場制約は製品パッケージ登録に内包されたためタブ/ルートを削除 */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


