import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./SupportChat.css";

const welcome = { id: 0, role: "assistant", text: "Olá! Sou o assistente da plataforma. Como posso te ajudar? Escolha uma dúvida abaixo ou escreva sua mensagem." };
const suggestions = [
  { question: "Como participar de uma vaga?", answer: "Abra Oportunidades, escolha uma vaga e acesse seus detalhes. Entre na sua conta e clique em Inscrever-se na vaga. Se a vaga exigir aprovação, acompanhe o pedido em Minhas solicitações." },
  { question: "Como entrar em uma entidade?", answer: "Acesse Organizações, encontre uma entidade cadastrada e clique em Visualizar informações. Entre na sua conta e selecione Solicitar entrada. Os administradores vão analisar o pedido. Você só pode participar de uma entidade por vez." },
  { question: "Onde vejo meus pedidos?", answer: "Abra o menu da sua conta e escolha Minhas solicitações. Você pode filtrar os pedidos por tipo e status e acessar a entidade ou a vaga relacionada." },
];

function ChatIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" /><path d="M7 11h.01M11 11h.01M15 11h.01" strokeWidth="3" /></svg>;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([welcome]);
  const nextId = useRef(1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const minimize = () => { setOpen(false); triggerRef.current?.focus({ preventScroll: true }); };
  const send = value => {
    const text = value.trim();
    if (!text) return;
    const answer = suggestions.find(item => item.question.toLocaleLowerCase("pt-BR") === text.toLocaleLowerCase("pt-BR"))?.answer
      ?? "Esta é uma prévia do chat, ainda sem conexão com o Gemini. As mensagens ficam apenas nesta conversa local. Por enquanto, posso mostrar as orientações das perguntas sugeridas.";
    setMessages(current => [...current, { id: nextId.current++, role: "user", text }, { id: nextId.current++, role: "assistant", text: answer }]);
    setDraft("");
    inputRef.current?.focus({ preventScroll: true });
  };

  return createPortal(<div className="support-chat">
    {open && <section id="support-chat-panel" className="support-chat__panel" role="dialog" aria-labelledby="support-chat-title" aria-describedby="support-chat-preview" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); minimize(); } }}>
      <header className="support-chat__header">
        <span className="support-chat__avatar"><ChatIcon /></span>
        <div className="support-chat__heading"><h2 id="support-chat-title">Assistente da plataforma</h2><p>Uma ajuda para usar o sistema</p></div>
        <button type="button" className="support-chat__header-button" aria-label="Minimizar chat" title="Minimizar chat" onClick={minimize}><span aria-hidden="true">−</span></button>
      </header>
      <p id="support-chat-preview" className="support-chat__preview"><span aria-hidden="true" />Prévia interativa · Gemini ainda não conectado</p>
      <div className="support-chat__messages" ref={listRef}>
        <div role="log" aria-label="Conversa com o assistente" aria-live="polite" aria-relevant="additions">
          {messages.map(message => <div key={message.id} className={`support-chat__message support-chat__message--${message.role}`}><span className="support-chat__author">{message.role === "user" ? "Você" : "Assistente"}</span><p>{message.text}</p></div>)}
        </div>
        {messages.length === 1 && <div className="support-chat__suggestions"><p>Você pode começar por aqui</p>{suggestions.map(item => <button type="button" key={item.question} onClick={() => send(item.question)}>{item.question}<span aria-hidden="true">↗</span></button>)}</div>}
      </div>
      <form className="support-chat__composer" onSubmit={event => { event.preventDefault(); send(draft); }}>
        <label className="support-chat__sr-only" htmlFor="support-chat-message">Sua mensagem</label>
        <div className="support-chat__input-row"><textarea ref={inputRef} id="support-chat-message" rows={2} maxLength={500} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Pergunte sobre a plataforma..." onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); } }} />
          <button className="support-chat__send" type="submit" disabled={!draft.trim()} aria-label="Enviar mensagem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Z" /><path d="M7 12h14" /></svg></button>
        </div>
        <div className="support-chat__footer"><span>Enter envia · Shift + Enter pula linha</span><button type="button" disabled={messages.length === 1 && !draft} onClick={() => { setMessages([welcome]); setDraft(""); inputRef.current?.focus({ preventScroll: true }); }}>Nova conversa</button></div>
      </form>
    </section>}
    <button ref={triggerRef} type="button" className="support-chat__trigger" aria-label={open ? "Minimizar assistente da plataforma" : "Abrir assistente da plataforma"} aria-expanded={open} aria-controls={open ? "support-chat-panel" : undefined} onClick={() => open ? minimize() : setOpen(true)}>
      {open ? <span className="support-chat__close-icon" aria-hidden="true">×</span> : <ChatIcon />}
    </button>
  </div>, document.body);
}
