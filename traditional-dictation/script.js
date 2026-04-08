const words = [
    { s: "忧虑", t: "憂慮" },
    { s: "发展", t: "發展" },
    { s: "繁体", t: "繁體" },
    { s: "练习", t: "練習" },
    { s: "书写", t: "書寫" },
    { s: "中华", t: "中華" },
    { s: "艺术", t: "藝術" },
    { s: "听写", t: "聽寫" },
    { s: "归还", t: "歸還" },
    { s: "赞叹", t: "贊嘆" },
    { s: "学习", t: "學習" },
    { s: "历史", t: "歷史" },
    { s: "胜利", t: "勝利" },
    { s: "欢笑", t: "歡笑" },
    { s: "团结", t: "團結" },
    { s: "辽阔", t: "遼闊" },
    { s: "丰富", t: "豐富" },
    { s: "灿烂", t: "燦爛" },
    { s: "帮助", t: "幫助" },
    { s: "优雅", t: "優雅" },
    { s: "犹豫", t: "猶豫" },
    { s: "惊艳", t: "驚艷" },
    { s: "梦想", t: "夢想" },
    { s: "礼貌", t: "禮貌" },
    { s: "准备", t: "準備" },
    { s: "飞翔", t: "飛翔" },
    { s: "连续", t: "連續" },
    { s: "广阔", t: "廣闊" },
    { s: "繁华", t: "繁華" },
    { s: "荣誉", t: "榮譽" },
    { s: "勤奋", t: "勤奮" },
    { s: "谦虚", t: "謙虛" },
    { s: "键盘", t: "鍵盤" },
    { s: "电脑", t: "電腦" },
    { s: "软件", t: "軟件" },
    { s: "台湾", t: "台灣" },
    { s: "凤凰", t: "鳳凰" },
    { s: "乌鸦", t: "烏鴉" },
    { s: "边疆", t: "邊疆" },
    { s: "酿造", t: "釀造" },
    { s: "郁郁葱葱", t: "鬱鬱蔥蔥" },
    { s: "龙马精神", t: "龍馬精神" },
    { s: "万马奔腾", t: "萬馬奔騰" }
];

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') || '2';

const modeConfigs = {
    '1': {
        title: '繁体字听写练习',
        instr: '请根据显示的“一简字”，在左侧画板写出其对应的“繁体字”，完成后对比答案。',
        labels: ['一简字', '繁体字'],
        check: '显示答案',
        next: '下一题',
        clear: '清空画板',
        hint: '请在上方区域书写'
    },
    '2': {
        title: '繁体字听写练习',
        instr: '请根据显示的“简体字”，在左侧画板写出其对应的“繁体字”，完成后对比答案。',
        labels: ['简体字', '繁体字'],
        check: '显示答案',
        next: '下一题',
        clear: '清空画板',
        hint: '请在上方区域书写'
    },
    '3': {
        title: '正體字聽寫練習',
        instr: '請根據顯示的“簡體字”，在左側畫板寫出其對應的“正體字”，完成後對比答案。',
        labels: ['簡體字', '正體字'],
        check: '顯示答案',
        next: '下一題',
        clear: '清空畫板',
        hint: '請在上方區域書寫'
    },
    '4': {
        title: '正體字聽寫練習',
        instr: '請根據顯示的“殘體字”，在左側畫板寫出其對應的“正體字”，完成後對比答案。',
        labels: ['殘體字', '正體字'],
        check: '顯示答案',
        next: '下一題',
        clear: '清空畫板',
        hint: '請在上方區域書寫'
    },
    'ja': {
        title: '旧字体聴写練習',
        instr: '表示された「新字体」に基づき、左側の画板に「旧字体」を書いてください。',
        labels: ['新字体', '旧字体'],
        check: '答えを表示',
        next: '次の題',
        clear: 'クリア',
        hint: 'ここに書いてください'
    },
    'jp': {
        title: '旧字体聴写練習',
        instr: '表示された「新字体」に基づき、左側の画板に「旧字体」を書いてください。',
        labels: ['新字体', '旧字体'],
        check: '答えを表示',
        next: '次の題',
        clear: 'クリア',
        hint: 'ここに書いてください'
    }
};

const config = modeConfigs[mode] || modeConfigs['2'];

// Update UI Text
document.querySelector('h1').textContent = config.title;
document.querySelector('.instruction').textContent = config.instr;
document.getElementById('label-simplified').textContent = config.labels[0];
document.getElementById('label-traditional').textContent = config.labels[1] + (mode === 'ja' || mode === 'jp' ? ' (参考)' : ' (参考)');
document.getElementById('check-btn').textContent = config.check;
document.getElementById('next-btn').textContent = config.next;
document.getElementById('clear-btn').textContent = config.clear;
document.querySelector('.canvas-hint').textContent = config.hint;

let currentIndex = -1;
const canvas = document.getElementById('writing-pad');
const ctx = canvas.getContext('2d');
const simplifiedEl = document.getElementById('simplified-word');
const traditionalEl = document.getElementById('traditional-word');
const resultDisplay = document.getElementById('result-display');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const clearBtn = document.getElementById('clear-btn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Setup Canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    clearCanvas();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
}

// Drawing logic
function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    [lastX, lastY] = [pos.x, pos.y];
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    [lastX, lastY] = [pos.x, pos.y];
}

function stopDrawing() {
    isDrawing = false;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Game logic
function nextWord() {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * words.length);
    } while (nextIndex === currentIndex);
    
    currentIndex = nextIndex;
    simplifiedEl.textContent = words[currentIndex].s;
    traditionalEl.textContent = words[currentIndex].t;
    
    resultDisplay.classList.add('hidden');
    checkBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    clearCanvas();
}

function showAnswer() {
    resultDisplay.classList.remove('hidden');
    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
}, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

checkBtn.addEventListener('click', showAnswer);
nextBtn.addEventListener('click', nextWord);
clearBtn.addEventListener('click', clearCanvas);

// Init
resizeCanvas();
nextWord();
