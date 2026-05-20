import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Pages
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import BookDetail from "./pages/BookDetail";
import Read from "./pages/Read";
import Profile from "./pages/Profile";
import MyList from "./pages/MyList";
import Clubs from "./pages/Clubs";
import Ranking from "./pages/Ranking";
import Catalog from "./pages/Catalog";
import Search from "./pages/Search";
import ShareQuote from "./pages/ShareQuote";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [page, setPage] = useState("splash");
  const [user, setUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [readBook, setReadBook] = useState(null);
  const [shareQuoteData, setShareQuoteData] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function navigate(to, from) {
    setPrevPage(from || page);
    setPage(to);
  }

  function handleBookSelect(book) {
    setSelectedBook(book);
    navigate("bookdetail");
  }

  function handleReadBook(book) {
    setReadBook(book);
    navigate("read");
  }

  function handleShareQuote(quote, bookTitle, author) {
    setShareQuoteData({ quote, bookTitle, author });
  }

  // Bottom nav pages
  const navPages = ["home", "explore", "mylist", "clubs", "profile"];
  const navItems = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "explore", icon: "🔭", label: "Explorar" },
    { id: "mylist", icon: "📚", label: "Minha Lista" },
    { id: "clubs", icon: "👥", label: "Clubes" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  const showNav = navPages.includes(page);

  // Common props passed to all pages
  const commonProps = {
    user,
    supabase,
    onNavigate: navigate,
    onBookSelect: handleBookSelect,
    onReadBook: handleReadBook,
    onShareQuote: handleShareQuote,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", position: "relative", background: "#0f0e0c" }}>
      {/* Share Quote Overlay */}
      {shareQuoteData && (
        <ShareQuote
          quote={shareQuoteData.quote}
          bookTitle={shareQuoteData.bookTitle}
          author={shareQuoteData.author}
          onClose={() => setShareQuoteData(null)}
        />
      )}

      {/* Pages */}
      {page === "splash" && (
        <Splash onDone={() => {
          const seen = localStorage.getItem("lc_onboarding_done");
          navigate(seen ? "auth" : "onboarding");
        }} />
      )}

      {page === "onboarding" && (
        <Onboarding onDone={() => {
          localStorage.setItem("lc_onboarding_done", "1");
          navigate("auth");
        }} />
      )}

      {page === "auth" && (
        <Auth supabase={supabase} onAuth={(u) => { setUser(u); navigate("home"); }} />
      )}

      {page === "home" && (
        <Home {...commonProps} onSearchOpen={() => navigate("search", "home")} />
      )}

      {page === "explore" && (
        <Explore {...commonProps} />
      )}

      {page === "mylist" && (
        <MyList {...commonProps} />
      )}

      {page === "clubs" && (
        <Clubs {...commonProps} />
      )}

      {page === "profile" && (
        <Profile {...commonProps} onLogout={() => { supabase.auth.signOut(); navigate("auth"); }} />
      )}

      {page === "ranking" && (
        <Ranking {...commonProps} onBack={() => navigate(prevPage || "home")} />
      )}

      {page === "catalog" && (
        <Catalog {...commonProps} onBack={() => navigate(prevPage || "home")} />
      )}

      {page === "search" && (
        <Search
          {...commonProps}
          onBack={() => navigate(prevPage || "home")}
        />
      )}

      {page === "bookdetail" && selectedBook && (
        <BookDetail
          {...commonProps}
          book={selectedBook}
          onBack={() => navigate(prevPage || "explore")}
        />
      )}

      {page === "read" && readBook && (
        <Read
          {...commonProps}
          book={readBook}
          onBack={() => navigate(prevPage || "bookdetail")}
        />
      )}

      {/* Bottom Navigation */}
      {showNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, background: "rgba(15,14,12,0.95)",
          backdropFilter: "blur(12px)", borderTop: "1px solid #2a2820",
          display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)"
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                flex: 1, padding: "10px 4px 8px", background: "none", border: "none",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2
              }}
            >
              <span style={{ fontSize: page === item.id ? 22 : 20, filter: page === item.id ? "none" : "grayscale(1) opacity(0.5)" }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: page === item.id ? "#e8c97a" : "#6b6860", fontFamily: "DM Sans, sans-serif" }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
