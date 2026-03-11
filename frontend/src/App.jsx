import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"

import Layout from "./components/Layout.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import AuthProvider from "./context/AuthContext.jsx"
import Home from "./pages/Home.jsx"
import IdeaDetail from "./pages/IdeaDetail.jsx"
import CreateIdea from "./pages/CreateIdea.jsx"
import EditIdea from "./pages/EditIdea.jsx"
import JoinRequests from "./pages/JoinRequests.jsx"
import Notifications from "./pages/Notifications.jsx"
import Profile from "./pages/Profile.jsx"
import UserProfile from "./pages/UserProfile.jsx"
import Login from "./pages/Login.jsx"
import NotFound from "./pages/NotFound.jsx"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ideas/:id" element={<IdeaDetail />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/ideas/new" element={<CreateIdea />} />
              <Route path="/ideas/:id/edit" element={<EditIdea />} />
              <Route path="/join-requests" element={<JoinRequests />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
