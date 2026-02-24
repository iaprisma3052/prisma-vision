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

    const systemPrompt = `Você é um analista de trading profissional especializado em price action e leitura de velas. Analise a imagem do gráfico de trading aplicando TODOS os filtros abaixo antes de gerar o sinal.

FILTROS OBRIGATÓRIOS DE ANÁLISE:

1. **LTA/LTB (Linhas de Tendência)**:
   - Identifique se existe uma LTA (Linha de Tendência de Alta - conectando fundos ascendentes) ou LTB (Linha de Tendência de Baixa - conectando topos descendentes).
   - Se o preço está PRÓXIMO de uma LTA ou LTB, NÃO gere sinal imediatamente. Marque como "NEUTRO" e explique que o preço está em região de teste de linha de tendência.
   - Rompimentos de LTA/LTB devem ser confirmados com pullback antes de gerar sinal.

2. **Velas de Exaustão**:
   - Verifique se as últimas velas mostram sinais de exaustão: corpo muito grande após tendência longa, "dupla posição" (vela que não rompe o corpo da anterior da mesma cor), martelo, shooting star, doji ou barra elefante.
   - Se detectar exaustão após uma tendência forte, NÃO gere sinal na mesma direção da tendência. Espere confirmação de reversão ou marque como "NEUTRO".
   - Exaustão de compra = não gerar COMPRA. Exaustão de venda = não gerar VENDA.

3. **Velas de Descanso vs. Velas de Força**:
   - Identifique se uma vela pequena contrária (ex: vela vermelha no meio de alta) é apenas uma vela de DESCANSO (corpo curto, pavios curtos) e não uma reversão real.
   - Se após a vela de descanso vier uma vela de FORÇA (corpo grande fechando próximo da máxima/mínima), confirme a continuação da tendência.
   - Não confunda descanso com reversão. Analise o contexto das 5-10 velas anteriores.

4. **Lateralização/Consolidação**:
   - Verifique se o mercado está lateralizado: preço oscilando entre suporte e resistência definidos, sem renovar topos ou fundos, velas alternando de cor sem direção clara.
   - Se detectar lateralização, marque como "NEUTRO" com intensidade "FRACA" e explique que o mercado está consolidado.
   - Sinais de lateralização: falha em renovar topos/fundos, candles pequenos alternados, preço "chato" sem continuidade.

5. **Contexto Geral**:
   - Analise as últimas 10-20 velas visíveis para entender o contexto completo.
   - Verifique a velocidade/inclinação do movimento (muito íngreme = possível exaustão).
   - O sinal só deve ser gerado quando houver CONFLUÊNCIA de fatores confirmando a direção.

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
  "filtros_detectados": {
    "lta_ltb_proximo": true/false,
    "exaustao_detectada": true/false,
    "vela_descanso": true/false,
    "lateralizacao": true/false,
    "tendencia_atual": "ALTA" ou "BAIXA" ou "LATERAL"
  },
  "resumo": "Resumo detalhado em português explicando quais filtros foram aplicados, o que foi detectado no gráfico, e por que o sinal foi gerado (ou por que foi marcado como NEUTRO)"
}

REGRA DE OURO: Na dúvida, marque como NEUTRO. É melhor não gerar sinal do que gerar um sinal errado. O nome do ativo e preço devem ser lidos diretamente do gráfico.`;

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
                text: "Analise este gráfico de trading e retorne o JSON com a análise completa. Leia o nome do ativo e preço diretamente da imagem."
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

    // Parse JSON from AI response (may have markdown wrapping)
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
