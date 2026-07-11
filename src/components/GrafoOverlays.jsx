import { useState } from 'react'
import { PALETAS } from '../data/paletas'

// Overlays finais da página de grafos (G9) — porte fiel do protótipo
// (design/prototipo_grafo.html). Três blocos pequenos e irmãos do palco num
// único módulo (exports nomeados):
//   • LegendaTipos — "Tipos de nó" (canto inferior direito): contagem por tipo
//     e TOGGLE que oculta/mostra o tipo reconsultando o endpoint (o filtro
//     `tipos` entra na consulta SPARQL gerada).
//   • GavetaSparql — botão "SPARQL" (ao lado da legenda) que abre a gaveta com
//     a última consulta real enviada + tempo + checkbox "Simular falha do
//     endpoint (HTTP 503)" (liga o modo erro do mock via setConfig).
//   • PaletaPopover — botão-swatch na coluna de zoom que abre o popover
//     "Cores do grafo · daltonismo" (Padrão/Protanopia/Deuteranopia/
//     Tritanopia, de src/data/paletas.js). A troca escreve os tokens --no-*
//     no <html> (efeito na página).
//   • OpcoesAcessibilidade (G10) — o miolo do popover, compartilhado com o
//     dropdown de perfil (GrafoPerfil): linhas de paleta + toggles "formas em
//     vez de cores" e "desativar animações e física". As formas dos pontinhos
//     DOM vêm das classes .eg-no-* + data-formas no <html> (index.css).

const MONO_LABEL = {
  font: "9.5px/1 'JetBrains Mono', monospace",
  letterSpacing: '0.16em',
  color: 'var(--faint)',
  textTransform: 'uppercase',
}

const NOMES_TIPO = { habilidade: 'Habilidades', conceito: 'Conceitos', disciplina: 'Matérias' }

// ---- Legenda "Tipos de nó" + filtro por tipo ----
// Habilidades NÃO são alternáveis (desvio do protótipo): toda aresta do grafo
// passa por uma habilidade, então ocultá-las esvazia o recorte sempre.
export function LegendaTipos({ tipos, contagens, aoAlternar }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 196,
        background: 'var(--pill-bg)',
        border: '1px solid var(--pill-border)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 10px 26px rgba(28,38,32,.10)',
      }}
    >
      <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Tipos de nó</div>

      {/* Habilidades: linha-selo fixa, visivelmente NÃO clicável, apartada dos toggles */}
      <div
        title="Habilidades são a espinha do grafo — sempre visíveis"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '6px 8px',
          background: 'color-mix(in srgb, var(--bg2) 70%, transparent)',
          border: '1px dashed var(--edge)',
          borderRadius: 8,
          cursor: 'default',
          marginBottom: 8,
        }}
      >
        <span className="eg-no-habilidade" style={{ width: 11, height: 11, background: 'var(--no-habilidade)', flex: 'none' }} />
        <span style={{ flex: 1, textAlign: 'left', font: "600 12.5px/1.4 'Figtree', sans-serif", color: 'var(--body)' }}>
          {NOMES_TIPO.habilidade}
        </span>
        <span style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
          {String(contagens.habilidade)}
        </span>
        <span
          style={{
            font: "8.5px/1.4 'JetBrains Mono', monospace",
            letterSpacing: '0.08em',
            color: 'var(--faint)',
            border: '1px solid var(--pill-border)',
            borderRadius: 6,
            padding: '1px 5px',
            textTransform: 'uppercase',
            flex: 'none',
          }}
        >
          fixo
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['conceito', 'disciplina'].map((t) => {
          const oculto = tipos[t] === false
          return (
            <button
              key={t}
              type="button"
              className="eg-legenda-item"
              title="Mostrar/ocultar este tipo (reconsulta o endpoint)"
              onClick={() => aoAlternar(t)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '5px 7px',
                margin: '0 -7px',
                border: 'none',
                background: 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                opacity: oculto ? 0.45 : 1,
              }}
            >
              <span className={`eg-no-${t}`} style={{ width: 11, height: 11, background: `var(--no-${t})`, flex: 'none' }} />
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  font: "600 12.5px/1.4 'Figtree', sans-serif",
                  color: 'var(--body)',
                  textDecoration: oculto ? 'line-through' : 'none',
                }}
              >
                {NOMES_TIPO[t]}
              </span>
              <span style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
                {oculto ? '—' : String(contagens[t])}
              </span>
            </button>
          )
        })}
      </div>

      {/* chave de leitura das arestas: contínua (relação direta) × tracejada (progressão) */}
      <div
        style={{
          borderTop: '1px dashed var(--pill-border)',
          marginTop: 9,
          paddingTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="8" viewBox="0 0 20 8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--faint)" strokeWidth="1.4" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>conexão direta no recorte</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="8" viewBox="0 0 20 8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--faint)" strokeWidth="1.4" strokeDasharray="4 3" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>progressão entre anos</span>
        </div>
      </div>
    </div>
  )
}

