export const ROUTE_LABELS = {
  "/inicio": "Início",
  "/oportunidades": "Oportunidades",
  "/organizacoes": "Organizações",
  "/sobre": "Sobre nós",
  "/login": "Login",
  "/cadastro": "Cadastro",
  "/confirmacao": "Confirmação de e-mail",
  "/reenviar-confirmacao": "Reenviar confirmação",
  "/editar-perfil": "Meu perfil",
  "/convites": "Convites",
  "/minhas-solicitacoes": "Minhas solicitações",
  "/notificacoes": "Notificações",
  "/configuracoes": "Configurações",
  "/entidade/cadastro": "Cadastrar organização",
  "/entidade/editar": "Editar organização",
  "/entidade/solicitacoes": "Solicitações da organização",
  "/entidade/membros": "Membros da organização",
  "/entidade/vagas": "Gerenciar vagas",
  "/vagas": "Vagas",
  "/vagas/cadastro": "Cadastrar vaga",
};

export function isRoutePath(value) {
  return /^\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*$/i.test(value);
}

export function isNavigableRoute(route) {
  if (Object.prototype.hasOwnProperty.call(ROUTE_LABELS, route)) return true;
  if (/^\/vagas\/\d+(?:\/editar)?$/.test(route)) return true;
  if (/^\/entidade\/sobre\/[a-z0-9-]+$/i.test(route)) return true;
  return false;
}

export function humanizeSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) =>
      word.length <= 2
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export function getFriendlyRouteLabel(route) {
  if (ROUTE_LABELS[route]) return ROUTE_LABELS[route];

  const editVacancyMatch = route.match(/^\/vagas\/(\d+)\/editar$/);
  if (editVacancyMatch) return `Editar vaga #${editVacancyMatch[1]}`;

  const vacancyMatch = route.match(/^\/vagas\/(\d+)$/);
  if (vacancyMatch) return `Ver vaga #${vacancyMatch[1]}`;

  const entityMatch = route.match(/^\/entidade\/sobre\/([a-z0-9-]+)$/i);
  if (entityMatch) return humanizeSlug(entityMatch[1]);

  return route;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDuplicateTrailingLabel(segments, label) {
  if (!label || segments.length === 0) return;
  const prev = segments[segments.length - 1];
  if (prev.type !== "text") return;

  const pattern = new RegExp(
    `(?:["“”']?${escapeRegExp(label)}["“”']?)\\s*$`,
    "i",
  );
  if (pattern.test(prev.text)) {
    const updated = prev.text.replace(pattern, "");
    if (updated) {
      prev.text = updated;
    } else {
      segments.pop();
    }
  }
}

export function sanitizeStreamingText(rawText, isStreaming) {
  if (!isStreaming || !rawText) return rawText;

  let text = rawText;
  // Evita exibir sintaxe parcial de [Nome](/rota-incompleta enquanto o stream chega
  text = text.replace(/`?\[([^\]\n]+)\]\(\s*`?[^)\n]*$/, "$1");
  // Evita exibir [Nome incompleto sem fechar colchete no final do stream
  text = text.replace(/`?\[([^\]\n]{1,60})$/, "$1");
  // Oculta (/rota-incompleta no final enquanto o parêntese não fechou
  text = text.replace(/\s*\(\s*`?\/[a-z0-9:_/-]*$/i, "");
  // Fecha **negrito parcial no fim para não piscar asteriscos crus
  const boldCount = (text.match(/\*\*/g) || []).length;
  if (boldCount % 2 === 1) {
    text = text.replace(/\*\*([^*\n]+)$/, "**$1**");
    text = text.replace(/\*\*$/, "");
  }
  return text;
}

