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

// Thay thế hàm renderVocab cũ bằng hàm này:
function renderVocab(data) {
    document.getElementById('vocab-topic').textContent = data.title;
    
    // 1. Xử lý phần ĐOẠN VĂN (Bài đọc)
    const readingCard = document.querySelector('.reading-card');
    
    // Lưu nội dung tiếng Anh và tiếng Việt vào biến tạm để dùng cho nút bấm
    const englishText = data.content;
    const vietnameseText = data.content_vi || "Chưa có bản dịch cho bài này.";

    // Cập nhật HTML cho thẻ Reading Card (Thêm nút điều khiển)
    readingCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3><i class="fas fa-align-left"></i> Đoạn văn ứng dụng</h3>
            <div class="control-btns">
                <button onclick="readParagraph()" class="btn-icon" title="Nghe đoạn văn">
                    <i class="fas fa-volume-up"></i> Nghe
                </button>
                <button onclick="toggleTrans()" class="btn-icon" title="Xem dịch nghĩa">
                    <i class="fas fa-language"></i> Dịch
                </button>
            </div>
        </div>
        
        <p id="vocab-text" style="font-size:1.05rem; line-height:1.6; margin-bottom:15px;">
            ${englishText}
        </p>
        
        <div id="vocab-trans" style="display:none; border-top:1px dashed #ccc; padding-top:10px; color:#555; font-style:italic;">
            ${vietnameseText}
        </div>
    `;

    // 2. Xử lý phần DANH SÁCH TỪ VỰNG (Giữ nguyên logic cũ)
    const list = document.getElementById('vocab-list');
    list.innerHTML = '';
    
    data.items.forEach(w => {
        const audioSrc = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${w.en}&tl=en`;
        const typeText = w.type ? `<span class="pos-tag">${w.type}</span>` : '';

        list.innerHTML += `
            <div class="vocab-item">
                <div style="margin-bottom: 5px;">
                    <strong style="color:var(--primary); font-size:1.2rem">${w.en}</strong>
                    ${typeText}
                </div>
                <small style="color:#666;">${w.pron}</small><br>
                <span style="font-size:1.05rem;">${w.vi}</span>
                <button onclick="playSound('${audioSrc}')" 
                style="position:absolute; top:20px; right:15px; border:none; background:#f1f5f9; width:35px; height:35px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;">
                    🔊
                </button>
            </div>`;
    });
}

// --- CÁC HÀM HỖ TRỢ MỚI ---

// Hàm đọc đoạn văn (Tự động lọc bỏ thẻ HTML <b> để đọc mượt)
function readParagraph() {
    window.speechSynthesis.cancel();
    
    // Lấy nội dung HTML hiện tại
    const htmlContent = document.getElementById('vocab-text').innerHTML;
    
    // Mẹo: Tạo thẻ div ảo để lấy text thuần (bỏ hết <b>, <i>...)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const cleanText = tempDiv.textContent || tempDiv.innerText;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US'; 
    utterance.rate = 0.9; // Đọc chậm rãi
    window.speechSynthesis.speak(utterance);
}

// Hàm hiện/ẩn bản dịch
function toggleTrans() {
    const transDiv = document.getElementById('vocab-trans');
    if (transDiv.style.display === 'none') {
        transDiv.style.display = 'block';
        transDiv.classList.add('fade-in'); // Thêm hiệu ứng hiện dần
    } else {
        transDiv.style.display = 'none';
    }
}

// Hàm phát âm thanh chung
function playSound(url) {
    const audio = new Audio(url);
    audio.play().catch(e => alert("Lỗi âm thanh: " + e));
}

// --- LOGIC LISTENING MỚI (Đã sửa lỗi hiển thị) ---

