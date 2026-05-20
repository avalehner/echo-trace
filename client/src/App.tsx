import { Routes, Route } from 'react-router';
import WritePage from './pages/WritePage';
import ExplorePage from './pages/ExplorePage';
import PlayMemoryPage from './pages/PlayMemoryPage';
import NavBar from './components/NavBar';

const App = () => {
  return (
    <>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<WritePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/listen/:id" element={<PlayMemoryPage />} />
      </Routes>
    </>
  );
};

export default App;
