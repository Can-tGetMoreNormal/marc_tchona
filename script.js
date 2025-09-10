document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(event) {
        event.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});


(function () {
  const viewport = document.querySelector('.pz-viewport');
  const img = document.querySelector('.pz-image');
  if (!viewport || !img) return;

  // Initial state
  let scale = 1.8;         // start zoomed-in so users can pan immediately (tweak)
  let minScale = 1;        // minimum zoom (fit-ish)
  let maxScale = 4;        // maximum zoom
  let x = 0, y = 0;        // pan offsets (in CSS pixels at current scale)
  let isDown = false;
  let startX = 0, startY = 0;

  // Make sure image is positioned & scaled once it loads
  function fitAndCenter() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    // Compute minScale so the entire image would *just* fit (contain)
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    const scaleW = vw / naturalW;
    const scaleH = vh / naturalH;
    minScale = Math.min(scaleW, scaleH);

    // If current scale is less than min, bump it
    scale = Math.max(scale, minScale);

    // Center image if smaller than viewport in either dimension
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

    // If image smaller than viewport in a dimension, center it; else clamp
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

  // Mouse drag
  viewport.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
  });
  window.addEventListener('mousemove', (e

