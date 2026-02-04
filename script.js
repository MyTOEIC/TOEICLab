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
        // Tạo link Google TTS
        const audioSrc = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${w.en}&tl=en`;
        
        // Kiểm tra xem có từ loại không, nếu không có thì để trống
        const typeText = w.type ? `<span class="pos-tag">${w.type}</span>` : '';

        list.innerHTML += `
            <div class="vocab-item">
                <div style="margin-bottom: 5px;">
                    <strong style="color:var(--primary); font-size:1.2rem">${w.en}</strong>
                    ${typeText} </div>
                
                <small style="color:#666;">${w.pron}</small><br>
                <span style="font-size:1.05rem;">${w.vi}</span>
                
                <button onclick="playSound('${audioSrc}')" 
                style="position:absolute; top:20px; right:15px; border:none; background:#f1f5f9; width:35px; height:35px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;">
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

// --- CẬP NHẬT PHẦN SPEAKING (NÓI) ---

function renderSpeaking(data, path) {
    document.getElementById('speak-img').src = `${path}/${data.image}`;
    document.getElementById('speak-sample').src = `${path}/${data.audio}`;
    
    // Gọi hàm khởi tạo ghi âm
    setupRecorder();
}

// Hàm xử lý ghi âm
function setupRecorder() {
    const btnRecord = document.getElementById('btn-record');
    const btnStop = document.getElementById('btn-stop');
    const userAudio = document.getElementById('user-recording');
    
    let mediaRecorder;
    let audioChunks = [];

    // Reset nút về trạng thái ban đầu
    btnRecord.disabled = false;
    btnStop.disabled = true;
    
    // Gỡ bỏ sự kiện cũ (tránh bị lặp khi chuyển bài) bằng cách clone nút
    const newBtnRecord = btnRecord.cloneNode(true);
    const newBtnStop = btnStop.cloneNode(true);
    btnRecord.parentNode.replaceChild(newBtnRecord, btnRecord);
    btnStop.parentNode.replaceChild(newBtnStop, btnStop);

    // Gán sự kiện cho nút mới
    newBtnRecord.onclick = async () => {
        try {
            // Yêu cầu quyền truy cập Micro
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; // Xóa dữ liệu cũ

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                // Tạo file audio từ dữ liệu thu được
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                userAudio.src = audioUrl;
            };

            mediaRecorder.start();
            
            // Đổi trạng thái nút
            newBtnRecord.disabled = true;
            newBtnRecord.innerHTML = '<i class="fas fa-circle" style="color:red"></i> Đang thu...';
            newBtnStop.disabled = false;
            
        } catch (err) {
            console.error("Lỗi Micro:", err);
            alert("Không thể mở Micro! \nLý do: Trình duyệt chặn hoặc chưa cấp quyền.\nHãy thử chạy trên GitHub Pages (HTTPS).");
        }
    };

    newBtnStop.onclick = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            // Trả lại trạng thái nút
            newBtnRecord.disabled = false;
            newBtnRecord.innerHTML = '<i class="fas fa-microphone"></i> Thu âm lại';
            newBtnStop.disabled = true;
        }
    };
}

// --- GIỮ NGUYÊN CÁC PHẦN DƯỚI (Writing, Reading, window.onload...) ---
function renderWriting(data) {
    // ... (Code cũ giữ nguyên)
    document.getElementById('write-prompt').textContent = data.prompt;
    document.getElementById('write-sample-text').textContent = data.sample;
}
function showSample() { document.getElementById('write-sample').classList.remove('hidden'); }

function renderReading(data) {
    // ... (Code cũ giữ nguyên)
    document.getElementById('read-passage').innerText = data.passage;
    const quiz = document.getElementById('read-quiz');
    quiz.innerHTML = `<p><strong>${data.question}</strong></p>`;
    quiz.dataset.ans = data.answer;
    data.options.forEach((opt, idx) => {
        quiz.innerHTML += `<label style="display:block; padding:8px"><input type="radio" name="r_ans" value="${idx}"> ${opt}</label>`;
    });
}
function checkReadingResult() {
    // ... (Code cũ giữ nguyên)
    const sel = document.querySelector('input[name="r_ans"]:checked');
    const res = document.getElementById('read-result');
    if (!sel) return;
    res.innerHTML = parseInt(sel.value) == document.getElementById('read-quiz').dataset.ans ? 
        "<b style='color:green'>Đúng!</b>" : "<b style='color:red'>Sai!</b>";
}

window.onload = () => { openTab('vocab'); };

