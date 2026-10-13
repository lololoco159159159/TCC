// Pontinho de rótulo de nó (N6/N7): a cor (token CSS ou valor) e a forma da
// tabela de estilo. A forma só aparece no modo "formas em vez de cores"
// (classes .eg-forma-* + data-formas no <html>); fora dele, todos são círculos.
// Primitivo compartilhado: legenda e amostras de paleta (GrafoOverlays) e
// painel de detalhe (GrafoPainel).
function PontoNo({ forma, cor, tamanho = 11 }) {
  return <span className={`eg-forma-${forma}`} style={{ width: tamanho, height: tamanho, background: cor, flex: 'none' }} />
}

export default PontoNo
