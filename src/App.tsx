import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Reader from './pages/Reader'
import Practice from './pages/Practice'
import Flashcards from './pages/Flashcards'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { StoreProvider } from './store/main'

const App = () => (
  <StoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/reader" element={<Reader />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect obsolete builder route gracefully */}
            <Route path="/builder" element={<Navigate to="/practice" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </StoreProvider>
)

export default App
