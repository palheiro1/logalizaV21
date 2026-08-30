export type AudioSampleSource = "ago" | "a-nosa-fala";

export interface AudioSample {
  id: string;
  comarcaCode: string;
  audioUrl: string;
  recordUrl: string;
  source: AudioSampleSource;
  sourceLabel: string;
  sourceRecord: string;
  municipality: string;
  locality: string;
  speaker: string;
  recordedAt: string;
  recorder: string;
  topic: string;
  clipStart: number;
  clipEnd: number;
  transcriptExcerpt: string;
}

const AGO_AUDIO_BASE = "https://ilg.usc.gal/ago/audios";
const AGO_RECORD_BASE = "https://ilg.usc.gal/ago/app/mod/doFichaHTML.php?id=";
const CCG_BASE = "https://mapasonoro.consellodacultura.gal";

/**
 * Curated pilot catalogue. Audio remains on the institutions' servers and the
 * player only exposes the selected interval until the answer is revealed.
 */
export const audioSamples: AudioSample[] = [
  {
    id: "ago-001",
    comarcaCode: "BAM",
    audioUrl: `${AGO_AUDIO_BASE}/1.mp3`,
    recordUrl: `${AGO_RECORD_BASE}1`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 1",
    municipality: "O Rosal",
    locality: "Fornelos, Santa Marinha do Rosal",
    speaker: "Homem, 64 anos",
    recordedAt: "1981",
    recorder: "Francisco Fernández Rei",
    topic: "A rendibilidade da terra",
    clipStart: 14,
    clipEnd: 42,
    transcriptExcerpt:
      "E iso era a falta que tínhamos nós aqui, neste recuncho. Antes estávamos no milho, e venha milho; depois começaram a pôr tomates.",
  },
  {
    id: "ago-076",
    comarcaCode: "MOR",
    audioUrl: `${AGO_AUDIO_BASE}/76.mp3`,
    recordUrl: `${AGO_RECORD_BASE}76`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 76",
    municipality: "Cangas",
    locality: "Cangas",
    speaker: "Homem, 80 anos",
    recordedAt: "1994",
    recorder: "X. M. Moldes Graña",
    topic: "O jogo do corno",
    clipStart: 0.9,
    clipEnd: 29,
    transcriptExcerpt:
      "O corno, o jogo do corno. Sabes como era? Colhias um corno de uma vaca e aquele a quem lhe tocava tinha que pôr a mão assim.",
  },
  {
    id: "ago-026",
    comarcaCode: "TCH",
    audioUrl: `${AGO_AUDIO_BASE}/26.mp3`,
    recordUrl: `${AGO_RECORD_BASE}26`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 26",
    municipality: "Cospeito",
    locality: "Xustás",
    speaker: "Mulher, 83 anos, lavradora",
    recordedAt: "1997",
    recorder: "María José Tejeda Pérez",
    topic: "A guerra e a pós-guerra",
    clipStart: 0,
    clipEnd: 28,
    transcriptExcerpt:
      "A minha vida foi muito pobre, porque acordei na pós-guerra. Foi o meu marido à guerra e passou muitos trabalhos; caiu duas vezes ferido.",
  },
  {
    id: "ago-061",
    comarcaCode: "TME",
    audioUrl: `${AGO_AUDIO_BASE}/61.mp3`,
    recordUrl: `${AGO_RECORD_BASE}61`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 61",
    municipality: "Melide",
    locality: "Melide",
    speaker: "Mulher, 74 anos",
    recordedAt: "1992",
    recorder: "Daniel Asorey Vidal",
    topic: "A fome e a vida familiar",
    clipStart: 0,
    clipEnd: 27,
    transcriptExcerpt:
      "Havia outro galopim de outro filho, que era sapateiro mas não trabalhava, que gastava os quartos. Uma vez havia que fazer uns vestidos aos rapazes.",
  },
  {
    id: "ago-119",
    comarcaCode: "MAR",
    audioUrl: `${AGO_AUDIO_BASE}/119.mp3`,
    recordUrl: `${AGO_RECORD_BASE}119`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 119",
    municipality: "Mondonhedo",
    locality: "Argomoso",
    speaker: "Mulher, 40 anos, lavradora",
    recordedAt: "1994",
    recorder: "Mario Romero Triñanes",
    topic: "Receita do caldo galego",
    clipStart: 1.1,
    clipEnd: 29,
    transcriptExcerpt:
      "Hoje fiz o caldo galego. Vou-te dizer como se faz. Deixei as favas de molho do dia anterior e pus a panela com as favas e o toucinho.",
  },
  {
    id: "ago-024",
    comarcaCode: "VDO",
    audioUrl: `${AGO_AUDIO_BASE}/24.mp3`,
    recordUrl: `${AGO_RECORD_BASE}24`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 24",
    municipality: "O Barco de Valdeorras",
    locality: "Alixo",
    speaker: "Homem, 76 anos, reformado",
    recordedAt: "1997",
    recorder: "Xabier Roo Abril e M. Docampo Paradelo",
    topic: "A guerra e a pós-guerra",
    clipStart: 0,
    clipEnd: 24,
    transcriptExcerpt:
      "Havia duas cantinas, dois bares. Tínhamos aqui o comércio de ultramarinos e em cima tínhamos o bar. Naquela altura havia muita gente.",
  },
  {
    id: "ago-149",
    comarcaCode: "VIA",
    audioUrl: `${AGO_AUDIO_BASE}/149.mp3`,
    recordUrl: `${AGO_RECORD_BASE}149`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 149",
    municipality: "Viana do Bolo",
    locality: "Caldesinhos",
    speaker: "Homem, 80 anos",
    recordedAt: "2006",
    recorder: "Concepción Álvarez Pousa",
    topic: "As comparsas do Entrudo",
    clipStart: 0.7,
    clipEnd: 28,
    transcriptExcerpt:
      "Aqui faziam comparsas, talvez de dez ou quinze tipos. As mulheres também participavam, mas mais homens; alguns vestiam-se de mulher.",
  },
  {
    id: "ago-113",
    comarcaCode: "TNA",
    audioUrl: `${AGO_AUDIO_BASE}/113.mp3`,
    recordUrl: `${AGO_RECORD_BASE}113`,
    source: "ago",
    sourceLabel: "Arquivo do Galego Oral — ILG",
    sourceRecord: "Áudio 113",
    municipality: "Taramundi",
    locality: "Cancelos de Arriba",
    speaker: "Rapaz, 12 anos, estudante",
    recordedAt: "2012",
    recorder: "Ana García García",
    topic: "As abelhas e o mel",
    clipStart: 0.7,
    clipEnd: 29,
    transcriptExcerpt:
      "Das abelhas sempre fui muito afeiçoado, porque o meu avô e o meu pai também eram, e sempre gostaram muito; eu hei de seguir a tradição.",
  },
  {
    id: "ccg-385",
    comarcaCode: "ANC",
    audioUrl: `${CCG_BASE}/files/peza/url/385/a_nosa_fala_cd_2_10_vario_texos.mp3`,
    recordUrl: `${CCG_BASE}/pezas/index/385/2`,
    source: "a-nosa-fala",
    sourceLabel: "A nosa fala — CCG / ILG",
    sourceRecord: "Peça 385",
    municipality: "Candín",
    locality: "Pareda de Ancares",
    speaker: "Rapaz, 9 anos, estudante",
    recordedAt: "1984",
    recorder: "B. Arias Freixeiro e X. M. Gómez Clemente",
    topic: "Encontro com um javali",
    clipStart: 13.1,
    clipEnd: 37.1,
    transcriptExcerpt:
      "Fomos eu e outro menino a um pinhal e vimos um javali, uma fêmea com crias. Eu disse ao outro que fosse pelo lado de cima.",
  },
  {
    id: "ccg-388",
    comarcaCode: "SEA",
    audioUrl: `${CCG_BASE}/files/peza/url/388/a_nosa_fala_cd_2_13_varios_textos.mp3`,
    recordUrl: `${CCG_BASE}/pezas/index/388/2`,
    source: "a-nosa-fala",
    sourceLabel: "A nosa fala — CCG / ILG",
    sourceRecord: "Peça 388",
    municipality: "Lubián",
    locality: "Lubián",
    speaker: "Homem, aproximadamente 35 anos, professor",
    recordedAt: "1990",
    recorder: "M. A. Seixas para o programa As de ouros da TVG",
    topic: "O galego das Portelas",
    clipStart: 15,
    clipEnd: 43,
    transcriptExcerpt:
      "O galego desta zona é com toda a segurança diferente do galego que agora se está normativizando. Como falou o meu avô e falou o meu pai, eu seguirei falando sempre.",
  },
];

export function getAudioSampleById(id: string | null): AudioSample | undefined {
  if (!id) {
    return undefined;
  }

  return audioSamples.find((sample) => sample.id === id);
}
