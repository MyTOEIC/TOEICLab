let currentSkill = 'tu-vung'; 

// --- 1. CHUYỂN TAB ---
function openTab(skillName) {
    document.querySelectorAll('.content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(skillName).classList.add('active');
    
    // Active nút menu
    const activeBtn = document.querySelector(`.nav-item[onclick="openTab('${skillName}')"]`);
    if(activeBtn) activeBtn.classList.add('active');

    const folderMap = { 'vocab': 'tu-vung', 'listening': 'nghe', 'speaking': 'noi', 'writing': 'viet', 'reading': 'doc' };
    currentSkill = folderMap[skillName];
    loadLessonData();
}

// --- 2. NẠP DỮ LIỆU ---
function loadLessonData() {
    const lessonID = document.getElementById('lesson-selector').value;
    const jsPath = `data/${currentSkill}/bai-${lessonID}/data.js`; 
    
    const oldScript = document.getElementById('data-loader');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.src = jsPath;
    script.id = 'data-loader';
    
    script.onload = function() {
        if (typeof window.lessonData !== 'undefined') {
            const data = window.lessonData;
            const folderPath = `data/${currentSkill}/bai-${lessonID}`;

            if (currentSkill === 'tu-vung') renderVocab(data);
            if (currentSkill === 'nghe') renderListening(data, folderPath);
            if (currentSkill === 'noi') renderSpeaking(data, folderPath);
            if (currentSkill === 'viet') renderWriting(data);
            if (currentSkill === 'doc') renderReading(data);
        }
    };

    script.onerror = function() {
        // Nếu lỗi, thông báo rõ ràng
        alert(`Không tìm thấy file: ${jsPath}\nHãy kiểm tra lại tên thư mục hoặc tên file data.js!`);
    };

    document.head.appendChild(script);
}

// --- 3. HIỂN THỊ (RENDER) ---

function renderVocab(data) {
    document.getElementById('vocab-topic').textContent = data.title;
    document.getElementById('vocab-text').innerHTML = data.content;
    const list = document.getElementById('vocab-list');
    list.innerHTML = '';
    
    data.items.forEach(w => {
        // Dùng link Google (Ổn định nhất nhờ thẻ meta referrer)
        const audioSrc = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${w.en}&tl=en`;
        
        list.innerHTML += `
            <div class="vocab-item">
                <strong style="color:var(--primary); font-size:1.2rem">${w.en}</strong> 
                <small>${w.pron}</small><br><span>${w.vi}</span>
                <button onclick="playSound('${audioSrc}')" 
                style="position:absolute; top:15px; right:15px; border:none; background:#f1f5f9; width:35px; height:35px; border-radius:50%; cursor:pointer;">
                    🔊
                </button>
            </div>`;
    });
}

// Hàm phát âm thanh chung
function playSound(url) {
    const audio = new Audio(url);
    audio.play().catch(e => alert("Lỗi âm thanh: " + e));
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
        quiz.innerHTML += `<label style="display:block; padding:8px"><input type="radio" name="r_ans" value="${idx}"> ${opt}</label>`;
    });
}
function checkReadingResult() {
    const sel = document.querySelector('input[name="r_ans"]:checked');
    const res = document.getElementById('read-result');
    if (!sel) return;
    res.innerHTML = parseInt(sel.value) == document.getElementById('read-quiz').dataset.ans ? 
        "<b style='color:green'>Đúng!</b>" : "<b style='color:red'>Sai!</b>";
}

window.onload = () => { openTab('vocab'); };
