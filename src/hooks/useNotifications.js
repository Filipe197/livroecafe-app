import { useEffect, useState } from "react";

export function useNotifications(userId) {
  const [permission, setPermission] = useState(Notification.permission);
  const [supported] = useState("Notification" in window && "serviceWorker" in navigator);

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }

  function notify(title, body, icon = "/logo192.png") {
    if (permission !== "granted") return;
    try {
      new Notification(title, { body, icon, badge: "/logo192.png" });
    } catch (e) {
      console.warn("Notification failed:", e);
    }
  }

  function notifyNewBook(bookTitle) {
    notify("📚 Novo livro disponível!", `"${bookTitle}" acabou de ser adicionado ao catálogo.`);
  }

  function notifyContinueReading(bookTitle) {
    notify("📖 Continue lendo", `Que tal continuar "${bookTitle}"?`);
  }

  function notifyStreak(days) {
    notify("🔥 Streak mantido!", `Você leu por ${days} dias seguidos. Continue assim!`);
  }

  function notifyClubMessage(clubName, senderName) {
    notify(`💬 ${clubName}`, `${senderName} enviou uma mensagem no clube.`);
  }

  return {
    permission,
    supported,
    requestPermission,
    notify,
    notifyNewBook,
    notifyContinueReading,
    notifyStreak,
    notifyClubMessage,
  };
}
