import "server-only"

const AUTO_REPLIES: Record<string, string> = {
  en: "Please wait for an operator to connect, or send your question to info@3deureka.com.",
  nl: "Wacht tot een medewerker verbinding maakt, of stuur uw vraag naar info@3deureka.com.",
  de: "Bitte warten Sie, bis ein Mitarbeiter verbunden ist, oder senden Sie Ihre Frage an info@3deureka.com.",
  fr: "Veuillez patienter le temps qu'un opérateur se connecte, ou envoyez votre question à info@3deureka.com.",
  it: "Attenda il collegamento di un operatore, oppure invii la sua domanda a info@3deureka.com.",
  es: "Espere a que se conecte un operador, o envíe su pregunta a info@3deureka.com.",
}

/** Fixed live-chat reply while no operator is connected. */
export function liveChatAutoReply(locale: string): string {
  return AUTO_REPLIES[locale] ?? AUTO_REPLIES.en
}
