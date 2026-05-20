import { useState, useRef, useEffect } from "react";

const THEMES = [
  { id: "dark", label: "Escuro", bg: "#0f0e0c", text: "#f0ece4", accent: "#e8c97a", card: "#1a1815" },
  { id: "sepia", label: "Sépia", bg: "#f4ede0", text: "#2c1f0e", accent: "#c0834e", card: "#ede5d4" },
  { id: "night", label: "Noturno", bg: "#0a0a1a", text: "#c8d0e8", accent: "#7e9ec8", card: "#12121e" },
  { id: "forest", label: "Floresta", bg: "#0e1a12", text: "#d4ead8", accent: "#7ec87e", card: "#141e16" },
  { id: "rose", label: "Rosa", bg: "#1a0e12", text: "#f0dce4", accent: "#e87aaa", card: "#1e1215" },
];

const FONTS = [
  { id: "serif", label: "Serif", family: "'Georgia', serif" },
  { id: "sans", label: "Sans", family: "'DM Sans', sans-serif" },
  { id: "display", label: "Display", family: "'Playfair Display', serif" },
];

export default function ShareQuote({ quote, bookTitle, author, onClose }) {
  const [theme, setTheme] = useState(THEMES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const displayQuote = quote || "A leitura é uma conversa silenciosa com os pensamentos de outra pessoa.";
  const displayBook = bookTitle || "Livro & Café";
  const displayAuthor = author || "@livroecafe.com.br";

  useEffect(() => {
    drawCanvas();
  }, [theme, font, displayQuote]);

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 800, H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Card
    ctx.fillStyle = theme.card;
    roundRect(ctx, 60, 60, W - 120, H - 120, 24);
    ctx.fill();

    // Accent line
    ctx.fillStyle = theme.accent;
    ctx.fillRect(80, 100, 4, 60);

    // Quote marks
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 80px ${font.family}`;
    ctx.globalAlpha = 0.15;
    ctx.fillText('"', 90, 200);
    ctx.globalAlpha = 1;

    // Quote text
    ctx.fillStyle = theme.text;
    ctx.font = `italic 28px ${font.family}`;
    wrapText(ctx, displayQuote, 100, 230, W - 200, 42);

    // Book title
    ctx.fillStyle = theme.accent;
    ctx.font = `600 18px ${font.family}`;
    ctx.fillText(`— ${displayBook}`, 100, H - 160);

    // Author
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.5;
    ctx.font = `14px ${font.family}`;
    ctx.fillText(displayAuthor, 100, H - 130);
    ctx.globalAlpha = 1;

    // Logo
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 16px Georgia, serif`;
    ctx.fillText("📚 Livro & Café", W - 220, H - 100);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (let w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line !== "") {
        ctx.fillText(line, x, currentY);
        line = w + " ";
        currentY += lineH;
        if (currentY > 580) { ctx.fillText("...", x, currentY); break; }
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "citacao-livroecafe.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare({ files: [new File([blob], "citacao.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "citacao-livroecafe.png", { type: "image/png" })],
          title: "Citação do Livro & Café",
        });
      } else {
        handleDownload();
      }
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", overflowY: "auto", padding: "20px 16px 40px" }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 440, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: "#f0ece4", fontWeight: 600, fontSize: 16 }}>Compartilhar Citação</span>
        <button onClick={onClose} style={{ background: "#1e1c18", border: "none", color: "#f0ece4", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
      </div>

      {/* Preview */}
      <div style={{ width: "100%", maxWidth: 440, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {/* Theme selector */}
      <div style={{ width: "100%", maxWidth: 440, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#6b6860", marginBottom: 8 }}>TEMA</div>
        <div style={{ display: "flex", gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: theme.id === t.id ? "2px solid #e8c97a" : "2px solid transparent",
                background: t.bg, cursor: "pointer", flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Font selector */}
      <div style={{ width: "100%", maxWidth: 440, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#6b6860", marginBottom: 8 }}>FONTE</div>
        <div style={{ display: "flex", gap: 8 }}>
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f)}
              style={{
                flex: 1, padding: "8px", borderRadius: 10,
                background: font.id === f.id ? "#e8c97a" : "#1e1c18",
                color: font.id === f.id ? "#0f0e0c" : "#a09c94",
                border: "none", cursor: "pointer", fontFamily: f.family, fontSize: 13
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: "100%", maxWidth: 440, display: "flex", gap: 10 }}>
        <button
          onClick={handleDownload}
          style={{ flex: 1, padding: "14px", background: "#1e1c18", border: "1px solid #2e2c28", borderRadius: 12, color: "#f0ece4", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          ⬇ Baixar
        </button>
        <button
          onClick={handleShare}
          style={{ flex: 2, padding: "14px", background: "#e8c97a", border: "none", borderRadius: 12, color: "#0f0e0c", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          🔗 Compartilhar
        </button>
      </div>
    </div>
  );
}
