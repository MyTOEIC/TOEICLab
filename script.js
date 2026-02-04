let currentSkill = 'tu-vung'; 

// --- 1. CHỨC NĂNG CHUYỂN TAB ---
function openTab(skillName) {
    // Ẩn nội dung cũ
    document.querySelectorAll('.content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    // Hiện nội dung mới
    document.getElementById(skillName).classList.add('active');
    
    // Active nút bấm bên trái (nếu click chuột)
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Active nút đầu tiên nếu chạy tự động
        document.querySelector(`.nav-item[onclick="openTab('${skillName}')"]`).classList.add('active');
    }

    // Map tên tab sang tên folder
    const folderMap = { 
        'vocab': 'tu-vung', 
        'listening': 'nghe', 
        'speaking': 'noi', 
        'writing': 'viet', 
        'reading': 'doc' 
    };
    currentSkill = folderMap[skillName];
    
    // Tải dữ liệu ngay
    loadLessonData();
}

// --- 2. HÀM NẠP DỮ LIỆU (Dùng file .js để không bị lỗi CORS trên GitHub) ---
function loadLessonData() {
    const lessonID = document.getElementById('lesson-selector').value;
    const jsPath = `data/${currentSkill}/bai-${lessonID}/data.js`; 
    
    // Xóa thẻ script cũ nếu có để tránh trùng lặp
    const oldScript = document.getElementById('data-loader');
    if (oldScript) oldScript.remove();

    // Tạo thẻ script mới
    const script = document.createElement('script');
    script.src = jsPath;
    script.id = 'data-loader';
    
    script.onload = function() {
        console.log("Đã tải: " + jsPath);
        
        // Lấy dữ liệu từ file data.js vừa nạp
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
        alert("Chưa có bài học này (" + jsPath + ") hoặc đường dẫn bị sai!");
        if(currentSkill === 'tu-vung') document.getElementById('vocab-topic').textContent = "Không tìm thấy dữ liệu";
    };

    document.head.appendChild(script);
}

// --- 3. CÁC HÀM HIỂN THỊ GIAO DIỆN (RENDER) ---

// Xử lý TỪ VỰNG (Đã sửa lỗi phát âm cho GitHub)
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
                
                <button onclick="speakWord('${w.en}')" 
                style="position:absolute; top:15px; right:15px; border:none; background:#f1f5f9; width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:16px;">
                    🔊
                </button>
            </div>`;
    });
}

// Hàm đọc văn bản (Chạy được trên mọi trình duyệt/GitHub mà không cần link Google)
function speakWord(text) {
    window.speechSynthesis.cancel(); // Dừng câu cũ
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; 
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// Xử lý NGHE
function renderListening(data, path) {
    document.getElementById('listen-img').src = `${path}/${data.image}`;
    document.getElementById('listen-audio').src = `${path}/${data.audio}`;
    document.getElementById('transcript').textContent = data.transcript;
}
function toggleTranscript() {
    const t = document.getElementById('transcript');
    t.style.display = t.style.display === 'none' ? 'block' : 'none';
}

// Xử lý NÓI
function renderSpeaking(data, path) {
    document.getElementById('speak-img').src = `${path}/${data.image}`;
    document.getElementById('speak-sample').src = `${path}/${data.audio}`;
    // Phần ghi âm có thể phát triển thêm sau
}

// Xử lý VIẾT
function renderWriting(data) {
    document.getElementById('write-prompt').textContent = data.prompt;
    document.getElementById('write-sample-text').textContent = data.sample;
}
function showSample() { 
    document.getElementById('write-sample').classList.remove('hidden'); 
}

// Xử lý ĐỌC
function renderReading(data) {
    document.getElementById('read-passage').innerText = data.passage;
    const quiz = document.getElementById('read-quiz');
    quiz.innerHTML = `<p><strong>${data.question}</strong></p>`;
    
    // Lưu đáp án đúng vào data attribute
    quiz.dataset.ans = data.answer;
    
    data.options.forEach((opt, idx) => {
        quiz.innerHTML += `
            <label style="display:block; padding:8px; cursor:pointer">
                <input type="radio" name="r_ans" value="${idx}"> ${opt}
            </label>`;
    });
}

function checkReadingResult() {
    const sel = document.querySelector('input[name="r_ans"]:checked');
    const res = document.getElementById('read-result');
    
    if (!sel) return alert("Bạn chưa chọn đáp án!");
    
    const userAns = parseInt(sel.value);
    const correctAns = parseInt(document.getElementById('read-quiz').dataset.ans);

    if (userAns === correctAns) {
        res.innerHTML = "<b style='color:green'>Chính xác! Good job!</b>";
    } else {
        res.innerHTML = "<b style='color:red'>Sai rồi. Thử lại nhé!</b>";
    }
}

// --- 4. CHẠY LẦN ĐẦU KHI MỞ WEB ---
window.onload = () => { 
    openTab('vocab'); 
};
