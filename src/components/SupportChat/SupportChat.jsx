import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  advanceWordBoundary,
  isNavigableRoute,
  parseInlineSegments,
  parseMessageBlocks,
  sanitizeStreamingText,
  tokenizeInlineSegments,
} from "./supportChatFormatting";
import "./SupportChat.css";

const welcome = {
  id: 0,
  role: "assistant",
  text: "Olá! Sou o assistente da plataforma Voluntários em Ação. Como posso te ajudar? Escolha uma dúvida abaixo ou escreva sua mensagem.",
};

const LOGIN_REQUIRED_MESSAGE =
  "Você precisa fazer login para mandar mensagem ao assistente.";

const PANEL_CLOSE_DURATION_MS = 220;

const suggestions = [
  "Como participar de uma vaga?",
  "Como entrar em uma entidade?",
  "Onde vejo meus pedidos?",
];

function hasAccessToken() {
  return Boolean(localStorage.getItem("access_token"));
}

function getAssistantErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  return "Não foi possível obter resposta do assistente agora. Verifique sua conexão e tente novamente.";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function renderSegment(segment, key, onNavigateRoute, extraClass = "") {
  const className = extraClass || undefined;

  if (segment.type === "bold") {
    return (
      <strong key={key} className={className}>
        {segment.text}
      </strong>
    );
  }

  if (segment.type === "route") {
    if (segment.navigable && onNavigateRoute) {
      return (
        <button
          key={key}
          type="button"
          className={`support-chat__chip support-chat__chip--link${
            extraClass ? ` ${extraClass}` : ""
          }`}
          onClick={() => onNavigateRoute(segment.route)}
          title={`Abrir ${segment.label} (${segment.route})`}
        >
          <span>{segment.label}</span>
          <span className="support-chat__chip-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      );
    }

    return (
      <code
        key={key}
        className={`support-chat__chip support-chat__chip--code${
          extraClass ? ` ${extraClass}` : ""
        }`}
      >
        {segment.label || segment.route}
      </code>
    );
  }

  if (segment.type === "code") {
    return (
      <code
        key={key}
        className={`support-chat__chip support-chat__chip--code${
          extraClass ? ` ${extraClass}` : ""
        }`}
      >
        {segment.text}
      </code>
    );
  }

  if (extraClass) {
    return (
      <span key={key} className={extraClass}>
        {segment.text}
      </span>
    );
  }

  return <Fragment key={key}>{segment.text}</Fragment>;
}

function renderRichBlocks(text, onNavigateRoute, animateWords = false) {
  const blocks = parseMessageBlocks(text);
  const wordClass = animateWords ? "support-chat__word" : "";

  const renderInlineContent = (lineText, keyPrefix) => {
    const segments = parseInlineSegments(lineText);
    if (!animateWords) {
      return segments.map((seg, idx) =>
        renderSegment(seg, `${keyPrefix}-s-${idx}`, onNavigateRoute),
      );
    }
    const tokens = tokenizeInlineSegments(segments);
    return tokens.map((tok, idx) =>
      renderSegment(
        tok,
        `${keyPrefix}-w-${idx}`,
        onNavigateRoute,
        /\S/.test(tok.text ?? tok.label ?? "") ? wordClass : "",
      ),
    );
  };

  return (
    <div className="support-chat__rich-content">
      {blocks.map((block, bIdx) => {
        if (block.type === "ul") {
          return (
            <ul key={`b-${bIdx}`} className="support-chat__list">
              {block.items.map((item, iIdx) => (
                <li key={`b-${bIdx}-li-${iIdx}`}>
                  {renderInlineContent(item, `b-${bIdx}-li-${iIdx}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol
              key={`b-${bIdx}`}
              className="support-chat__list support-chat__list--ordered"
            >
              {block.items.map((item, iIdx) => (
                <li key={`b-${bIdx}-ol-${iIdx}`}>
                  {renderInlineContent(item, `b-${bIdx}-ol-${iIdx}`)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`b-${bIdx}`}>
            {renderInlineContent(block.text, `b-${bIdx}-p`)}
          </p>
        );
      })}
    </div>
  );
}

function getWordRevealDelay(revealedSlice, totalChars) {
  const approxWords = Math.ceil(totalChars / 6);
  const baseMs = approxWords > 100 ? 48 : approxWords > 50 ? 58 : 68;
  const trimmed = revealedSlice.trimEnd();
  if (revealedSlice.includes("\n")) return baseMs + 120;
  if (/[.!?]$/.test(trimmed)) return baseMs + 110;
  if (/[,;:]$/.test(trimmed)) return baseMs + 45;
  return baseMs;
}

function StreamedAssistantMessage({
  text,
  isStreaming,
  animate,
  onProgress,
  onComplete,
  onNavigateRoute,
}) {
  const reducedMotion = prefersReducedMotion();
  const shouldSmooth = (isStreaming || animate) && !reducedMotion;

  const [displayedLength, setDisplayedLength] = useState(() =>
    shouldSmooth ? 0 : text.length,
  );

  const textRef = useRef(text);
  const isStreamingRef = useRef(isStreaming);
  const displayedLengthRef = useRef(displayedLength);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    textRef.current = text;
    isStreamingRef.current = isStreaming;
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
  }, [text, isStreaming, onProgress, onComplete]);

  useEffect(() => {
    displayedLengthRef.current = displayedLength;
  }, [displayedLength]);

  useEffect(() => {
    if (!shouldSmooth) {
      onCompleteRef.current?.();
      return;
    }

    let rafId = null;
    let doneTimer = null;
    let nextTickAt = performance.now();

    const step = (now) => {
      const fullText = textRef.current;
      const currentLen = displayedLengthRef.current;
      const streamingActive = isStreamingRef.current;

      if (currentLen < fullText.length) {
        if (doneTimer !== null) {
          window.clearTimeout(doneTimer);
          doneTimer = null;
        }
        if (now >= nextTickAt) {
          const nextLen = advanceWordBoundary(fullText, currentLen, 1);
          const sliceRevealed = fullText.slice(currentLen, nextLen);
          const delayMs = getWordRevealDelay(sliceRevealed, fullText.length);

          displayedLengthRef.current = nextLen;
          setDisplayedLength(nextLen);
          onProgressRef.current?.();
          nextTickAt = now + delayMs;
        }
        rafId = window.requestAnimationFrame(step);
        return;
      }

      if (streamingActive) {
        rafId = window.requestAnimationFrame(step);
        return;
      }

      if (doneTimer === null) {
        doneTimer = window.setTimeout(() => {
          onCompleteRef.current?.();
        }, 620);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (doneTimer !== null) {
        window.clearTimeout(doneTimer);
      }
    };
  }, [shouldSmooth]);

  const visibleRaw = shouldSmooth ? text.slice(0, displayedLength) : text;
  const sanitizedVisible = useMemo(
    () =>
      sanitizeStreamingText(
        visibleRaw,
        isStreaming || (shouldSmooth && displayedLength < text.length),
      ),
    [visibleRaw, isStreaming, shouldSmooth, displayedLength, text.length],
  );

  if (!shouldSmooth) {
    return renderRichBlocks(text, onNavigateRoute, false);
  }

  return (
    <div>
      <span className="support-chat__sr-only">{text}</span>
      <div aria-hidden="true">
        {renderRichBlocks(sanitizedVisible, onNavigateRoute, true)}
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" />
      <path d="M7 11h.01M11 11h.01M15 11h.01" strokeWidth="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function SparkleIcon({ isTool }) {
  if (isTool) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" />
    </svg>
  );
}

export default function SupportChat() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([welcome]);
  const [interactionId, setInteractionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [streamStatus, setStreamStatus] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [, setAuthVersion] = useState(0);

  const nextId = useRef(1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef(null);
  const followConversationRef = useRef(true);
  const closeTimerRef = useRef(null);

  const isLoggedIn = hasAccessToken();

  useEffect(() => {
    const syncAuth = () => {
      if (!hasAccessToken()) {
        setInteractionId(null);
      }
      setAuthVersion((version) => version + 1);
    };

    window.addEventListener("session-expired", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("session-expired", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (open && isLoggedIn && !isSending) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [open, isLoggedIn, isSending]);

  const scrollToBottom = useCallback((onlyIfNearBottom = false, smooth = false) => {
    const container = listRef.current;
    if (!container) return;
    if (onlyIfNearBottom && !followConversationRef.current) return;

    if (smooth && !prefersReducedMotion()) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTop = container.scrollHeight;
    }
    setShowScrollDown(false);
  }, []);

  const markAnimationComplete = useCallback((messageId) => {
    setMessages((current) =>
      current.map((item) =>
        item.id === messageId && item.animate
          ? { ...item, animate: false }
          : item,
      ),
    );
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom(true);
    }
  }, [messages, open, isSending, streamStatus, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const openPanel = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPanelVisible(true);
    followConversationRef.current = true;
    setShowScrollDown(false);
    setOpen(true);
  };

  const minimize = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMessages((current) =>
      current.some((item) => item.animate && !item.isStreaming)
        ? current.map((item) =>
            item.animate && !item.isStreaming ? { ...item, animate: false } : item,
          )
        : current,
    );
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });

    if (prefersReducedMotion()) {
      setPanelVisible(false);
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setPanelVisible(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_DURATION_MS);
  };

  const goToLogin = () => {
    minimize();
    navigate("/login", { state: { redirectTo: location.pathname } });
  };

  const navigateToRoute = useCallback(
    (route) => {
      if (!isNavigableRoute(route)) return;
      navigate(route);
    },
    [navigate],
  );

  const stopGenerating = () => {
    abortControllerRef.current?.abort();
  };

  const resetConversation = () => {
    if (isSending) return;
    setMessages([welcome]);
    followConversationRef.current = true;
    setShowScrollDown(false);
    setInteractionId(null);
    setStreamStatus(null);
    setDraft("");
    if (isLoggedIn) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const send = async (value) => {
    const text = value.trim();
    if (!text || inFlightRef.current) return;

    if (!hasAccessToken()) {
      setInteractionId(null);
      setAuthVersion((version) => version + 1);
      setMessages((current) => {
        const last = current[current.length - 1];
        if (last?.role === "assistant" && last?.isAuthBlock) {
          return current;
        }
        return [
          ...current,
          {
            id: nextId.current++,
            role: "assistant",
            text: LOGIN_REQUIRED_MESSAGE,
            isError: true,
            isAuthBlock: true,
          },
        ];
      });
      return;
    }

    const activeInteractionId = interactionId;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    followConversationRef.current = true;
    setShowScrollDown(false);
    inFlightRef.current = true;
    setIsSending(true);
    setStreamStatus({ phase: "thinking", label: "Pensando..." });
    setDraft("");

    const userMsgId = nextId.current++;
    const assistantMsgId = nextId.current++;
    let accumulatedText = "";
    let assistantBubbleCreated = false;
    let streamHadError = false;

    setMessages((current) => [
      ...current,
      { id: userMsgId, role: "user", text },
    ]);

    const ensureAssistantBubble = (nextText, streamingFlag = true) => {
      if (!assistantBubbleCreated) {
        assistantBubbleCreated = true;
        setMessages((current) => [
          ...current,
          {
            id: assistantMsgId,
            role: "assistant",
            text: nextText,
            isStreaming: streamingFlag,
            animate: true,
          },
        ]);
      } else {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMsgId
              ? { ...item, text: nextText, isStreaming: streamingFlag }
              : item,
          ),
        );
      }
    };

    try {
      await api.streamPost(
        "/assistant/messages/stream",
        {
          message: text,
          previous_interaction_id: activeInteractionId,
          current_path: location.pathname,
        },
        {
          useAuth: true,
          signal: controller.signal,
          onEvent: ({ event, data }) => {
            if (event === "status" && data && typeof data === "object") {
              setStreamStatus({
                phase: data.phase || "thinking",
                label: data.label || "Pensando...",
              });
              return;
            }

            if (event === "delta" && data && typeof data.text === "string") {
              accumulatedText += data.text;
              setStreamStatus(null);
              ensureAssistantBubble(accumulatedText, true);
              return;
            }

            if (event === "done" && data && typeof data === "object") {
              if (data.interaction_id) {
                setInteractionId(data.interaction_id);
              }
              const finalReply =
                accumulatedText.trim() ||
                data.reply ||
                "Não consegui gerar uma resposta agora. Tente novamente.";
              accumulatedText = finalReply;
              setStreamStatus(null);
              ensureAssistantBubble(finalReply, false);
              return;
            }

            if (event === "error" && data && typeof data === "object") {
              streamHadError = true;
              setStreamStatus(null);
              const detail =
                typeof data.detail === "string" && data.detail.trim()
                  ? data.detail
                  : "Não foi possível obter resposta do assistente agora. Tente novamente.";

              if (assistantBubbleCreated && accumulatedText.trim()) {
                ensureAssistantBubble(accumulatedText, false);
              }
              setMessages((current) => [
                ...current,
                {
                  id: nextId.current++,
                  role: "assistant",
                  text: detail,
                  isError: true,
                },
              ]);
            }
          },
        },
      );

      if (!streamHadError && assistantBubbleCreated) {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMsgId && item.isStreaming
              ? { ...item, isStreaming: false }
              : item,
          ),
        );
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setStreamStatus(null);
        if (assistantBubbleCreated && accumulatedText.trim()) {
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMsgId
                ? { ...item, isStreaming: false, animate: false }
                : item,
            ),
          );
        }
        return;
      }

      const isUnauthorized = error?.response?.status === 401;
      if (isUnauthorized) {
        setInteractionId(null);
        setAuthVersion((version) => version + 1);
      }

      setStreamStatus(null);
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: isUnauthorized
            ? LOGIN_REQUIRED_MESSAGE
            : getAssistantErrorMessage(error),
          isError: true,
          isAuthBlock: isUnauthorized,
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      inFlightRef.current = false;
      setIsSending(false);
      setStreamStatus(null);
      if (hasAccessToken()) {
        setTimeout(() => {
          inputRef.current?.focus({ preventScroll: true });
        }, 0);
      }
    }
  };

  return createPortal(
    <div className="support-chat">
      {panelVisible && (
        <section
          id="support-chat-panel"
          className={`support-chat__panel ${
            open ? "support-chat__panel--open" : "support-chat__panel--closing"
          }`}
          role="dialog"
          aria-hidden={!open}
          inert={!open}
          aria-labelledby="support-chat-title"
          aria-describedby="support-chat-status"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              minimize();
            }
          }}
        >
          <header className="support-chat__header">
            <span className="support-chat__avatar">
              <ChatIcon />
            </span>
            <div className="support-chat__heading">
              <h2 id="support-chat-title">Assistente da plataforma</h2>
              <p>Uma ajuda rápida para usar o sistema</p>
            </div>
            <button
              type="button"
              className="support-chat__header-button"
              aria-label="Minimizar chat"
              title="Minimizar chat"
              onClick={minimize}
            >
              <span aria-hidden="true">−</span>
            </button>
          </header>

          <p
            id="support-chat-status"
            className={`support-chat__preview ${
              isLoggedIn
                ? "support-chat__preview--online"
                : "support-chat__preview--locked"
            }`}
          >
            <span aria-hidden="true" />
            {isLoggedIn
              ? "Assistente conectado · Respostas em tempo real"
              : "Acesso restrito · Faça login para conversar"}
          </p>

          <div
            className="support-chat__messages"
            ref={listRef}
            onScroll={(event) => {
              const list = event.currentTarget;
              const distance =
                list.scrollHeight - list.scrollTop - list.clientHeight;
              const isNearBottom = distance < 96;
              followConversationRef.current = isNearBottom;
              setShowScrollDown(!isNearBottom && messages.length > 1);
            }}
          >
            <div
              role="log"
              aria-label="Conversa com o assistente"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`support-chat__message support-chat__message--${message.role}${
                    message.isError ? " support-chat__message--error" : ""
                  }`}
                >
                  <span className="support-chat__author">
                    {message.role === "user" ? "Você" : "Assistente"}
                  </span>
                  {message.role === "assistant" &&
                  (message.isStreaming || message.animate) ? (
                    <StreamedAssistantMessage
                      text={message.text}
                      isStreaming={Boolean(message.isStreaming)}
                      animate={Boolean(message.animate)}
                      onProgress={() => scrollToBottom(true)}
                      onComplete={() => markAnimationComplete(message.id)}
                      onNavigateRoute={navigateToRoute}
                    />
                  ) : message.role === "assistant" ? (
                    renderRichBlocks(message.text, navigateToRoute, false)
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              ))}

              {isSending && streamStatus && (
                <div
                  className="support-chat__message support-chat__message--assistant support-chat__message--typing"
                  aria-label={streamStatus.label}
                >
                  <span className="support-chat__author">Assistente</span>
                  <div className="support-chat__status-row">
                    <span
                      className={`support-chat__status-icon${
                        streamStatus.phase === "tool"
                          ? " support-chat__status-icon--tool"
                          : ""
                      }`}
                      aria-hidden="true"
                    >
                      <SparkleIcon isTool={streamStatus.phase === "tool"} />
                    </span>
                    <span
                      key={streamStatus.label}
                      className="support-chat__status-label"
                    >
                      {streamStatus.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && !isSending && (
              <div className="support-chat__suggestions">
                <p>Você pode começar por aqui</p>
                {suggestions.map((question, index) => (
                  <button
                    type="button"
                    key={question}
                    style={{ "--stagger-index": index }}
                    disabled={isSending}
                    onClick={() => send(question)}
                  >
                    <span>{question}</span>
                    <span
                      className="support-chat__suggestion-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {showScrollDown && (
            <button
              type="button"
              className="support-chat__scroll-bottom"
              onClick={() => {
                followConversationRef.current = true;
                scrollToBottom(false, true);
              }}
              aria-label="Ir para o final da conversa"
            >
              <span aria-hidden="true">↓</span> Ir para o final
            </button>
          )}

          <form
            className="support-chat__composer"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            {!isLoggedIn && (
              <div className="support-chat__auth-notice" role="alert">
                <p>{LOGIN_REQUIRED_MESSAGE}</p>
                <button
                  type="button"
                  className="support-chat__login-btn"
                  onClick={goToLogin}
                >
                  Fazer login
                </button>
              </div>
            )}

            <label className="support-chat__sr-only" htmlFor="support-chat-message">
              Sua mensagem
            </label>
            <div
              className={`support-chat__input-row${
                !isLoggedIn ? " support-chat__input-row--locked" : ""
              }`}
            >
              <textarea
                ref={inputRef}
                id="support-chat-message"
                rows={2}
                maxLength={500}
                value={draft}
                disabled={!isLoggedIn || isSending}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  isLoggedIn
                    ? "Pergunte sobre a plataforma..."
                    : "Faça login para mandar mensagem ao assistente..."
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    send(draft);
                  }
                }}
              />
              {isSending ? (
                <button
                  className="support-chat__stop"
                  type="button"
                  onClick={stopGenerating}
                  aria-label="Parar resposta"
                  title="Parar resposta"
                >
                  <span className="support-chat__stop-square" aria-hidden="true" />
                </button>
              ) : (
                <button
                  className="support-chat__send"
                  type="submit"
                  disabled={!isLoggedIn || !draft.trim()}
                  aria-label="Enviar mensagem"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m4 4 17 8-17 8 3-8-3-8Z" />
                    <path d="M7 12h14" />
                  </svg>
                </button>
              )}
            </div>

            <div className="support-chat__footer">
              <span>
                {isLoggedIn
                  ? "Enter envia · Shift + Enter pula linha"
                  : "Chat disponível apenas para usuários logados"}
              </span>
              <button
                type="button"
                disabled={isSending || (messages.length === 1 && !draft)}
                onClick={resetConversation}
              >
                Nova conversa
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={`support-chat__trigger${
          open ? " support-chat__trigger--open" : ""
        }`}
        aria-label={
          open
            ? "Minimizar assistente da plataforma"
            : "Abrir assistente da plataforma"
        }
        aria-expanded={open}
        aria-controls={panelVisible ? "support-chat-panel" : undefined}
        onClick={() => (open ? minimize() : openPanel())}
      >
        <span
          key={open ? "close" : "open"}
          className="support-chat__trigger-icon"
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </span>
      </button>
    </div>,
    document.body,
  );
}
