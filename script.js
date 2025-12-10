document.addEventListener("DOMContentLoaded", () => {
  // 🔍 1. 定义变量 (移到这里)
  const isEmbedded = window.self !== window.top;

  // --- guard: scrollama ---
  if (typeof scrollama === "undefined") {
    console.error("[scrollama] not found.");
    return;
  }

  // --- dom refs ---
  const steps = document.querySelectorAll('#scrollytelling-text .step');
  const lanyardArea = document.getElementById("lanyard-click-area");
  
  const staffImage = document.getElementById("staff-image");
  const staffSpeech = document.getElementById("staff-speech"); 
  const hannahBw = document.getElementById("hannah-bw");
  const lineLeft = document.getElementById("line-left");
  const lineRight = document.getElementById("line-right");

  const firstStep = document.querySelector('#scrollytelling-text .step[data-step="1"]');

  if (!steps.length) {
    console.warn("[init] no steps found.");
  }
  if (!lanyardArea || !staffImage || !staffSpeech || !hannahBw || !lineLeft || !lineRight) {
    console.error("[init] One or more required elements are missing.");
    return;
  }
  
  const show = el => el && el.classList.add("is-visible");
  const hide = el => el && el.classList.remove("is-visible");

  // --- scrollama ---
  const isMobile = window.innerWidth <= 600;

  // 🔧 offset 配置
  const desktopOffset = isEmbedded ? 0.35 : 0.5;
  const mobileOffset  = isEmbedded ? 0.65 : 0.75;

  const scroller = scrollama();

  scroller
    .setup({
      step: "#scrollytelling-text .step",
      offset: isMobile ? mobileOffset : desktopOffset,
      once: false
    })
    .onStepEnter(res => {
      const stepId = res.element.dataset.step;

      // ===========================
      // 1. 处理 Lanyard 步骤
      // ===========================
      if (stepId === "lanyard") {
        
        // 向下滚动进入 (Down)
        if (res.direction === "down") {
          if (isMobile && firstStep) {
            firstStep.classList.add('mobile-hidden');
          }
          show(lanyardArea);

          // ✅ 只有单页时才锁死滚动
          if (!isEmbedded) {
            document.body.style.overflow = 'hidden';
          }
        }

        // 向上滚动进入 (Up) - 或者是为了恢复状态
        // 注意：原代码这里的逻辑是：如果是 lanyard 且 direction 是 up，则隐藏。
        if (res.direction === "up") {
          hide(lanyardArea);
          hide(staffImage);
          hide(staffSpeech);

          // ✅ 只有单页时才恢复滚动
          if (!isEmbedded) {
            document.body.style.overflow = '';
          }

          if (isMobile && firstStep) {
            firstStep.classList.remove('mobile-hidden');
          }
        }
      } // <--- 这里的括号原来位置不对，现在闭合 if (stepId === "lanyard")
      
      // ===========================
      // 2. 向下滚动离开 "step 2" (进入正文)
      // ===========================
      // 修正：这段代码之前被错误的括号踢出了回调函数
      if (stepId === "2" && res.direction === "down") {
         hide(staffImage);
         hide(staffSpeech);
         hannahBw.style.opacity = '0'; // 渐变掉黑白图，露出彩色
         lineLeft.style.filter = 'none'; // 去模糊
         lineRight.style.filter = 'none'; // 去模糊
      }

    }); // <--- 这里的括号闭合 .onStepEnter

  // --- Click Event ---
  lanyardArea.addEventListener("click", () => {
    hide(lanyardArea); 
    show(staffImage); 
    show(staffSpeech); 

    // ✅ 只有单页时才去动 body
    if (!isEmbedded) {
      document.body.style.overflow = '';
    }
  });

  // --- resize ---
  window.addEventListener("resize", scroller.resize);

}); // <--- 闭合 document.addEventListener