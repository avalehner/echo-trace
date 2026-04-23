import { Routes, Route } from 'react-router'
import WritePage from './pages/WritePage'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WritePage />} />
    </Routes>
  )
}

export default App