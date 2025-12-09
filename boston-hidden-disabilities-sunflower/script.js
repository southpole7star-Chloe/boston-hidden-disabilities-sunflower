// script.js (已更新，支持 data-step="2")
document.addEventListener("DOMContentLoaded", () => {
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
  if (!lanyardArea || !staffImage || !staffSpeech ||!hannahBw || !lineLeft || !lineRight) {
    console.error("[init] One or more required elements are missing.");
    return;
  }
  
  const show = el => el && el.classList.add("is-visible");
  const hide = el => el && el.classList.remove("is-visible");

  // --- scrollama ---
    // 判断是否是手机：宽度小于等于 600px
  const isMobile = window.innerWidth <= 600;

  const scroller = scrollama();

  scroller
    .setup({
      step: "#scrollytelling-text .step",
      // 电脑端：保持你原来的 0.5
      // 手机端：0.85，等第一个 step 几乎滚完才触发 lanyard
      offset: isMobile ? 0.75 : 0.5,
      once: false
    })

    .onStepEnter(res => {
      const stepId = res.element.dataset.step;

      // 1. 进入 "lanyard" 触发器
      if (stepId === "lanyard") {

        // ✅ 手机端：把第一段淡出，相当于“滚出屏幕”
        if (isMobile && firstStep) {
          firstStep.classList.add('mobile-hidden');
        }

        show(lanyardArea);
        
        if (res.direction === "down") {
          document.body.style.overflow = 'hidden'; 
        }
      }

      // 2. 向上滚动从正文返回，进入 "step 2" 时
      if (stepId === "2" && res.direction === "up") {
          show(staffImage);
          show(staffSpeech); 
          hannahBw.style.opacity = '1'; // 恢复黑白
          lineLeft.style.filter = 'blur(5px)';
          lineRight.style.filter = 'blur(5px)';
      }
    })
    .onStepExit(res => {
      const stepId = res.element.dataset.step;
      
      // 1. 向上滚动离开 "lanyard" (回到第1段)
      if (stepId === "lanyard" && res.direction === "up") {
        hide(lanyardArea);
        hide(staffImage);
        hide(staffSpeech);
        document.body.style.overflow = ''; 

        // ✅ 手机端：回滚到第一段时，让第一段重新出现
        if (isMobile && firstStep) {
          firstStep.classList.remove('mobile-hidden');
        }
      }
      
      // 2. 向下滚动离开 "step 2" (进入正文)
      if (stepId === "2" && res.direction === "down") {
         hide(staffImage);
         hide(staffSpeech);
         hannahBw.style.opacity = '0'; // 渐变掉黑白图，露出彩色
         lineLeft.style.filter = 'none'; // 去模糊
         lineRight.style.filter = 'none'; // 去模糊
      }
    });

  // --- 点击事件 ---
  lanyardArea.addEventListener("click", () => {
    hide(lanyardArea); 
    show(staffImage); // 显示 staff
    show(staffSpeech); 
    
    // 关键修复：点击后解锁滚动
    document.body.style.overflow = ''; // 恢复页面滚动
  });


  // --- resize ---
  window.addEventListener("resize", scroller.resize);

});