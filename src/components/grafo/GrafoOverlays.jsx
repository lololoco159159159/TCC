import { NIVEIS } from '../../data/estiloGrafo'
import { PALETAS } from '../../data/paletas'
import { MONO_LABEL } from './estilos'
import Chave from '../Chave'
import PontoNo from './PontoNo'

// Overlays finais da página de grafos (G9) — porte fiel do protótipo
// (design/prototipo_grafo.html). Blocos pequenos e irmãos do palco num único
// módulo (exports nomeados):
//   • LegendaTipos — "Tipos de nó" (canto inferior direito). N6: lista os
//     rótulos do Neo4j presentes no grafo da tela, com contagem, cor e forma da
//     tabela de estilo; clicar oculta/mostra os nós do rótulo SÓ NO DESENHO.
//   • PaletaPopover — botão-swatch na coluna de zoom que abre o popover
//     "Cores do grafo · daltonismo" (Padrão/Protanopia/Deuteranopia/
//     Tritanopia, de src/data/paletas.js). A troca escreve os tokens --no-*
//     no <html> (efeito na página).
//   • OpcoesAcessibilidade (G10) — o miolo do popover, compartilhado com o
//     dropdown de perfil (GrafoPerfil): linhas de paleta + toggles "formas em
//     vez de cores" e "desativar animações e física". N6: as amostras mostram
//     os níveis da tabela de estilo (6 desde a D22: Ano, Área, Componente…); a forma
//     dos pontinhos DOM vem das classes .eg-forma-* + data-formas no <html>
//     (index.css).
// A gaveta "Cypher" (as últimas consultas que o site fez) saiu em 2026-11-27,
// junto com o console (pedido do autor).

// ---- Legenda "Tipos de nó" + ocultar por tipo (N6) ----
// Lista os tipos PRESENTES no grafo da tela (`rotulos`: { tipo, cor, forma,
// quantidade, oculto }). Desde a D21 o tipo é o NÍVEL (Ano, Área, Componente, Unidade
// temática…): as habilidades de todas as matérias ficam juntas num item; um
// rótulo de fora do modelo aparece com o próprio nome. Ocultar acontece só no
// desenho — a página filtra o que entrega ao canvas; uma consulta Cypher
// qualquer não tem como ser refiltrada automaticamente, então NÃO se reconsulta.
// Todos os tipos são alternáveis: no modelo do Neo4j, ocultar Habilidade não
// esvazia o grafo (revê a D7 — D15).
export function LegendaTipos({ rotulos, tiposTracejados, aoAlternar }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 228,
        background: 'var(--pill-bg)',
        border: '1px solid var(--pill-border)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 10px 26px rgba(28,38,32,.10)',
      }}
    >
      <div style={{ ...MONO_LABEL, marginBottom: 9 }}>Tipos de nó</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rotulos.map((r) => (
          <button
            key={r.tipo}
            type="button"
            className="eg-legenda-item"
            aria-pressed={!r.oculto}
            title={r.oculto ? 'Mostrar estes nós no desenho' : 'Ocultar estes nós do desenho (não refaz a consulta)'}
            onClick={() => aoAlternar(r.tipo)}
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
              opacity: r.oculto ? 0.45 : 1,
            }}
          >
            <PontoNo forma={r.forma} cor={`var(${r.cor})`} />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: 'left',
                font: "600 12.5px/1.4 'Figtree', sans-serif",
                color: 'var(--body)',
                textDecoration: r.oculto ? 'line-through' : 'none',
                overflowWrap: 'anywhere',
              }}
            >
              {r.tipo}
            </span>
            <span style={{ font: "10.5px/1 'JetBrains Mono', monospace", color: 'var(--faint)' }}>{r.quantidade}</span>
          </button>
        ))}
      </div>

      {/* chave de leitura das arestas: contínua; tracejada só se algum tipo da
          tela pedir (tabela de estilo) */}
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
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--faint)" strokeWidth="1.4" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>relação (a seta mostra o sentido)</span>
        </div>
        {tiposTracejados.length ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
              <line x1="0" y1="4" x2="20" y2="4" stroke="var(--faint)" strokeWidth="1.4" strokeDasharray="4 3" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>{tiposTracejados.join(', ')}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ---- Miolo de acessibilidade (paletas + formas + sem animação) ----
// Compartilhado entre o PaletaPopover e o dropdown de perfil (GrafoPerfil).
export function OpcoesAcessibilidade({ paleta, aoEscolherPaleta, formas, aoToggleFormas, semAnim, aoToggleSemAnim }) {
  // amostras: um pontinho por nível da tabela de estilo (cor + forma). A
  // linha "Padrão" lê os tokens de FÁBRICA (--no-X-padrao, do tema atual) —
  // não os --no-X, que estão sobrescritos quando outra paleta está ativa
  const opcoes = [
    { id: 'padrao', nome: 'Padrão', sub: 'cores do sistema', c: {} },
    { id: 'protanopia', nome: 'Protanopia', sub: 'dificuldade com vermelho', c: PALETAS.protanopia },
    { id: 'deuteranopia', nome: 'Deuteranopia', sub: 'dificuldade com verde', c: PALETAS.deuteranopia },
    { id: 'tritanopia', nome: 'Tritanopia', sub: 'dificuldade com azul', c: PALETAS.tritanopia },
  ]
  const toggles = [
    {
      titulo: 'Formas em vez de cores',
      sub: 'daltonismo total: losango, estrela, hexágono, quadrado, triângulo e círculo',
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
                {NIVEIS.map((e) => (
                  <PontoNo key={e.id} forma={e.forma} cor={pl.c[e.cor] || `var(${e.cor}-padrao)`} tamanho={10} />
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
        {/* swatch com as cores ATUAIS dos níveis (tokens --no-*, já com o
            override da paleta), em roda — 6 desde a D22 */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {NIVEIS.map((e, i) => {
            const a = -Math.PI / 2 + (2 * Math.PI * i) / NIVEIS.length
            return <circle key={e.id} cx={12 + 6.8 * Math.cos(a)} cy={12 + 6.8 * Math.sin(a)} r="3.9" fill={`var(${e.cor})`} opacity="0.9" />
          })}
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