export function parseInlineSegments(rawLine) {
  const segments = [];
  const tokenRegex =
    /`?\[([^\]\n]+?)\]\(\s*`?(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)`?\s*\)`?|\*\*([^*\n]+?)\*\*\s*(?:\(\s*`?(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)`?\s*\)|`(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)`|(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)(?=$|[\s.,;:!?)]|$))|\*\*([^*\n]+?)\*\*|\(\s*`(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)`\s*\)|\(\s*(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)\s*\)|`([^`\n]+?)`|(^|[\s:;])(\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*)(?=$|[\s.,;:!?)]|$)/gi;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(rawLine)) !== null) {
    const [
      fullMatch,
      mdLabel,
      mdRoute,
      boldWithRouteLabel,
      boldParenRoute,
      boldTickRoute,
      boldBareRoute,
      boldOnlyText,
      parenBacktickRoute,
      parenBareRoute,
      inlineCode,
      barePrefix,
      bareRoute,
    ] = match;

    let matchStart = match.index;
    if (bareRoute && barePrefix) {
      matchStart += barePrefix.length;
    }

    if (matchStart > lastIndex) {
      segments.push({
        type: "text",
        text: rawLine.slice(lastIndex, matchStart),
      });
    }

    if (mdLabel !== undefined && mdRoute) {
      const cleanLabel = mdLabel.replace(/\*\*/g, "").trim();
      segments.push({
        type: "route",
        route: mdRoute,
        label: cleanLabel || getFriendlyRouteLabel(mdRoute),
        navigable: isNavigableRoute(mdRoute),
      });
    } else if (boldWithRouteLabel !== undefined) {
      const targetRoute = boldParenRoute || boldTickRoute || boldBareRoute;
      const cleanLabel = boldWithRouteLabel.trim();
      segments.push({
        type: "route",
        route: targetRoute,
        label: cleanLabel || getFriendlyRouteLabel(targetRoute),
        navigable: isNavigableRoute(targetRoute),
      });
    } else if (boldOnlyText !== undefined) {
      segments.push({ type: "bold", text: boldOnlyText });
    } else if (parenBacktickRoute || parenBareRoute || bareRoute) {
      const route = parenBacktickRoute || parenBareRoute || bareRoute;
      const friendlyLabel = getFriendlyRouteLabel(route);
      if (parenBacktickRoute || parenBareRoute) {
        stripDuplicateTrailingLabel(segments, friendlyLabel);
      }
      segments.push({
        type: "route",
        route,
        label: friendlyLabel,
        navigable: isNavigableRoute(route),
      });
    } else if (inlineCode !== undefined) {
      const trimmed = inlineCode.trim();
      if (isRoutePath(trimmed)) {
        const friendlyLabel = getFriendlyRouteLabel(trimmed);
        stripDuplicateTrailingLabel(segments, friendlyLabel);
        segments.push({
          type: "route",
          route: trimmed,
          label: friendlyLabel,
          navigable: isNavigableRoute(trimmed),
        });
      } else {
        segments.push({ type: "code", text: trimmed });
      }
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < rawLine.length) {
    segments.push({
      type: "text",
      text: rawLine.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: "text", text: rawLine }];
}

export function tokenizeInlineSegments(segments) {
  const tokens = [];
  for (const segment of segments) {
    if (segment.type === "route" || segment.type === "code") {
      tokens.push(segment);
      continue;
    }
    const parts = segment.text.match(/\S+\s*|\s+/g) ?? [];
    for (const part of parts) {
      tokens.push({ type: segment.type, text: part });
    }
  }
  return tokens;
}

export function parseMessageBlocks(rawText) {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let currentList = null;

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: paragraphLines.join("\n"),
      });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = line.match(/^\s*(?:[*•-])\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  if (blocks.length === 0 && rawText) {
    blocks.push({ type: "paragraph", text: rawText });
  }

  return blocks;
}

export function advanceWordBoundary(text, currentPos, wordsToAdvance = 1) {
  let pos = currentPos;
  const total = text.length;

  for (let step = 0; step < wordsToAdvance && pos < total; step += 1) {
    while (pos < total && /\s/.test(text[pos])) {
      pos += 1;
    }
    if (text[pos] === "[") {
      const rest = text.slice(pos);
      const linkMatch = rest.match(
        /^\[[^\]\n]+?\]\(\s*`?\/[a-z0-9:_-]+(?:\/[a-z0-9:_-]+)*`?\s*\)/i,
      );
      if (linkMatch) {
        pos += linkMatch[0].length;
        continue;
      }
    }
    while (pos < total && !/\s/.test(text[pos])) {
      pos += 1;
    }
  }

  return pos;
}
