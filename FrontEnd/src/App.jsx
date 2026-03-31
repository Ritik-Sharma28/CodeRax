import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router";
import { checkAuth } from "./services/slices/authSlice";
import LoadingState from "./components/ui/LoadingState";
import LandingPage from "./pages/home/LandingPage";
import FeatureLandingPage from "./pages/home/FeatureLandingPage";

const Home = lazy(() => import("./pages/home/Home"));
const Problems = lazy(() => import("./pages/problem/Problems"));
const ProblemPage = lazy(() => import("./pages/problem/ProblemPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const RevisionMentorPage = lazy(() => import("./pages/features/RevisionMentorPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const BattleLobby = lazy(() => import("./pages/battle/BattleLobby"));
const BattleArena = lazy(() => import("./pages/battle/BattleArena"));
const BattleResults = lazy(() => import("./pages/battle/BattleResults"));
const MockInterviewPage = lazy(() => import("./pages/features/MockInterviewPage"));
const DSAVisualizerPage = lazy(() => import("./pages/visualizer/DSAVisualizerPage"));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!authChecked) {
    return <LoadingState title="Checking your session..." description="Loading CodeRax." darkMode={false} />;
  }

  const ProtectedAdmin = user?.role === "admin" ? <AdminPage /> : <Navigate to="/" replace />;

  return (
    <Suspense fallback={<LoadingState title="Opening page..." description="CodeRax is getting the next view ready." darkMode={false} />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:problemId" element={<ProblemPage />} />
        <Route path="/revision-mentor" element={isAuthenticated ? <RevisionMentorPage /> : <FeatureLandingPage featureKey="revision-mentor" />} />
        <Route path="/mock-interview" element={isAuthenticated ? <MockInterviewPage /> : <FeatureLandingPage featureKey="mock-interview" />} />
        <Route path="/dsa-visualizer" element={isAuthenticated ? <DSAVisualizerPage /> : <FeatureLandingPage featureKey="dsa-visualizer" />} />
        <Route path="/battle-lobby" element={isAuthenticated ? <BattleLobby /> : <FeatureLandingPage featureKey="battle-lobby" />} />
        <Route path="/battle/:matchId" element={isAuthenticated ? <BattleArena /> : <Navigate to="/battle-lobby" replace />} />
        <Route path="/battle-results/:matchId" element={isAuthenticated ? <BattleResults /> : <Navigate to="/battle-lobby" replace />} />
        <Route path="/admin" element={isAuthenticated ? ProtectedAdmin : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
