import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Blog from './components/Blog';
import StudyMaterials from './components/StudyMaterials';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import SubscriptionStatus from './components/Subscription/SubscriptionStatus';
import TestContentLock from './components/Subscription/TestContentLock';
import { ContentProtectionProvider } from './contexts/ContentProtectionContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ContentProtectionProvider>
      <Navbar />
      <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/study-materials/:categoryId?" element={<StudyMaterials />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/subscription" element={<SubscriptionPlans />} />
              <Route path="/subscription/status" element={<SubscriptionStatus />} />
            <Route path="/test-content-lock" element={<TestContentLock />} />
            </Routes>
          </div>
          <Footer />
      </ContentProtectionProvider>
        </div>
  );
}

export default App;