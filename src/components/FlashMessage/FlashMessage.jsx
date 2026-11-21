import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./FlashMessage.css";

const FlashMessageContext = createContext(null);
const FLASH_DURATION_MS = 3500;

export function FlashMessageProvider({ children }) {
  const [message, setMessage] = useState(null);
  const messageId = useRef(0);
  const showFlashMessage = useCallback(text => setMessage({ text, id: ++messageId.current }), []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return <FlashMessageContext.Provider value={showFlashMessage}>
    {children}
    {message && createPortal(
      <div className="flash-message-position">
        <div className="flash-message" style={{ "--flash-duration": `${FLASH_DURATION_MS}ms` }} role="status" aria-live="polite" aria-atomic="true">
          <span className="flash-message__icon" aria-hidden="true">✓</span>
          <p>{message.text}</p>
          <button type="button" className="flash-message__close" aria-label="Fechar mensagem" onClick={() => setMessage(null)}>×</button>
          <span key={message.id} className="flash-message__progress" aria-hidden="true" />
        </div>
      </div>, document.body,
    )}
  </FlashMessageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFlashMessage() {
  const showFlashMessage = useContext(FlashMessageContext);
  if (!showFlashMessage) throw new Error("UseFlashMessage precisa de um FlashMessageProvider.");
  return showFlashMessage;
}
