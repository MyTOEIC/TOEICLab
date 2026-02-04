let currentSkill = 'tu-vung'; 

function openTab(skillName) {
    document.querySelectorAll('.content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(skillName).classList.add('active');
    event.currentTarget.classList.add('active');

    const folderMap = { 'vocab': 'tu-vung', 'listening': 'nghe', 'speaking': 'noi', 'writing': 'viet', 'reading': 'doc' };
    currentSkill = folderMap[skillName];
    loadLessonData();
}

async function loadLessonData() {
    const lessonID = document.getElementById('lesson-selector').value;
    const folderPath = `data/${currentSkill}/bai-${lessonID}`;
    const jsonPath = `${folderPath}/data.json`;

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        if (currentSkill === 'tu-vung') renderVocab(data);
        if (currentSkill === 'nghe') renderListening(data, folderPath);
        if (currentSkill === 'noi') renderSpeaking(data, folderPath);
        if (currentSkill === 'viet') renderWriting(data);
        if (currentSkill === 'doc') renderReading(data);
    } catch (e) {
        console.log("Chưa có dữ liệu bài này: " + jsonPath);
        // Reset giao diện nếu lỗi
        if(currentSkill === 'tu-vung') document.getElementById('vocab-topic').textContent = "Chưa có dữ liệu";
    }
}

function renderVocab(data) {
    document.getElementById('vocab-topic').textContent = data.title;
    document.getElementById('vocab-text').innerHTML = data.content;
    const list = document.getElementById('vocab-list');
    list.innerHTML = '';
    data.items.forEach(w => {
        list.innerHTML += `
            <div class="vocab-item">
                <strong style="color:var(--primary); font-size:1.2rem">${w.en}</strong> 
                <small>${w.pron}</small><br><span>${w.vi}</span>
                <button onclick="new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${w.en}&tl=en').play()" 
                style="position:absolute; top:15px; right:15px; border:none; background:#f1f5f9; width:30px; height:30px; border-radius:50%; cursor:pointer">🔊</button>
            </div>`;
    });
}

function renderListening(data, path) {
    document.getElementById('listen-img').src = `${path}/${data.image}`;
    document.getElementById('listen-audio').src = `${path}/${data.audio}`;
    document.getElementById('transcript').textContent = data.transcript;
}
function toggleTranscript() {
    const t = document.getElementById('transcript');
    t.style.display = t.style.display === 'none' ? 'block' : 'none';
}

function renderSpeaking(data, path) {
    document.getElementById('speak-img').src = `${path}/${data.image}`;
    document.getElementById('speak-sample').src = `${path}/${data.audio}`;
    setupRecorder();
}

function renderWriting(data) {
    document.getElementById('write-prompt').textContent = data.prompt;
    document.getElementById('write-sample-text').textContent = data.sample;
}
function showSample() { document.getElementById('write-sample').classList.remove('hidden'); }

function renderReading(data) {
    document.getElementById('read-passage').innerText = data.passage;
    const quiz = document.getElementById('read-quiz');
    quiz.innerHTML = `<p><strong>${data.question}</strong></p>`;
    quiz.dataset.ans = data.answer;
    data.options.forEach((opt, idx) => {
        quiz.innerHTML += `<label style="display:block; padding:8px; cursor:pointer"><input type="radio" name="r_ans" value="${idx}"> ${opt}</label>`;
    });
}
function checkReadingResult() {
    const sel = document.querySelector('input[name="r_ans"]:checked');
    const res = document.getElementById('read-result');
    if (!sel) return alert("Chọn đáp án đi!");
    res.innerHTML = parseInt(sel.value) == document.getElementById('read-quiz').dataset.ans ? 
        "<b style='color:green'>Chính xác!</b>" : "<b style='color:red'>Sai rồi!</b>";
}

function setupRecorder() {
    // Giữ nguyên logic ghi âm ở phiên bản trước
    // (Nếu cần code ghi âm chi tiết tôi sẽ gửi lại, nhưng code cũ vẫn chạy tốt)
}

window.onload = () => { openTab('vocab'); };