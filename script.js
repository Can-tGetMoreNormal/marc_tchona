// (optional) smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();
    const el = document.querySelector(anchor.getAttribute("href"));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  });
});

/* -------- Pan / Zoom for UI image -------- */
(function () {
  const viewport = document.querySelector('.pz-viewport');
  const img = document.querySelector('.pz-image');
  if (!viewport || !img) return;

  // State
  let scale = 1.8;     // starting zoom (tweak)
  let minScale = 1;    // recalculated on load/resize (fit)
  const maxScale = 5;  // max zoom
  let x = 0, y = 0;    // pan offsets
  let isDown = false;
  let startX = 0, startY = 0;

  // Helpers
  function fitAndCenter() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Min scale to fully fit (contain)
    const scaleW = vw / naturalW;
    const scaleH = vh / naturalH;
    minScale = Math.min(scaleW, scaleH);

    // Ensure current scale not below min
    scale = Math.max(scale, minScale);

    // Center if image smaller than viewport
    const imgW = naturalW * scale;
    const imgH = naturalH * scale;
    x = Math.max((vw - imgW) / 2, 0);
    y = Math.max((vh - imgH) / 2, 0);

    apply();
  }

  function clampPan() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const imgW = img.naturalWidth * scale;
    const imgH = img.naturalHeight * scale;

    if (imgW <= vw) {
      x = (vw - imgW) / 2;
    } else {
      const minX = vw - imgW;
      const maxX = 0;
      x = Math.min(Math.max(x, minX), maxX);
    }

    if (imgH <= vh) {
      y = (vh - imgH) / 2;
    } else {
      const minY = vh - imgH;
      const maxY = 0;
      y = Math.min(Math.max(y, minY), maxY);
    }
  }

  function apply() {
    clampPan();
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  // Drag to pan (mouse)
  viewport.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    apply();
  });
  window.addEventListener('mouseup', () => { isDown = false; });
  viewport.addEventListener('mouseleave', () => { isDown = false; });

  // Touch to pan
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    isDown = true;
    startX = t.clientX - x;
    startY = t.clientY - y;
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    if (!isDown || e.touches.length !== 1) return;
    const t = e.touches[0];
    x = t.clientX - startX;
    y = t.clientY - startY;
    apply();
  }, { passive: false });

  viewport.addEventListener('touchend', () => { isDown = false; });

  // Wheel to zoom (centered on cursor)
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    const rect = viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left; // cursor within viewport
    const cy = e.clientY - rect.top;

    const prevScale = scale;
    const delta = -e.deltaY;                // wheel up => zoom in
    const zoomFactor = Math.exp(delta * 0.0012); // smooth exponential
    scale = Math.min(maxScale, Math.max(minScale, scale * zoomFactor));

    // Adjust pan so the point under cursor stays fixed
    const sx = (cx - x) / prevScale;
    const sy = (cy - y) / prevScale;
    x = cx - sx * scale;
    y = cy - sy * scale;

    apply();
  }, { passive: false });

  // Double click to reset
  viewport.addEventListener('dblclick', () => {
    scale = Math.max(1.8, minScale);  // start zoom level
    x = y = 0;
    fitAndCenter();
  });

  // Init on load/resize
  if (img.complete) fitAndCenter();
  else img.addEventListener('load', fitAndCenter);

  window.addEventListener('resize', fitAndCenter);
})();
