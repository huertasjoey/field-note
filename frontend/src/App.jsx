import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import ArticlePage from "./pages/ArticlePage";
import Admin from "./pages/Admin";
import ArticleEditor from "./pages/ArticleEditor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/articles/new" element={<ArticleEditor />} />
            <Route path="/admin/articles/:id/edit" element={<ArticleEditor />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
