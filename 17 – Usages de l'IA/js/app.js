const LOW_CONFIDENCE_THRESHOLD = 0.4;
const RESULTS_COUNT = 3;

const panels = {
  source: document.getElementById('source-selection'),
  capture: document.getElementById('capture-area'),
  loading: document.getElementById('loading-area'),
  results: document.getElementById('results-area'),
};

const el = {
  btnUpload: document.getElementById('btn-upload'),
  btnWebcam: document.getElementById('btn-webcam'),
  fileInput: document.getElementById('file-input'),
  modelStatus: document.getElementById('model-status'),

  video: document.getElementById('webcam-video'),
  previewImage: document.getElementById('preview-image'),
  captureCanvas: document.getElementById('capture-canvas'),
  btnCapture: document.getElementById('btn-capture'),
  btnAnalyze: document.getElementById('btn-analyze'),
  btnCancel: document.getElementById('btn-cancel'),

  resultImage: document.getElementById('result-image'),
  resultsList: document.getElementById('results-list'),
  lowConfidenceMsg: document.getElementById('low-confidence-msg'),
  btnReset: document.getElementById('btn-reset'),
};

let classifier = null;
let mediaStream = null;
let currentMediaElement = null;

function showPanel(name) {
  Object.values(panels).forEach((panel) => panel.classList.add('hidden'));
  panels[name].classList.remove('hidden');
}

async function initClassifier() {
  classifier = await ml5.imageClassifier('MobileNet');
  el.modelStatus.textContent = 'Modèle prêt.';
  el.modelStatus.classList.add('ready');
}

function stopWebcamStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
}

function resetCaptureArea() {
  stopWebcamStream();
  el.video.hidden = true;
  el.video.srcObject = null;
  el.previewImage.hidden = true;
  el.previewImage.src = '';
  el.captureCanvas.hidden = true;
  el.btnCapture.classList.add('hidden');
  el.btnAnalyze.classList.add('hidden');
  currentMediaElement = null;
  el.fileInput.value = '';
}

async function startUpload() {
  el.fileInput.click();
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  resetCaptureArea();
  showPanel('capture');

  const objectUrl = URL.createObjectURL(file);
  el.previewImage.onload = () => {
    el.btnAnalyze.classList.remove('hidden');
    currentMediaElement = el.previewImage;
  };
  el.previewImage.src = objectUrl;
  el.previewImage.hidden = false;
}

async function startWebcam() {
  resetCaptureArea();
  showPanel('capture');

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    el.video.srcObject = mediaStream;
    el.video.hidden = false;
    el.btnCapture.classList.remove('hidden');
  } catch (err) {
    alert("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.");
    showPanel('source');
  }
}

function captureFromWebcam() {
  const { videoWidth, videoHeight } = el.video;
  el.captureCanvas.width = videoWidth;
  el.captureCanvas.height = videoHeight;
  const ctx = el.captureCanvas.getContext('2d');
  ctx.drawImage(el.video, 0, 0, videoWidth, videoHeight);

  stopWebcamStream();
  el.video.hidden = true;
  el.captureCanvas.hidden = false;
  el.btnCapture.classList.add('hidden');
  el.btnAnalyze.classList.remove('hidden');
  currentMediaElement = el.captureCanvas;
}

function cancelCapture() {
  resetCaptureArea();
  showPanel('source');
}

function formatLabel(rawLabel) {
  const firstTerm = rawLabel.split(',')[0].trim();
  return firstTerm.charAt(0).toUpperCase() + firstTerm.slice(1);
}

function buildResultItem(result, rank) {
  const confidencePercent = Math.round(result.confidence * 100);

  const li = document.createElement('li');
  li.className = 'result-item';
  li.innerHTML = `
    <div class="result-item-top">
      <span><span class="result-rank">#${rank}</span><span class="result-label">${formatLabel(result.label)}</span></span>
      <span class="result-confidence">${confidencePercent}%</span>
    </div>
    <div class="confidence-bar">
      <div class="confidence-bar-fill" style="width: ${confidencePercent}%"></div>
    </div>
  `;
  return li;
}

function displayResults(results) {
  el.resultsList.innerHTML = '';
  results.slice(0, RESULTS_COUNT).forEach((result, index) => {
    el.resultsList.appendChild(buildResultItem(result, index + 1));
  });

  const topConfidence = results[0] ? results[0].confidence : 0;
  el.lowConfidenceMsg.classList.toggle('hidden', topConfidence >= LOW_CONFIDENCE_THRESHOLD);

  if (currentMediaElement.tagName === 'CANVAS') {
    el.resultImage.src = currentMediaElement.toDataURL('image/png');
  } else {
    el.resultImage.src = currentMediaElement.src;
  }

  showPanel('results');
}

async function runAnalysis() {
  if (!classifier || !currentMediaElement) return;

  showPanel('loading');
  try {
    const results = await classifier.classify(currentMediaElement);
    displayResults(results);
  } catch (err) {
    alert("L'analyse a échoué. Merci de réessayer.");
    showPanel('capture');
  }
}

function resetAll() {
  resetCaptureArea();
  showPanel('source');
}

el.btnUpload.addEventListener('click', startUpload);
el.fileInput.addEventListener('change', handleFileSelected);
el.btnWebcam.addEventListener('click', startWebcam);
el.btnCapture.addEventListener('click', captureFromWebcam);
el.btnAnalyze.addEventListener('click', runAnalysis);
el.btnCancel.addEventListener('click', cancelCapture);
el.btnReset.addEventListener('click', resetAll);

initClassifier();
