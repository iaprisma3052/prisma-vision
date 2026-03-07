import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um analista de trading profissional. Analise a imagem do gráfico de trading focando nos indicadores Williams %R (período 7) e Momentum (período 5).

LEITURA OBRIGATÓRIA DA TELA:
1. **Leia o nome do ativo** que aparece no gráfico (ex: EUR/USD, BTC/USD, etc.)
2. **Leia o preço atual** exibido no gráfico
3. **Leia o cronômetro/timer da vela** se visível na plataforma

ESTRATÉGIA PRINCIPAL — Williams %R (período 7) + Momentum (período 5):

1. **Williams %R (período 7)** — linha turquesa no gráfico:
   - Valores acima de -20: zona de sobrecompra (possível reversão para baixo)
   - Valores abaixo de -80: zona de sobrevenda (possível reversão para cima)
   - Direção da linha: se está apontando para CIMA ou para BAIXO

2. **Momentum (período 5)** — linha azul turquesa no gráfico:
   - Acima da linha zero: momento de alta
   - Abaixo da linha zero: momento de baixa
   - Direção da linha: se está apontando para CIMA ou para BAIXO

REGRAS DE SINAL:
- **COMPRA**: Williams %R E Momentum AMBOS apontando para CIMA (mesma direção)
- **VENDA**: Williams %R E Momentum AMBOS apontando para BAIXO (mesma direção)
- **NEUTRO**: Indicadores apontando em direções DIFERENTES ou sem clareza

ANÁLISE COMPLEMENTAR:
- Observe o contexto das últimas 5-10 velas para confirmar a tendência
- Verifique se o preço está em zona de suporte ou resistência
- Analise o tamanho e formato das velas recentes

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem texto extra):

{
  "ativo": "NOME DO ATIVO (leia do gráfico)",
  "preco": "PREÇO ATUAL (leia do gráfico)",
  "forca_compradora": NUMBER de 0 a 100,
  "forca_vendedora": NUMBER de 0 a 100,
  "direcao": "COMPRA" ou "VENDA" ou "NEUTRO",
  "intensidade": "FORTE" ou "MODERADA" ou "FRACA",
  "volume_bars": [{"tipo": "compra" ou "venda", "valor": NUMBER, "tamanho": "grande" ou "medio" ou "pequeno"}],
  "setas": [{"direcao": "cima" ou "baixo", "valor": NUMBER}],
  "indicadores": {
    "williams_r_valor": NUMBER (valor atual do Williams %R),
    "williams_r_direcao": "cima" ou "baixo",
    "momentum_valor": NUMBER (valor atual do Momentum),
    "momentum_direcao": "cima" ou "baixo",
    "ambos_alinhados": true/false,
    "tendencia_atual": "ALTA" ou "BAIXA" ou "LATERAL"
  },
  "resumo": "Resumo em português explicando o que Williams %R e Momentum indicam, se estão alinhados, e por que o sinal foi gerado ou marcado como NEUTRO"
}

REGRA DE OURO: Se Williams %R e Momentum NÃO estão apontando na mesma direção, marque como NEUTRO. É melhor não gerar sinal do que gerar um sinal errado.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              },
              {
                type: "text",
                text: "Analise este gráfico de trading. Leia o nome do ativo, preço atual, e analise os indicadores Williams %R (período 7) e Momentum (período 5). Retorne o JSON completo."
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro na análise de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Resposta vazia da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const data = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-trading error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
