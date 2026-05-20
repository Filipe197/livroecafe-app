import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [genres, setGenres] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    fetchGenres();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length > 1) doSearch();
      else if (query.trim().length === 0) setResults([]);
    }, 350);
    return () => clearTimeout(t);
  }, [query, filter]);

  async function fetchGenres() {
    const { data } = await supabase.from("books").select("genre").not("genre", "is", null);
    if (data) {
      const unique = [...new Set(data.map((b) => b.genre).filter(Boolean))];
      setGenres(unique);
    }
  }

  async function doSearch() {
    setLoading(true);
    let q = supabase
      .from("books")
      .select("id,title,author,cover_url,genre,formats")
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      
      .limit(30);

    if (filter !== "all" && filter !== "epub" && filter !== "pdf") {
      q = q.eq("genre", filter);
    }

    const { data } = await q;
    let filtered = data || [];

    if (filter === "epub") filtered = filtered.filter(b => b.formats?.epub && b.formats.epub.length > 4);
    if (filter === "pdf") filtered = filtered.filter(b => b.formats?.pdf && b.formats.pdf.length > 4);

    setResults(filtered);
    setLoading(false);
  }

  const filters = [
    { id: "all", label: "Todos" },
    { id: "epub", label: "EPUB" },
    { id: "pdf", label: "PDF" },
    ...genres.slice(0, 6).map((g) => ({ id: g, label: g })),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #0f0e0c)", color: "var(--text, #f0ece4)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "var(--gold, #e8c97a)", fontSize: 22, cursor: "pointer", padding: 4 }}
        >←</button>
        <div style={{
          flex: 1, background: "var(--surface, #1e1c18)",
          border: "0.5px solid var(--border, #2e2c28)",
          borderRadius: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px"
        }}>
          <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou autor..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text, #f0ece4)", fontSize: 15, fontFamily: "inherit"
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--dim, #6b6860)", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? "var(--gold, #e8c97a)" : "var(--surface, #1e1c18)",
              color: filter === f.id ? "#0f0e0c" : "var(--muted, #a09c94)",
              border: "0.5px solid " + (filter === f.id ? "var(--gold, #e8c97a)" : "var(--border, #2e2c28)"),
              borderRadius: 16, padding: "6px 14px", fontSize: 12, fontFamily: "inherit",
              whiteSpace: "nowrap", cursor: "pointer", fontWeight: filter === f.id ? 600 : 400
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--dim, #6b6860)" }}>Buscando...</div>
        )}

        {!loading && query.length > 1 && results.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{ color: "var(--dim, #6b6860)", fontSize: 14 }}>Nenhum resultado para "{query}"</div>
          </div>
        )}

        {!loading && query.length <= 1 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ color: "var(--dim, #6b6860)", fontSize: 14 }}>Digite para buscar livros</div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: "var(--dim, #6b6860)", marginBottom: 12 }}>
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                  style={{
                    display: "flex", gap: 12,
                    background: "var(--surface, #1a1815)",
                    borderRadius: 12, padding: 12, cursor: "pointer", alignItems: "center"
                  }}
                >
                  <img
                    src={book.cover_url || "https://placehold.co/50x70/1a1815/666?text=📖"}
                    alt={book.title}
                    style={{ width: 50, height: 70, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                    onError={e => { e.target.src = 'https://placehold.co/50x70/1a1815/e8c97a?text=📖' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted, #a09c94)", marginBottom: 6 }}>{book.author}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {book.genre && <span style={{ background: "var(--surface2, #2a2820)", color: "var(--gold, #e8c97a)", fontSize: 10, padding: "2px 8px", borderRadius: 8 }}>{book.genre}</span>}
                      {book.formats?.epub && book.formats.epub.length > 4 && <span style={{ background: "#1a2a1a", color: "#7ec87e", fontSize: 10, padding: "2px 8px", borderRadius: 8 }}>EPUB</span>}
                      {book.formats?.pdf && book.formats.pdf.length > 4 && <span style={{ background: "#1a1a2a", color: "#7e9ec8", fontSize: 10, padding: "2px 8px", borderRadius: 8 }}>PDF</span>}
                    </div>
                  </div>
                  <span style={{ color: "var(--border, #3a3830)", fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