function renderListening(data, path) {
    const container = document.getElementById('listening');
    
    // 1. Kiểm tra xem có dữ liệu items không
    if (!data.items || data.items.length === 0) {
        container.innerHTML = "<h3>Chưa có dữ liệu bài nghe.</h3>";
        return;
    }

    // 2. Vẽ khung chứa
    container.innerHTML = `
        <div class="card-header">
            <h2><i class="fas fa-headphones"></i> ${data.title}</h2>
        </div>
        <div id="listening-list" class="listening-container"></div>
    `;

    const list = document.getElementById('listening-list');

    // 3. Duyệt qua từng bài nghe
    data.items.forEach((group, index) => {
        // Tạo HTML Ảnh (nếu có) và Audio
        let htmlImage = group.image ? `<img src="${path}/${group.image}" class="listening-img">` : '';
        let htmlAudio = `<audio controls src="${path}/${group.audio}" class="listening-audio"></audio>`;
        
        // Tạo câu hỏi trắc nghiệm
        let htmlQuestions = '';
        
        // --- XỬ LÝ PART 1 & 2 (Câu hỏi đơn) ---
        if (data.part === 1 || data.part === 2) {
            // Kiểm tra xem có options không để tránh lỗi
            if(group.options) {
                htmlQuestions += createQuizHTML(index, "Chọn đáp án đúng:", group.options, group.answer);
            }
        } 
        // --- XỬ LÝ PART 3 & 4 (Chùm câu hỏi) ---
        else if ((data.part === 3 || data.part === 4) && group.questions) {
            group.questions.forEach((q, qIndex) => {
                htmlQuestions += createQuizHTML(`${index}_${qIndex}`, `${qIndex+1}. ${q.question}`, q.options, q.answer);
            });
        }

        // Xử lý Transcript
        const transID = `trans-${index}`;
        // Nếu không có transcript thì để chuỗi rỗng
        const transText = group.transcript ? group.transcript.replace(/\n/g, '<br>') : "Chưa có nội dung transcript.";

        let htmlTranscript = `
            <div class="transcript-wrapper" style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
                <button onclick="toggleListeningScript('${transID}')" class="btn-toggle-script" style="background:none; border:none; color:blue; cursor:pointer;">
                    <i class="fas fa-file-alt"></i> Xem Transcript
                </button>
                <div id="${transID}" class="transcript-content" style="display:none; margin-top:10px; background:#f9f9f9; padding:10px; border-left:3px solid blue;">
                    ${transText}
                </div>
            </div>
        `;

        // Ghép vào giao diện
        list.innerHTML += `
            <div class="listening-group" style="background:white; padding:20px; margin-bottom:20px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="color:#4f46e5; margin-bottom:10px;"># Audio ${index + 1}</h3>
                ${htmlImage}
                ${htmlAudio}
                <div class="quiz-area">${htmlQuestions}</div>
                ${htmlTranscript}
            </div>
        `;
    });
}

// Hàm tạo câu hỏi trắc nghiệm
function createQuizHTML(nameID, questionText, options, correctAnswerIndex) {
    let htmlOpts = '';
    options.forEach((opt, i) => {
        const label = ["(A)", "(B)", "(C)", "(D)"][i];
        // Thêm onclick để check đáp án
        htmlOpts += `
            <label style="display:block; padding:8px; cursor:pointer; border:1px solid #eee; margin:5px 0; border-radius:5px;">
                <input type="radio" name="ans_${nameID}" value="${i}" onclick="checkListeningAnswer(this, ${correctAnswerIndex})"> 
                <b>${label}</b> ${opt}
            </label>`;
    });

    return `
        <div class="quiz-item" style="margin-bottom:15px;">
            <strong class="quiz-question" style="display:block; margin-bottom:5px;">${questionText}</strong>
            <div class="quiz-options">${htmlOpts}</div>
        </div>`;
}

// Hàm kiểm tra đúng sai (Tô màu)
function checkListeningAnswer(inputElement, correctIndex) {
    const userChoice = parseInt(inputElement.value);
    const container = inputElement.closest('.quiz-options');
    const labels = container.querySelectorAll('label');

    // Reset màu cũ
    labels.forEach(lbl => lbl.style.background = 'transparent');

    // Tô màu
    if (userChoice === correctIndex) {
        inputElement.parentElement.style.background = '#dcfce7'; // Xanh (Đúng)
    } else {
        inputElement.parentElement.style.background = '#fee2e2'; // Đỏ (Sai)
        // Hiện đáp án đúng
        if(labels[correctIndex]) labels[correctIndex].style.background = '#dcfce7';
    }
}

