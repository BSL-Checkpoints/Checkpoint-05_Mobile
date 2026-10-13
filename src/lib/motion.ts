/**
 * MOVIMENTO DO APP — a fonte ÚNICA de durações, molas e regras (RF-55, RF-62).
 *
 * Nenhum componente escreve `duration: 200` ou `damping: 12` por conta própria.
 * Se o movimento é identidade do app, ele tem de ser mudado em UM lugar.
 *
 * Três modos, decididos aqui e em mais nenhum lugar:
 *   'full'    movimento completo (molas, escalonado, deslocamento)
 *   'reduced' "Reduzir movimento" do sistema ligado: o MOVIMENTO é trocado por um fade
 *             curto de opacidade. O feedback continua — só não há deslocamento nem mola.
 *   'off'     ANIMATIONS_ENABLED = false: nada anima. O feedback continua, instantâneo
 *             (o botão escurece, o coração muda de cor, o item some).
 *
 * ATENÇÃO (Reanimated 4 / SDK 54): NÃO existe `react-native-reanimated/plugin` no
 * babel.config.js. O babel-preset-expo já inclui o plugin de worklets. Adicionar o
 * antigo compila sem erro e quebra na execução.
 */
import {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutRight,
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

/**
 * CHAVE GERAL: `false` desliga TODAS as animações do app (RF-55).
 * Útil para testar o app sem movimento e para a arguição.
 */
export const ANIMATIONS_ENABLED = true;

export const MOTION = {
  /** Controles que respondem ao toque (botões, cards, ícones). */
  press: {
    scale: 0.95,
    spring: { damping: 18, stiffness: 400, mass: 0.6 },
    /** No modo reduzido/desligado o "afundar" vira escurecer. */
    dimOpacity: 0.6,
    dimMs: 90,
  },
  /** Confirmação visual do favoritar (o "pulo" do coração). */
  pop: {
    scale: 1.3,
    up: { damping: 6, stiffness: 300 },
    settle: { damping: 12, stiffness: 220 },
    flashMs: 140,
  },
  /** Fade curto: a troca para quem reduziu o movimento. */
  fadeMs: 180,
  /** Entrada escalonada de lista. O atraso tem TETO: o item 50 não espera 3 segundos. */
  stagger: { stepMs: 60, maxItems: 8, damping: 16, stiffness: 140 },
  /** Saída de item removido e acomodação dos que ficam. */
  exitMs: 220,
  layout: { damping: 18, stiffness: 160 },
  /** "Sinal de vida" do carregamento. */
  loading: { dotMs: 350, dotGapMs: 140, dimOpacity: 0.25 },
} as const;

export type MotionMode = 'full' | 'reduced' | 'off';

/** O modo atual: constante geral + preferência "Reduzir movimento" do sistema. */
export function useMotionMode(): MotionMode {
  const reducedBySystem = useReducedMotion();
  if (!ANIMATIONS_ENABLED) return 'off';
  return reducedBySystem ? 'reduced' : 'full';
}

// Os fades do modo reduzido precisam rodar MESMO com "Reduzir movimento" ligado: são o
// substituto do movimento. Sem isso o Reanimated pularia a animação inteira.
const ALWAYS = ReduceMotion.Never;

/** Entrada de um item da lista (escalonada, com teto no atraso). */
export function listEntering(index: number, mode: MotionMode) {
  if (mode === 'off' || index >= MOTION.stagger.maxItems) return undefined;
  if (mode === 'reduced') return FadeIn.duration(MOTION.fadeMs).reduceMotion(ALWAYS);
  return FadeInDown.delay(index * MOTION.stagger.stepMs)
    .springify()
    .damping(MOTION.stagger.damping)
    .stiffness(MOTION.stagger.stiffness);
}

/** Saída de um item removido. */
export function itemExiting(mode: MotionMode) {
  if (mode === 'off') return undefined;
  if (mode === 'reduced') return FadeOut.duration(MOTION.fadeMs).reduceMotion(ALWAYS);
  return FadeOutRight.duration(MOTION.exitMs);
}

/** Como os itens que ficam se acomodam. No modo reduzido eles simplesmente ocupam o lugar. */
export function itemLayout(mode: MotionMode) {
  if (mode !== 'full') return undefined;
  return LinearTransition.springify().damping(MOTION.layout.damping).stiffness(MOTION.layout.stiffness);
}
