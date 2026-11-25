import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getFriendlyRouteLabel,
  isNavigableRoute,
  parseInlineSegments,
  parseMessageBlocks,
  sanitizeStreamingText,
} from "../src/components/SupportChat/supportChatFormatting.js";

test("parses markdown links into friendly navigable route chips without raw path", () => {
  const segments = parseInlineSegments(
    "Acesse `[Minhas solicitações](/minhas-solicitacoes)` ou [Reforço Escolar](/vagas/100).",
  );
  const routeSegments = segments.filter((seg) => seg.type === "route");

  assert.equal(routeSegments.length, 2);
  assert.deepEqual(routeSegments[0], {
    type: "route",
    route: "/minhas-solicitacoes",
    label: "Minhas solicitações",
    navigable: true,
  });
  assert.deepEqual(routeSegments[1], {
    type: "route",
    route: "/vagas/100",
    label: "Reforço Escolar",
    navigable: true,
  });
});

test("merges bold labels followed by routes into a single friendly chip", () => {
  const segments = parseInlineSegments(
    "Encontrei a vaga **Reforço Escolar** `/vagas/100` da **ONG Esperança SP** (/entidade/sobre/ong-esperanca-sp).",
  );

  assert.deepEqual(segments, [
    { type: "text", text: "Encontrei a vaga " },
    {
      type: "route",
      route: "/vagas/100",
      label: "Reforço Escolar",
      navigable: true,
    },
    { type: "text", text: " da " },
    {
      type: "route",
      route: "/entidade/sobre/ong-esperanca-sp",
      label: "ONG Esperança SP",
      navigable: true,
    },
    { type: "text", text: "." },
  ]);
});

test("converts standalone routes to friendly labels and supports /vagas/:id/editar", () => {
  assert.equal(getFriendlyRouteLabel("/oportunidades"), "Oportunidades");
  assert.equal(getFriendlyRouteLabel("/vagas/15/editar"), "Editar vaga #15");
  assert.equal(isNavigableRoute("/vagas/15/editar"), true);

  const segments = parseInlineSegments("Veja em /notificacoes agora.");
  assert.deepEqual(segments, [
    { type: "text", text: "Veja em " },
    {
      type: "route",
      route: "/notificacoes",
      label: "Notificações",
      navigable: true,
    },
    { type: "text", text: " agora." },
  ]);
});

test("sanitizes incomplete trailing markdown links while streaming", () => {
  assert.equal(
    sanitizeStreamingText("Acesse [Minhas solicitações](/minhas-soli", true),
    "Acesse Minhas solicitações",
  );
  assert.equal(
    sanitizeStreamingText("Acesse [Minhas solicitações](/minhas-solicitacoes)", true),
    "Acesse [Minhas solicitações](/minhas-solicitacoes)",
  );
});

test("splits paragraphs and bullet/numbered lists into semantic blocks", () => {
  const blocks = parseMessageBlocks(
    "Para participar:\n1. Abra [Oportunidades](/oportunidades)\n2. Escolha a vaga\n\nDúvidas:\n- Veja [Convites](/convites)",
  );

  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, "paragraph");
  assert.equal(blocks[1].type, "ol");
  assert.equal(blocks[1].items.length, 2);
  assert.equal(blocks[2].type, "paragraph");
  assert.equal(blocks[3].type, "ul");
});
