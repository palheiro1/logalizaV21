import { galicianComarcas } from "../domain/comarcas.position";

// Função auxiliar que preenche um número com 2 dígitos (ex: 5 -> "05")
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

// Função que formata a data no padrão YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Função que incrementa a data em um dia
function addDay(date) {
    return new Date(date.setDate(date.getDate() + 1));
}

// Data inicial
let today = new Date();

// Cria uma cópia da lista de comarcas para não modificar a original
const comarcas = [...galicianComarcas];

// Objeto para armazenar as comarcas associadas a cada dia
const comarcasDia = {};

// Set para controlar comarcas já utilizadas
const comarcasUsadas = new Set();

// Continua até todas as comarcas serem utilizadas
while (comarcasUsadas.size < comarcas.length) {
    // Filtra apenas as comarcas ainda não utilizadas
    const comarcasDisponiveis = comarcas.filter(c => !comarcasUsadas.has(c.code));
    
    // Se não há mais comarcas disponíveis, encerra o loop
    if (comarcasDisponiveis.length === 0) {
        console.warn("Todas as comarcas já foram utilizadas");
        break;
    }

    // Seleciona uma comarca aleatória diretamente do array filtrado
    // Isso evita o problema de números aleatórios fora do intervalo
    const indiceAleatorio = Math.floor(Math.random() * comarcasDisponiveis.length);
    const comarcaEscolhida = comarcasDisponiveis[indiceAleatorio];

    // Formata a data e registra a comarca escolhida
    const dataFormatada = `"${formatDate(today)}"`;
    comarcasDia[dataFormatada] = comarcaEscolhida.code;
    
    // Marca a comarca como utilizada
    comarcasUsadas.add(comarcaEscolhida.code);

    // Debug: mostra progresso
    console.log(`${comarcasUsadas.size}/${comarcas.length} comarcas utilizadas`);
    
    // Avança para o próximo dia
    today = addDay(today);
}

// Exibe o resultado final
console.log(JSON.stringify(comarcasDia, null, 2));

export { comarcasDia };

