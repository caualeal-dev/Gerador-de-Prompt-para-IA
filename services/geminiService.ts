import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface PromptData {
  projectName: string;
  niche: string;
  targetAudience: string;
  mainGoal: string;
  tone: string;
  style: string;
  selectedPages: string[];
  cornerStyle: string;
  siteComplexity: string;
  hasLogo: boolean;
  colors?: { primary: string; accent: string; [key: string]: string; };
  seoKeywords?: string[];
  pageContent?: { [key: string]: string };
}

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

/**
 * **NEW**: Analyzes the content of a URL by fetching it through a CORS proxy.
 * This demonstrates handling of a common web development challenge.
 * In a production environment, you would use your own serverless function.
 */
export async function analyzeUrl(url: string) {
    try {
        // Using a public CORS proxy for demonstration purposes.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Não foi possível buscar a URL. Status: ${response.status}`);
        }
        const html = await response.text();
        
        // Create a temporary DOM element to parse the HTML and extract text.
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Simple text extraction - could be improved with more sophisticated parsing.
        const textContent = doc.body.innerText || "";
        
        if (!textContent.trim()) {
            throw new Error("O site não retornou conteúdo de texto para análise.");
        }
        
        return await analyzeWebsiteContent(textContent.trim());

    } catch (error) {
        console.error("Erro na função analyzeUrl:", error);
        throw error;
    }
}

/**
 * **NEW**: Sends website text content to Gemini for structured data extraction.
 */
export async function analyzeWebsiteContent(textContent: string) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise o seguinte conteúdo de texto extraído de um site. Extraia as informações solicitadas no formato JSON. Seja conciso e direto. Se uma informação não for clara, faça a sua melhor suposição. Conteúdo: "${textContent.substring(0, 8000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectName: { type: Type.STRING, description: 'O nome do negócio ou projeto.' },
                        niche: { type: Type.STRING, description: 'O nicho de mercado do site.' },
                        targetAudience: { type: Type.STRING, description: 'O público-alvo provável do site.' },
                        mainGoal: { type: Type.STRING, description: 'A principal chamada para ação (CTA) ou objetivo do site.' },
                        tone: { type: Type.STRING, description: 'O tom de voz (ex: Profissional, Amigável).' },
                        selectedPages: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista de páginas que o site provavelmente tem (ex: Início, Sobre, Contato).' },
                        colors: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING, description: "A cor primária principal (hex)." },
                                accent: { type: Type.STRING, description: "A cor de destaque/acento (hex)." }
                            }
                        }
                    },
                    required: ["projectName", "niche", "targetAudience", "mainGoal", "tone", "selectedPages", "colors"],
                },
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Erro ao analisar conteúdo do site:", error);
        throw new Error("A IA não conseguiu analisar o conteúdo do site.");
    }
}


/**
 * Genera uma paleta de cores com base no nicho e estilo.
 */
export async function generateColorPalette(niche: string, style: string): Promise<Palette> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gere uma paleta de cores harmoniosa para um site com o nicho "${niche}" e estilo visual "${style}". A paleta deve conter 4 cores: primária, secundária, de destaque (accent) e neutra. Forneça apenas os códigos hexadecimais.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary: { type: Type.STRING, description: 'A cor principal do site.' },
            secondary: { type: Type.STRING, description: 'A cor secundária, para suporte.' },
            accent: { type: Type.STRING, description: 'A cor de destaque para CTAs e links.' },
            neutral: { type: Type.STRING, description: 'A cor neutra para fundos e textos.' },
          },
          required: ["primary", "secondary", "accent", "neutral"],
        },
      },
    });
    
    const jsonString = response.text.trim();
    const parsedPalette = JSON.parse(jsonString);

    for (const key in parsedPalette) {
      if (!/^#[0-9A-F]{6}$/i.test(parsedPalette[key])) {
        throw new Error(`Cor inválida recebida da API: ${parsedPalette[key]}`);
      }
    }
    
    return parsedPalette as Palette;

  } catch (error) {
    console.error("Erro ao gerar paleta de cores:", error);
    throw new Error("Não foi possível gerar a paleta de cores.");
  }
}

/**
 * Gera o prompt principal para o construtor de sites em modo streaming.
 */
