# Vertix - Manual de Identidade Visual

---

## 1. Essencia da Marca

### Proposito
Vertix existe para democratizar o acesso a software de gestao profissional para PMEs brasileiras, unificando multiplas verticais de negocio em uma unica plataforma moderna e acessivel.

### Valores
- **Simplicidade**: Interface limpa, fluxos diretos
- **Confiabilidade**: Dados seguros, sistema estavel
- **Versatilidade**: Multiplos negocios, uma plataforma
- **Inovacao**: IA assistiva, design moderno
- **Acessibilidade**: Precos justos, onboarding simples

### Posicionamento
"A plataforma SaaS multi-vertical que conecta negocios ao futuro, com tecnologia acessivel e inteligente."

### Tom de Voz
- Profissional, mas acessivel
- Direto, sem jargoes desnecessarios
- Confiante, sem arrogancia
- Moderno, sem ser efemero

---

## 2. Logotipo

### Conceito
O logo Vertix e composto por um icone geometrico em forma de "V" com linhas convergentes (representando multiplas verticais se unindo) e um wordmark tipografico.

### Versoes
| Versao | Arquivo | Uso |
|--------|---------|-----|
| Completo Light | `/public/brand/logo.svg` | Fundos claros |
| Completo Dark | `/public/brand/logo-dark.svg` | Fundos escuros |
| Icone | `/public/brand/icon.svg` | Favicon, app icon |

### Margens de Seguranca
Manter espaco minimo igual a altura do icone "V" em todos os lados.

### Usos Proibidos
- Nunca alterar as proporcoes
- Nunca rotacionar
- Nunca aplicar sombra ou efeitos
- Nunca usar sobre fundos com baixo contraste
- Nunca usar versao light em fundo escuro (usar versao dark)
- Nunca usar a cor verde em nenhuma aplicacao

---

## 3. Paleta de Cores

### Cores Primarias

| Token | Hex | RGB | Uso |
|-------|-----|-----|-----|
| Brand 50 | `#EEF2FF` | 238, 242, 255 | Background sutil |
| Brand 100 | `#E0E7FF` | 224, 231, 255 | Background hover |
| Brand 200 | `#C7D2FE` | 199, 210, 254 | Bordas ativas |
| Brand 300 | `#A5B4FC` | 165, 180, 252 | Icones secundarios |
| Brand 400 | `#818CF8` | 129, 140, 248 | Elementos interativos |
| **Brand 500** | **`#6366F1`** | 99, 102, 241 | **Cor primaria principal** |
| Brand 600 | `#4F46E5` | 79, 70, 229 | Hover primario |
| Brand 700 | `#4338CA` | 67, 56, 202 | Pressed |
| Brand 800 | `#3730A3` | 55, 48, 163 | Texto sobre fundo claro |
| Brand 900 | `#312E81` | 49, 46, 129 | Background sidebar |
| Brand 950 | `#1E1B4B` | 30, 27, 75 | Background mais escuro |

### Cores Secundarias (Violet)

| Token | Hex | Uso |
|-------|-----|-----|
| Violet 400 | `#A78BFA` | Gradiente secundario |
| **Violet 500** | **`#8B5CF6`** | **Segunda cor do gradiente** |
| Violet 600 | `#7C3AED` | Hover gradiente |

### Gradiente da Marca
```css
background: linear-gradient(135deg, #6366F1, #8B5CF6);
```

### Cores Semanticas

| Funcao | Cor | Hex | Nota |
|--------|-----|-----|------|
| Sucesso | Blue | `#3B82F6` | **NAO usar verde** |
| Erro | Rose | `#F43F5E` | |
| Alerta | Amber | `#F59E0B` | Tambem usado como accent |
| Info | Cyan | `#06B6D4` | |

### Cores de Superficie (Light Mode)

| Token | Hex | Uso |
|-------|-----|-----|
| bg-primary | `#FAFAFA` | Fundo da pagina |
| bg-secondary | `#FFFFFF` | Cards, modais |
| bg-tertiary | `#F4F4F5` | Headers de tabela, hovers |
| text-primary | `#18181B` | Texto principal |
| text-secondary | `#52525B` | Texto secundario |
| text-muted | `#A1A1AA` | Placeholders, labels |
| border | `#E4E4E7` | Bordas |