// ---- Gaveta da consulta SPARQL ----
export function GavetaSparql({ consulta, tempoMs, simErro, aoSimErro }) {
  const [aberta, setAberta] = useState(false)
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        right: 224,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {aberta && (
        <div
          style={{
            width: 560,
            maxWidth: 'calc(100vw - 260px)',
            background: 'var(--pill-bg)',
            border: '1px solid var(--pill-border)',
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: '0 14px 34px rgba(28,38,32,.14)',
            marginBottom: 8,
            animation: 'egSurgir .16s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ ...MONO_LABEL, color: 'var(--muted)' }}>Última consulta ao endpoint</span>
            <span style={{ flex: 1 }} />
            <span style={{ font: "10px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>
              {tempoMs ? `${tempoMs} ms` : ''}
            </span>
          </div>
          {/* bloco "terminal": cores fixas de propósito (escuro nos 2 temas) */}
          <pre
            style={{
              margin: 0,
              maxHeight: 180,
              overflow: 'auto',
              background: '#1c2620',
              color: '#dde6df',
              borderRadius: 10,
              padding: '12px 14px',
              font: "10.5px/1.55 'JetBrains Mono', monospace",
              whiteSpace: 'pre',
            }}
          >
            {consulta || '# Nenhuma consulta executada ainda.\n# Escolha um recorte e clique em Filtrar.'}
          </pre>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              cursor: 'pointer',
              fontSize: 12.5,
              color: 'var(--body)',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={simErro}
              onChange={(e) => aoSimErro(e.target.checked)}
              style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <span>Simular falha do endpoint (HTTP 503) na próxima consulta</span>
          </label>
          <p style={{ margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.5, color: 'var(--faint)' }}>
            Dados de demonstração. Na implementação, substitua{' '}
            <span style={{ font: "10.5px/1.5 'JetBrains Mono', monospace" }}>consultarFuseki()</span> por um
            fetch ao serviço Fuseki — o formato de resposta (sparql-results+json) é o mesmo.
          </p>
        </div>
      )}
      <button
        type="button"
        className="eg-grafo-sparql"
        onClick={() => setAberta((a) => !a)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid var(--pill-border)',
          background: 'var(--pill-bg)',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(28,38,32,.08)',
          font: "10.5px/1 'JetBrains Mono', monospace",
          letterSpacing: '0.12em',
          color: 'var(--body)',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: simErro ? 'var(--gold)' : 'var(--green)' }} />
        <span>SPARQL</span>
      </button>
    </div>
  )
}

// interruptor 34×20 do protótipo (verde ligado, --edge desligado)
function Chave({ ligada }) {
  return (
    <span
      style={{
        width: 34,
        height: 20,
        borderRadius: 999,
        background: ligada ? 'var(--green)' : 'var(--edge)',
        position: 'relative',
        flex: 'none',
        transition: 'background .15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: ligada ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.3)',
          transition: 'left .15s',
        }}
      />
    </span>
  )
}

// ---- Miolo de acessibilidade (paletas + formas + sem animação) ----
// Compartilhado entre o PaletaPopover e o dropdown de perfil (GrafoPerfil).
export function OpcoesAcessibilidade({ paleta, aoEscolherPaleta, formas, aoToggleFormas, semAnim, aoToggleSemAnim }) {
  // a linha "Padrão" mostra as cores de fábrica (hex do tema claro, como o
  // protótipo) — os swatches das outras linhas são as cores das paletas CUD
  const opcoes = [
    { id: 'padrao', nome: 'Padrão', sub: 'cores do sistema', c: { habilidade: '#1b9e77', conceito: '#7c4dff', disciplina: '#e11d48' } },
    { id: 'protanopia', nome: 'Protanopia', sub: 'dificuldade com vermelho', c: PALETAS.protanopia },
    { id: 'deuteranopia', nome: 'Deuteranopia', sub: 'dificuldade com verde', c: PALETAS.deuteranopia },
    { id: 'tritanopia', nome: 'Tritanopia', sub: 'dificuldade com azul', c: PALETAS.tritanopia },
  ]
  const toggles = [
    {
      titulo: 'Formas em vez de cores',
      sub: 'daltonismo total: bola, quadrado e triângulo',
      ligada: formas,
      ao: aoToggleFormas,
    },
    {
      titulo: 'Desativar animações e física',
      sub: 'o grafo assenta de imediato, sem movimento',
      ligada: semAnim,
      ao: aoToggleSemAnim,
    },
  ]
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {opcoes.map((pl) => {
          const ativa = paleta === pl.id
          return (
            <button
              key={pl.id}
              type="button"
              className="eg-paleta-opcao"
              onClick={() => aoEscolherPaleta(pl.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                width: '100%',
                padding: '7px 9px',
                border: `1px solid ${ativa ? 'var(--green)' : 'var(--pill-border)'}`,
                background: ativa ? 'var(--grafo-previa-bg)' : 'transparent',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'inline-flex', gap: 3, flex: 'none' }}>
                {['habilidade', 'conceito', 'disciplina'].map((t) => (
                  <span key={t} className={`eg-no-${t}`} style={{ width: 10, height: 10, background: pl.c[t] }} />
                ))}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: "700 12.5px/1.4 'Figtree', sans-serif", color: 'var(--text)' }}>
                  {pl.nome}
                </span>
                <span style={{ display: 'block', fontSize: 10.5, color: 'var(--faint)' }}>{pl.sub}</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, opacity: ativa ? 1 : 0 }}>✓</span>
            </button>
          )
        })}
      </div>
      <div style={{ borderTop: '1px dashed var(--pill-border)', marginTop: 9, paddingTop: 5 }}>
        {toggles.map((t) => (
          <button
            key={t.titulo}
            type="button"
            className="eg-toggle-linha"
            onClick={t.ao}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '7px 6px',
              border: 'none',
              background: 'transparent',
              borderRadius: 9,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: "700 12px/1.4 'Figtree', sans-serif", color: 'var(--text)' }}>
                {t.titulo}
              </span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--faint)' }}>{t.sub}</span>
            </span>
            <Chave ligada={t.ligada} />
          </button>
        ))}
      </div>
    </>
  )
}