export async function* generateWebsitePromptStream(data: PromptData): AsyncGenerator<string> {
  const { 
    projectName, niche, targetAudience, mainGoal, tone, style, selectedPages,
    cornerStyle, siteComplexity, hasLogo, colors, seoKeywords, pageContent
  } = data;

  const colorInstructions = colors
    ? `A paleta de cores JÁ FOI DEFINIDA. Use EXATAMENTE estas cores:
- Cor Primária: ${colors.primary}
- Cor de Destaque (Accent): ${colors.accent}
${colors.secondary ? `- Cor Secundária: ${colors.secondary}` : ''}
${colors.neutral ? `- Cor Neutra: ${colors.neutral}` : ''}
Não invente nenhuma outra cor.`
    : `Sugira uma paleta de cores profissional e acessível que se alinhe com o nicho e o estilo visual. Certifique-se de que haja contraste suficiente para a legibilidade.`;

  const logoInstructions = hasLogo
    ? "O usuário FORNECEU um arquivo de logo (ou gerou uma sugestão). Use este logo de forma proeminente no cabeçalho (geralmente no canto superior esquerdo) e novamente de forma mais sutil no rodapé. Garanta que haja espaço em branco adequado ao redor do logo."
    : "CRIE um logo de texto simples e elegante para o negócio. Use o nome da marca e a fonte de título principal para o logo. Ele deve ser limpo e profissional.";

  const seoInstructions = (seoKeywords && seoKeywords.length > 0)
    ? `**SEO e Palavras-chave:**
   - Incorpore naturalmente as seguintes palavras-chave no conteúdo do site, especialmente em títulos (H1, H2) e parágrafos iniciais: ${seoKeywords.join(', ')}.`
    : `**SEO e Palavras-chave:**
   - [Sugira 5-10 palavras-chave de cauda longa relevantes para o nicho para otimização de SEO].`;
    
  const generatePageContentInstructions = () => {
    return selectedPages.map(page => {
        const userContent = pageContent?.[page];
        if (userContent) {
            return `
     - **${page}:**
       - **Conteúdo Fornecido pelo Usuário:**
       \`\`\`
       ${userContent}
       \`\`\`
       - **Instrução:** Use o conteúdo acima como base principal para esta página. Expanda-o, melhore-o e formate-o conforme necessário, mantendo o tom de voz "${tone}".`;
        } else {
            const pagePrompts: { [key: string]: string } = {
                "Início": "Descreva uma seção de herói cativante com um título forte, um subtítulo e um CTA claro. Siga com uma breve introdução dos serviços/produtos, um bloco de prova social (depoimentos ou logotipos de clientes) e um CTA final.",
                "Sobre Nós": "Crie uma narrativa envolvente sobre a história, missão e valores da marca. Apresente a equipe, se aplicável, e construa uma conexão emocional com o leitor.",
                "Serviços": "Liste e descreva detalhadamente os serviços ou produtos oferecidos. Use títulos claros, parágrafos curtos e talvez ícones para cada item. Termine com um CTA para solicitar um orçamento ou comprar.",
                "Blog": "Estruture uma página de listagem de artigos de blog com espaço para uma imagem destacada, título, resumo e data para cada post. Inclua uma barra lateral com categorias ou posts populares.",
                "Contato": "Inclua um formulário de contato simples (Nome, Email, Mensagem). Adicione outras informações como endereço (com um mapa incorporado, se possível), telefone e horário de funcionamento.",
                "Galeria": "Projete uma grade de imagens visualmente atraente. Considere funcionalidades de filtro por categoria e um lightbox para visualização em tela cheia.",
                "Preços": "Crie uma tabela de preços clara e comparativa. Destaque o plano mais popular. Para cada plano, liste os recursos principais e inclua um botão de CTA claro."
            };
            return `
     - **${page}:** [${pagePrompts[page] || `Forneça uma estrutura de conteúdo básica e relevante para uma página de '${page}'.`}]`;
        }
    }).join('');
  };

  const masterPrompt = `
**NÃO adicione nenhum texto introdutório ou final. Gere APENAS o prompt em markdown abaixo, preenchendo as seções com criatividade e detalhes.**

---

**PROMPT PARA IA CONSTRUTORA DE SITES**

**1. Identidade Principal:**
   - **Nome do Negócio:** ${projectName}
   - **Logo:** ${logoInstructions}
   - **Nicho de Mercado:** ${niche}
   - **Público-Alvo:** ${targetAudience}
   - **Proposta Única de Valor (USP):** [Elabore uma USP concisa e impactante baseada no nicho e público]
   - **Tom de Voz:** ${tone}

**2. Estrutura e Conteúdo:**
   - **Páginas Necessárias:** ${selectedPages.join(', ')}
   - **Principal Chamada para Ação (CTA):** O objetivo principal do site é levar o usuário a "${mainGoal}". Crie botões e links proeminentes com este objetivo em mente.
   - **Conteúdo Detalhado das Páginas:** ${generatePageContentInstructions()}

**3. Design e Estética:**
   - **Estilo Visual Geral:** ${style}. Pense em layouts limpos, tipografia marcante e uso estratégico de espaços em branco.
   - **Paleta de Cores:** ${colorInstructions}
   - **Tipografia:** [Sugira um par de fontes (uma para títulos, uma para corpo de texto) que complementem o estilo visual. Ex: "Use 'Poppins' para títulos e 'Lato' para texto."]
   - **Estilo dos Elementos:**
     - **Botões:** [Descreva a aparência dos botões, ex: "grandes, com a cor de destaque e cantos ${cornerStyle.toLowerCase()}"]
     - **Cards e Seções:** Devem ter cantos ${cornerStyle.toLowerCase()} para uma aparência coesa.
   - **Complexidade e Interatividade:** O design deve ser **${siteComplexity}**.
     - ${siteComplexity === "Interativo e Detalhado"
       ? "[Incorpore micro-interações sutis em botões e links (como um leve zoom no hover) e transições suaves de scroll para animar a aparição de seções.]"
       : "[Foque em um design limpo, rápido e fácil de navegar, sem animações desnecessárias.]"}
   - **Imagens:** [Descreva o tipo de imagens a serem usadas. Ex: "Use fotos de alta qualidade, autênticas e que mostrem pessoas reais interagindo com o produto."]

**4. Acessibilidade e SEO:**
   - **Acessibilidade:**
     - Garanta que todas as combinações de cores de texto e fundo tenham uma taxa de contraste que atenda aos padrões WCAG AA.
     - Inclua texto alternativo (alt text) descritivo para todas as imagens.
     - Use uma estrutura de cabeçalho (H1, H2, H3) lógica e semântica.
   - ${seoInstructions}
`;

  try {
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: masterPrompt
    });
    for await (const chunk of responseStream) {
        yield chunk.text;
    }
  } catch (error) {
    console.error("Erro ao rodar a query com a API Gemini:", error);
    if (error instanceof Error) {
        yield `Ocorreu um erro na comunicação com a API: ${error.message}`;
    } else {
        yield "Ocorreu um erro desconhecido ao gerar o prompt.";
    }
  }
}