### Cores de Superficie (Dark Mode)

| Token | Hex | Uso |
|-------|-----|-----|
| bg-primary | `#09090B` | Fundo da pagina |
| bg-secondary | `#18181B` | Cards, modais |
| bg-tertiary | `#27272A` | Headers de tabela, hovers |
| text-primary | `#FAFAFA` | Texto principal |
| text-secondary | `#A1A1AA` | Texto secundario |
| text-muted | `#71717A` | Placeholders, labels |
| border | `#3F3F46` | Bordas |

### Cores Proibidas
- **Verde em qualquer tom**: proibido em toda a plataforma
- Neon ou fluorescente
- Cores de baixo contraste

---

## 4. Tipografia

### Fonte Principal
**Inter** (Google Fonts)
- Escolhida por legibilidade excepcional em telas
- Suporte completo a caracteres latinos

### Hierarquia

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| H1 | 30px / 1.875rem | Bold (700) | Titulos de pagina |
| H2 | 24px / 1.5rem | Semibold (600) | Secoes |
| H3 | 20px / 1.25rem | Semibold (600) | Subsecoes |
| H4 | 16px / 1rem | Medium (500) | Subtitulos |
| Body | 14px / 0.875rem | Regular (400) | Texto corrido |
| Small | 12px / 0.75rem | Regular (400) | Labels, captions |
| Tiny | 10px / 0.625rem | Medium (500) | Badges, counters |

---

## 5. Componentes UI

### Botoes

| Tipo | Classe | Visual |
|------|--------|--------|
| Primary | `btn-primary` | Gradiente Indigo->Violet, texto branco |
| Secondary | `btn-secondary` | Background surface, borda, texto primario |
| Danger | `btn-danger` | Rose 600, texto branco |

### Cards
- Background: `bg-secondary`
- Borda: 1px `border`
- Border-radius: 12px (xl)
- Shadow: sm
- Hover: shadow-md + borda brand

### Inputs
- Background: `bg-secondary`
- Borda: 1px `border`
- Focus: borda brand-500 + ring
- Placeholder: `text-muted`

### Tabelas
- Header: `bg-tertiary`
- Rows: hover `bg-tertiary`
- Bordas: `border`

### Status Badges
| Status | Cor |
|--------|-----|
| Ativo/Sucesso | Blue (bg-blue-100 text-blue-700) |
| Pendente | Amber (bg-amber-100 text-amber-700) |
| Em andamento | Brand (bg-indigo-100 text-indigo-700) |
| Cancelado | Rose (bg-rose-100 text-rose-700) |
| Concluido | Blue (bg-blue-100 text-blue-700) |
| Rascunho | Surface (bg-gray-100 text-gray-600) |

---

## 6. Dark Mode

### Implementacao
- Classe `dark` no `<html>`
- CSS variables para transicao suave
- ThemeProvider com 3 opcoes: Claro, Escuro, Sistema
- Persistencia via localStorage (`vertix_theme`)
- Respeita preferencia do sistema operacional

### Regras
- Todos os componentes devem usar CSS variables
- Nunca hardcodar cores de texto ou fundo
- Gradiente da marca funciona em ambos os modos
- Sidebar usa tons mais profundos da paleta brand

---

## 7. Icones

### Biblioteca
**Lucide React** - icones outline consistentes

### Tamanhos
| Contexto | Tamanho |
|----------|---------|
| Navegacao | 20px |
| Botoes | 16px |
| Headers | 24px |
| Stats | 28px |
| Inline | 14px |

---

## 8. Espacamento

Baseado no sistema Tailwind CSS:
- 4px grid system
- Padding de cards: 24px (p-6)
- Gap entre elementos: 16px (gap-4)
- Margem entre secoes: 24px (space-y-6)

---

## 9. Responsividade

| Breakpoint | Largura | Layout |
|------------|---------|--------|
| Mobile | < 640px | Stack vertical, sidebar oculta |
| Tablet | 640-1024px | Sidebar colapsada |
| Desktop | > 1024px | Layout completo |

---

## 10. Acessibilidade

- Contraste minimo WCAG AA (4.5:1 texto, 3:1 elementos grandes)
- Focus visible em todos os elementos interativos
- Alt text em imagens
- Labels em formularios
- Keyboard navigation
- Semantic HTML
