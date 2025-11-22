let recorder, stream;
const videoPreview = document.getElementById('videoPreview');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const result = document.getElementById('result');

startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoPreview.srcObject = stream;
    videoPreview.muted = true; // tránh tiếng vọng

    const options = { mimeType: 'video/webm;codecs=vp9' };
    recorder = new MediaRecorder(stream, options);

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      result.innerHTML = `
        <div class="alert alert-success">
          <strong>Recorded!</strong> File size: ${(blob.size/1024/1024).toFixed(2)} MB
          <br><a href="${url}" download="Q1_test.webm" class="btn btn-sm btn-primary mt-2">Download to check</a>
        </div>`;
      stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();
    startBtn.classList.add('d-none');
    stopBtn.classList.remove('d-none');
    status.textContent = 'Recording... (red dot means active)';
  } catch (err) {
    status.innerHTML = `<span class="text-danger">Camera/Mic blocked or not found!</span>`;
  }
};

stopBtn.onclick = () => {
  recorder.stop();
  stopBtn.classList.add('d-none');
  startBtn.classList.remove('d-none');
  status.textContent = 'Processing...';
};