// Hàm bật tắt transcript
function toggleListeningScript(id) {
    const div = document.getElementById(id);
    div.style.display = (div.style.display === 'none') ? 'block' : 'none';
}
// Biến lưu trữ bộ ghi âm cho nhiều câu hỏi khác nhau
let mediaRecorders = {};
let audioChunks = {};

function renderSpeaking(data, path) {
    const container = document.getElementById('speaking-list');
    container.innerHTML = ''; // Xóa dữ liệu cũ

    // Duyệt qua từng câu hỏi trong mảng items
    data.items.forEach((item, index) => {
        // Kiểm tra xem có ảnh hay không
        let hasImage = item.image && item.image !== "";
        let htmlImage = hasImage ? `<img src="${path}/${item.image}" style="width:100%; border-radius:8px; border:1px solid #ddd; margin-bottom:15px;">` : '';
        
        let htmlText = item.content ? `<div style="background: #fff; padding: 15px; border-left: 5px solid var(--primary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 15px;">${item.content}</div>` : '';

        // Dàn trang: Có ảnh thì chia 2 cột, không có thì 1 cột
        let layoutStyle = hasImage ? 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;' : 'display: block;';

        container.innerHTML += `
            <div class="speaking-group" style="background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <h3 style="color:var(--primary); margin-bottom:15px;"># Task ${index + 1}</h3>
                ${htmlText}
                <div style="${layoutStyle}">
                    ${hasImage ? `<div>${htmlImage}</div>` : ''}
                    <div>
                        <p><strong>Audio mẫu:</strong></p>
                        <audio controls src="${path}/${item.audio}" style="width:100%; margin-bottom:15px;"></audio>
                        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                        <p><strong>Ghi âm giọng bạn:</strong></p>
                        <div style="display:flex; gap:10px; margin-bottom:15px;">
                            <button id="btn-rec-${index}" class="btn-record" onclick="startRecording(${index})" style="padding:10px 15px; cursor:pointer;"><i class="fas fa-microphone"></i> Thu âm</button>
                            <button id="btn-stop-${index}" class="btn-stop" onclick="stopRecording(${index})" style="padding:10px 15px; cursor:pointer;" disabled><i class="fas fa-stop"></i> Dừng</button>
                        </div>
                        <audio id="audio-user-${index}" controls style="width:100%;"></audio>
                    </div>
                </div>
            </div>
        `;
    });
}

// Hàm BẮT ĐẦU ghi âm cho từng câu hỏi riêng biệt
async function startRecording(index) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorders[index] = new MediaRecorder(stream);
        audioChunks[index] = [];

        mediaRecorders[index].ondataavailable = e => audioChunks[index].push(e.data);
        mediaRecorders[index].onstop = () => {
            const blob = new Blob(audioChunks[index], { type: 'audio/wav' });
            document.getElementById(`audio-user-${index}`).src = URL.createObjectURL(blob);
        };

        mediaRecorders[index].start();
        
        // Đổi giao diện nút bấm
        const btnRec = document.getElementById(`btn-rec-${index}`);
        const btnStop = document.getElementById(`btn-stop-${index}`);
        btnRec.disabled = true;
        btnRec.innerHTML = '<i class="fas fa-circle" style="color:red"></i> Đang thu...';
        btnStop.disabled = false;
    } catch(e) { alert("Lỗi Micro: Hãy chạy trên Localhost hoặc HTTPS!"); }
}

// Hàm DỪNG ghi âm
function stopRecording(index) {
    if(mediaRecorders[index] && mediaRecorders[index].state !== 'inactive') {
        mediaRecorders[index].stop();
        
        const btnRec = document.getElementById(`btn-rec-${index}`);
        const btnStop = document.getElementById(`btn-stop-${index}`);
        btnRec.disabled = false;
        btnRec.innerHTML = '<i class="fas fa-microphone"></i> Thu lại';
        btnStop.disabled = true;
    }
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







