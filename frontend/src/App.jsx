import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import ArticlePage from "./pages/ArticlePage";
import Admin from "./pages/Admin";
import ArticleEditor from "./pages/ArticleEditor";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/articles/new" element={<ArticleEditor />} />
        <Route path="/admin/articles/:id/edit" element={<ArticleEditor />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
