import { Routes, Route } from 'react-router'
import WritePage from './pages/WritePage'
import ExplorePage from './pages/ExplorePage'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WritePage />} />
      <Route path="/explore" element={<ExplorePage />} />
    </Routes>
  )
}

export default App