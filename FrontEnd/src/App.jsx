import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './services/slices/authSlice';
import { Navigate, Route, Routes } from 'react-router';
import Home from './pages/home/Home';
import Problems from './pages/problem/Problems';
import ProblemPage from './pages/problem/ProblemPage';
import AdminPage from './pages/admin/AdminPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import RevisionMentorPage from './pages/features/RevisionMentorPage';
import ProfilePage from './pages/profile/ProfilePage';
import BattleLobby from './pages/battle/BattleLobby';
import BattleArena from './pages/battle/BattleArena';
import BattleResults from './pages/battle/BattleResults';
import MockInterviewPage from './pages/features/MockInterviewPage';
import DSAVisualizerPage from './pages/visualizer/DSAVisualizerPage';

function App() {

  const dispatch = useDispatch();

  const { user, isAuthenticated, authChecked } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth());
  }, [])

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <>

      <Routes>

        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />}></Route>
        <Route path="/problems" element={isAuthenticated ? <Problems /> : <Navigate to="/login" />}></Route>
        <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />}></Route>
        <Route path="/revision-mentor" element={isAuthenticated ? <RevisionMentorPage /> : <Navigate to="/login" />}></Route>
        <Route path="/mock-interview" element={isAuthenticated ? <MockInterviewPage /> : <Navigate to="/login" />}></Route>
        <Route path="/dsa-visualizer" element={isAuthenticated ? <DSAVisualizerPage /> : <Navigate to="/login" />}></Route>
        <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" />}></Route>
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}></Route>
        <Route path="/battle-lobby" element={isAuthenticated ? <BattleLobby /> : <Navigate to="/login" />}></Route>
        <Route path="/battle/:matchId" element={isAuthenticated ? <BattleArena /> : <Navigate to="/login" />}></Route>
        <Route path="/battle-results/:matchId" element={isAuthenticated ? <BattleResults /> : <Navigate to="/login" />}></Route>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />}></Route>

      </Routes>

    </>
  )
}

export default App