/**
 * Gera sugestões para um campo de formulário específico.
 */
export async function generateInspiration(fieldName: string, context: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Com base neste contexto: "${context}", gere 3 sugestões criativas e concisas para o campo de formulário "${fieldName}". As sugestões devem ser curtas e diretas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["suggestions"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.suggestions as string[];

  } catch (error) {
    console.error(`Erro ao gerar inspiração para ${fieldName}:`, error);
    throw new Error("Não foi possível gerar sugestões.");
  }
}

/**
 * Gera palavras-chave de SEO.
 */
export async function generateSeoKeywords(niche: string, targetAudience: string): Promise<string[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Gere uma lista de 10 palavras-chave de SEO essenciais (incluindo cauda longa) para um negócio no nicho de "${niche}" que visa o público "${targetAudience}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Uma lista de 10 palavras-chave de SEO.'
              },
            },
            required: ["keywords"],
          },
        },
      });
  
      const jsonString = response.text.trim();
      const parsed = JSON.parse(jsonString);
      return parsed.keywords as string[];
  
    } catch (error) {
      console.error(`Erro ao gerar keywords de SEO:`, error);
      throw new Error("Não foi possível gerar palavras-chave de SEO.");
    }
}

/**
 * Gera conteúdo de texto para uma página específica.
 */
export async function generatePageContent(pageName: string, context: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${context}. Elabore um rascunho de texto com cerca de 150-200 palavras para esta página. O texto deve ser bem estruturado com títulos e parágrafos.`,
      });
      return response.text.trim();
    } catch (error) {
      console.error(`Erro ao gerar conteúdo para a página ${pageName}:`, error);
      throw new Error(`Não foi possível gerar conteúdo para ${pageName}.`);
    }
}

/**
 * Gera uma sugestão de logo.
 */
export async function generateLogoSuggestion(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        // FIX: Iterating through parts to find image data, which is more robust
        // than assuming it's always the first part.
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("Nenhuma imagem foi retornada pela API.");

    } catch (error) {
        console.error("Erro ao gerar sugestão de logo:", error);
        throw new Error("Não foi possível gerar a sugestão de logo.");
    }
}