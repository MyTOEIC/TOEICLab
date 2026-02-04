function renderVocab(data) {
    document.getElementById('vocab-topic').textContent = data.title;
    document.getElementById('vocab-text').innerHTML = data.content;
    const list = document.getElementById('vocab-list');
    list.innerHTML = '';
    
    data.items.forEach(w => {
        // Tạo ID duy nhất cho mỗi nút để dễ xử lý
        const btnId = 'btn-speak-' + w.en.replace(/\s+/g, '');
        
        list.innerHTML += `
            <div class="vocab-item">
                <strong style="color:var(--primary); font-size:1.2rem">${w.en}</strong> 
                <small>${w.pron}</small><br><span>${w.vi}</span>
                
                <button onclick="speakWord('${w.en}')" 
                style="position:absolute; top:15px; right:15px; border:none; background:#f1f5f9; width:30px; height:30px; border-radius:50%; cursor:pointer">
                    🔊
                </button>
            </div>`;
    });
}

// --- HÀM ĐỌC MỚI (Dùng giọng chị Google của trình duyệt) ---
function speakWord(text) {
    // Hủy các câu đang đọc dở (nếu có) để đọc câu mới ngay
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Giọng Mỹ (hoặc 'en-GB' cho giọng Anh)
    utterance.rate = 0.9;     // Tốc độ đọc (1 là bình thường, 0.9 chậm hơn xíu cho dễ nghe)
    
    window.speechSynthesis.speak(utterance);
}
