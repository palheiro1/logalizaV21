import { galicianComarcas } from "../domain/comarcas.position";

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate())
  ].join('-');
}

function addDay(date) {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  return result;
}

let today = new Date();
const comarcas = galicianComarcas;
const comarcasDia = {};

while (comarcas.length > 0) {
  const random = Math.floor((Math.random() * 100)) % comarcas.length;
  const formattedDay = "\"" + formatDate(today) + "\"";
  comarcasDia[formattedDay] = comarcas[random].code;
  comarcas.splice(random, 1);
  today = addDay(today);
}

// Log to console
console.log(comarcasDia);

export { };


// BASH 
// for i in */ .*/ ; do 
//     echo -n $i": " ; 
//     (find "$i" -type f | wc -l) ; 
// done