// ---- Botão-swatch + popover de paleta (coluna de zoom) ----
export function PaletaPopover({ aberta, aoAlternar, paleta, formas, semAnim, ...acessibilidade }) {
  const custom = paleta !== 'padrao' || formas || semAnim
  return (
    <>
      <button
        type="button"
        className="eg-grafo-zoom"
        title="Cores do grafo — opções acessíveis para daltonismo"
        onClick={aoAlternar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: custom ? 'var(--green)' : undefined,
        }}
      >
        {/* swatch com as cores ATUAIS (tokens --no-*, já com override da paleta) */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="9" r="4.6" fill="var(--no-habilidade)" opacity="0.9" />
          <circle cx="15.5" cy="9.6" r="4.6" fill="var(--no-conceito)" opacity="0.82" />
          <circle cx="12" cy="15.4" r="4.6" fill="var(--no-disciplina)" opacity="0.82" />
        </svg>
      </button>
      {aberta && (
        <div
          style={{
            width: 262,
            background: 'var(--pill-bg)',
            border: '1px solid var(--pill-border)',
            borderRadius: 14,
            padding: '12px 13px',
            boxShadow: '0 14px 34px rgba(28,38,32,.14)',
            animation: 'egSurgir .14s ease',
          }}
        >
          <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Cores do grafo · daltonismo</div>
          <OpcoesAcessibilidade paleta={paleta} formas={formas} semAnim={semAnim} {...acessibilidade} />
          <p
            style={{
              margin: '9px 0 0',
              paddingTop: 8,
              borderTop: '1px dashed var(--pill-border)',
              fontSize: 10,
              lineHeight: 1.5,
              color: 'var(--faint)',
            }}
          >
            Paleta baseada no projeto Color Universal Design (CUD), de Okabe &amp; Ito.
          </p>
        </div>
      )}
    </>
  )
}
