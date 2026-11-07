import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { EarTrainer } from "@/components/harmony/EarTrainer";

export const Route = createFileRoute("/aprender")({
  head: () => ({
    meta: [
      { title: "Aprenda a tirar músicas de ouvido — Harmonia Fácil" },
      { name: "description", content: "Explicações simples sobre tônica, dominante, subdominante, campo harmônico e tensão e resolução." },
      { property: "og:title", content: "Aprenda a tirar músicas de ouvido" },
      { property: "og:description", content: "Teoria das funções harmônicas explicada de forma simples, com exemplos em Dó maior." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Learn,
});

const TOPICS = [
  { t: "O que é tônica?", c: "border-tonic", b: "É o acorde 'casa'. Quando a música chega nele, dá sensação de fim. Em Dó maior: C (e também Em e Am, que soam parecidos)." },
  { t: "O que é dominante?", c: "border-dominant", b: "É o acorde da tensão: ele 'puxa' de volta para a tônica. Em Dó maior: G (e Bdim). Ouviu um G? Prepare-se para o C." },
  { t: "O que é subdominante?", c: "border-subdominant", b: "É o acorde que sai de casa e prepara a tensão. Em Dó maior: F e Dm. Normalmente vem antes do G." },
  { t: "O que é campo harmônico?", c: "border-border", b: "São os 7 acordes que nascem da escala de uma tonalidade. Em Dó maior: C, Dm, Em, F, G, Am, Bdim. A maioria das músicas usa só eles." },
  { t: "O que é progressão harmônica?", c: "border-border", b: "É a sequência de acordes de uma música. Ex.: F → G → C (preparação → tensão → repouso), ou C → Am → F → G." },
  { t: "O que é tensão e resolução?", c: "border-border", b: "A tensão cria expectativa (G) e a resolução traz alívio (C). Treine o ouvido: toque G e pare. Sentiu que falta algo? Isso é tensão." },
  { t: "Acordes com dupla função", c: "border-border", b: "Alguns acordes mudam de papel conforme o contexto: Am pode ser repouso ou preparação; Em pode soar como repouso ou como tensão." },
];

function Learn() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Voltar ao mapa</Link>
      <h1 className="mt-4 text-3xl font-extrabold">Aprenda a tirar músicas de ouvido</h1>
      <p className="mt-2 text-muted-foreground">Ouça, identifique a função, antecipe o próximo acorde.</p>
      <div className="mt-6">
        <EarTrainer />
      </div>
      <div className="mt-6 space-y-3">
        {TOPICS.map((x) => (
          <details key={x.t} className={`group rounded-2xl border-l-4 bg-card p-4 ${x.c}`}>
            <summary className="cursor-pointer list-none font-display font-bold">{x.t}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
