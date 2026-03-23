import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './services/authSlice';
import { Navigate, Route, Routes } from 'react-router';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemPage from './pages/ProblemPage';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RevisionMentorPage from './pages/RevisionMentorPage';
import ProfilePage from './pages/ProfilePage';
import BattleLobby from './pages/BattleLobby';
import BattleArena from './pages/BattleArena';
import BattleResults from './pages/BattleResults';

function App() {

  const dispatch = useDispatch();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth());
  }, [])

  if (loading) return (
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
