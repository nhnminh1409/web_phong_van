// recorder-v3.js – HOÀN HẢO CHO HTML HIỆN TẠI CỦA BẠN (3 nút riêng biệt)

let recorder, stream, recordedBlob = null;
const video = document.getElementById('videoPreview');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const actionBtn = document.getElementById('actionBtn');   // Next / Finish
const retryBtn = document.getElementById('retryBtn');
const status = document.getElementById('status');
const uploadStatus = document.getElementById('uploadStatus');

let questions = [], currentIdx = 0;
const token = sessionStorage.getItem('token');
const userName = sessionStorage.getItem('userName');
let folder = sessionStorage.getItem('folder');
const MAX_SIZE = 200 * 1024 * 1024;

// ============ KHỞI TẠO ============
(async () => {
  if (!token || !userName) {
    alert('Phiên làm việc không hợp lệ!');
    location.href = 'index.html';
    return;
  }

  if (!folder) {
    try {
      const resp = await fetch('api/session-start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userName })
      });
      const data = await resp.json();
      if (data.ok) {
        folder = data.folder;
        sessionStorage.setItem('folder', folder);
      } else throw new Error();
    } catch (e) {
      alert('Không kết nối được server!');
      location.href = 'index.html';
      return;
    }
  }

  fetch('questions.json')
    .then(r => r.json())
    .then(q => {
      questions = q;
      document.getElementById('totalQ').textContent = questions.length;
      showQuestion(0);
    })
    .catch(() => alert('Không tải được questions.json'));
})();

// ============ HIỂN THỊ CÂU HỎI ============
function showQuestion(idx) {
  currentIdx = idx;
  document.getElementById('questionText').textContent = questions[idx];
  document.getElementById('currentQ').textContent = idx + 1;
  const percent = ((idx + 1) / questions.length) * 100;
  document.getElementById('progressBar').style.width = percent + '%';
  document.getElementById('progressBar').textContent = `${idx + 1}/${questions.length}`;

  // Reset trạng thái
  recordedBlob = null;
  video.srcObject = null;
  uploadStatus.innerHTML = '';
  retryBtn.classList.add('d-none');

  // CHỈ HIỆN 1 NÚT DUY NHẤT: START RECORDING
  startBtn.classList.remove('d-none');
  stopBtn.classList.add('d-none');
  actionBtn.classList.add('d-none');   // Ẩn Next/Finish ngay từ đầu

  // Cấu hình nút actionBtn cho câu hiện tại
  if (idx === questions.length - 1) {
    actionBtn.textContent = 'Finish Interview';
    actionBtn.className = 'btn btn-primary btn-rec';
  } else {
    actionBtn.textContent = 'Next';
    actionBtn.className = 'btn btn-success btn-rec';
  }

  status.innerHTML = '<small class="text-success">Sẵn sàng – Bấm Start Recording</small>';
}

// ============ START RECORDING ============
startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;

    const chunks = [];
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      recordedBlob = new Blob(chunks, { type: 'video/webm' });
      stream.getTracks().forEach(t => t.stop());
      video.srcObject = null;

      if (recordedBlob.size > MAX_SIZE) {
        status.innerHTML = '<small class="text-danger">Video quá lớn (>200MB)! Hãy ghi ngắn lại.</small>';
        recordedBlob = null;
        showQuestion(currentIdx);
        return;
      }

      // GHI XONG → CHỈ HIỆN NÚT NEXT/FINISH
      startBtn.classList.add('d-none');
      stopBtn.classList.add('d-none');
      actionBtn.classList.remove('d-none');

      status.innerHTML = '<small class="text-success">Đã ghi xong – Bấm nút bên dưới để tiếp tục</small>';
    };

    recorder.start();

    // ĐANG GHI → CHỈ HIỆN STOP
    startBtn.classList.add('d-none');
    stopBtn.classList.remove('d-none');
    status.innerHTML = '<small class="text-warning">Đang ghi hình… (bấm Stop khi xong)</small>';

  } catch (err) {
    status.innerHTML = '<small class="text-danger">Không mở được camera/mic. Bấm F5 → Allow nhé!</small>';
    console.error(err);
  }
};

// ============ STOP RECORDING ============
stopBtn.onclick = () => {
  if (recorder?.state === 'recording') {
    recorder.stop();
  }
};

// ============ NEXT / FINISH ============
actionBtn.onclick = () => {
  if (recordedBlob) {
    uploadVideo(recordedBlob);
  }
};

// ============ UPLOAD VIDEO ============
async function uploadVideo(blob, attempt = 1) {
  uploadStatus.innerHTML = `<div class="alert alert-info">Đang upload câu ${currentIdx + 1}… (lần ${attempt})</div>`;
  actionBtn.disabled = true;

  const now = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
  const safeName = userName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeName}_Q${String(currentIdx + 1).padStart(2, '0')}_${now}.webm`;

  const form = new FormData();
  form.append('token', token);
  form.append('folder', folder);
  form.append('questionIndex', currentIdx);
  form.append('video', blob, filename);

  try {
    const res = await fetch('api/upload-one.php', { method: 'POST', body: form });
    if (!res.ok) throw new Error();

    uploadStatus.innerHTML = `<div class="alert alert-success">Upload thành công!</div>`;

    // Tạo transcript
    fetch('api/transcribe.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `folder=${folder}&questionIndex=${currentIdx}`
    });

    // Chuyển câu
    if (currentIdx === questions.length - 1) {
      setTimeout(() => {
        uploadStatus.innerHTML = '<div class="alert alert-success fs-2 fw-bold">HOÀN TẤT PHỎNG VẤN!<br>Cảm ơn bạn rất nhiều</div>';
        actionBtn.classList.add('d-none');
      }, 1000);
    } else {
      setTimeout(() => showQuestion(currentIdx + 1), 800);
    }

  } catch (e) {
    if (attempt <= 3) {
      setTimeout(() => uploadVideo(blob, attempt + 1), 2000 * attempt);
    } else {
      uploadStatus.innerHTML = '<div class="alert alert-danger">Upload thất bại sau 3 lần!</div>';
      retryBtn.classList.remove('d-none');
      retryBtn.onclick = () => {
        retryBtn.classList.add('d-none');
        uploadVideo(blob, 1);
      };
    }
  } finally {
    actionBtn.disabled = false;
  }
}