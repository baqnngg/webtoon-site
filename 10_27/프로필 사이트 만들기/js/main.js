
// 시즌별 총 화수
const TOTAL = { 1: 5, 2: 8, 3: 5 };

// 상태
let season = 1;
let page = 1;

// DOM
const list = () => document.getElementById('episodeList');
const img = () => document.getElementById('comicImage');
const statusEl = () => document.getElementById('status');

// 해시(#s=1&p=3) 읽기
function readHash() {
  const h = location.hash.replace('#', '');
  const params = new URLSearchParams(h);
  const s = parseInt(params.get('s') || '1', 10);
  const p = parseInt(params.get('p') || '1', 10);
  if (TOTAL[s]) season = s;
  page = Math.min(Math.max(1, p), TOTAL[season]);
}

// 해시 쓰기
function writeHash() {
  const params = new URLSearchParams();
  params.set('s', season);
  params.set('p', page);
  location.hash = params.toString();
}

// 회차 리스트 생성
function buildList() {
  const ul = list();
  ul.innerHTML = '';
  for (let i = 1; i <= TOTAL[season]; i++) {
    const li = document.createElement('li');
    li.textContent = i + '';
    li.onclick = () => { page = i; render(); };
    if (i === page) li.classList.add('active');
    ul.appendChild(li);
  }
}

// 스크롤을 맨 위로 올리기
function resetScrollToTop() {
  const reader = document.querySelector('.reader');   // 우측 본문 영역
  const canvas = document.querySelector('.canvas');   // 이미지 감싸는 컨테이너
  if (canvas) canvas.scrollTop = 0;
  if (reader) reader.scrollTop = 0;
  // 페이지 전체 스크롤도 올림 (필요 시)
  window.scrollTo(0, 0);
}

// 이미지 로드 + 에러시 플레이스홀더
function updateImage() {
  const el = img();
  const src = `works_data/${season}-${page}.jpg`;

  el.onerror = () => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1200'>
      <rect width='100%' height='100%' fill='#f5f5f7'/>
      <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='#999'>이미지를 넣어주세요</text>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='#bbb'>${src}</text>
    </svg>`;
    el.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    // 에러일 때도 스크롤 리셋
    resetScrollToTop();
  };

  // 로드 완료된 뒤에 스크롤을 리셋해야 레이아웃 점프 없이 확실히 위로 갑니다.
  el.onload = () => resetScrollToTop();

  el.src = src;

  // 이미지가 캐시에 있어 onload가 바로 안 뜨는 상황 대비
  if (el.complete) resetScrollToTop();
}

// 상태 텍스트
function updateStatus() {
  statusEl().textContent = `${season}학년 - ${page}`;
}

// 시즌 버튼 active 갱신
function updateSeasonButtons() {
  document.querySelectorAll('.season-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.season, 10) === season);
  });
}

// 렌더
function render() {
  buildList();
  updateImage();
  updateStatus();
  updateSeasonButtons();
  writeHash();
}

// 버튼 이벤트
function bindButtons() {
  document.getElementById('prevBtn').onclick = () => {
    if (page > 1) page--;
    else if (season > 1) { season--; page = TOTAL[season]; }
	else if (season==1 && page==1) { alert('첫 회차입니다'); }
    render();
  };
  document.getElementById('nextBtn').onclick = () => {
    if (page < TOTAL[season]) page++;
    else if (season < 3) { season++; page = 1; }
	else if (season==3 && page==23) { alert('마지막 회차입니다.'); }
    render();
  };
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.onclick = () => {
      season = parseInt(btn.dataset.season, 10);
      page = 1;
      document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    };
  });
}

// 초기화
function init() {
  readHash();
  // 시즌 버튼 active 표시
  document.querySelectorAll('.season-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.season,10) === season);
  });
  bindButtons();
  render();
}
window.addEventListener('hashchange', () => { readHash(); render(); });
window.addEventListener('DOMContentLoaded', init);