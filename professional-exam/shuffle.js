const fs = require('fs');
const filePath = 'js/dataProductSorter.js';

let content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/([\s\S]*?const\s+productSorterExamsData\s*=\s*)([\s\S]+);[\s\S]*/);
if (!match) {
    console.log('Error matching');
    process.exit(1);
}

const header = match[1];
const arrayString = match[2];

let examsData = eval(arrayString);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

examsData.forEach(model => {
    model.questions.forEach(q => {
        const correctOpt = q.options[q.correctAnswer];

        let newOptions = [...q.options];
        shuffleArray(newOptions);

        q.options = newOptions;
        q.correctAnswer = newOptions.indexOf(correctOpt);
    });
});

let newJsonStr = JSON.stringify(examsData, null, 4);
newJsonStr = newJsonStr.replace(/\"(id|title|description|questions|text|options|correctAnswer)\":/g, '$1:');

const newContent = header + newJsonStr + ';\n';
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done');
