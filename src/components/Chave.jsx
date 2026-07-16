// Interruptor 34×20 do protótipo (verde ligado, --edge desligado) — primitivo
// de UI compartilhado. Nasceu no GrafoOverlays (opções de acessibilidade da
// página de grafos) e passou a ser reusado pelo botão de acessibilidade das
// telas de conta (BotaoAcessibilidade), então virou um componente próprio.
// É só o visual do switch; quem controla o estado é o pai (o <button> que o
// envolve trata o clique e a semântica aria-pressed).
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

export default Chave
