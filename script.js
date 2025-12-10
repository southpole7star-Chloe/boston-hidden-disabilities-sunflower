document.addEventListener("DOMContentLoaded", () => {
  // 1. 定义环境变量
  const isEmbedded = window.self !== window.top;
  
  // 👉 新增：如果是 iframe，给 body 加个 class 标记
  if (isEmbedded) {
    document.body.classList.add('is-embedded');
  }
  const isMobile = window.innerWidth <= 600;

  // --- guard: scrollama ---
  if (typeof scrollama === "undefined") {
    console.error("[scrollama] not found.");
    return;
  }

  // --- dom refs ---
  const lanyardArea = document.getElementById("lanyard-click-area");
  const staffImage = document.getElementById("staff-image");
  const staffSpeech = document.getElementById("staff-speech"); 
  const hannahBw = document.getElementById("hannah-bw");
  const lineLeft = document.getElementById("line-left");
  const lineRight = document.getElementById("line-right");
  const firstStep = document.querySelector('#scrollytelling-text .step[data-step="1"]');

  // 安全检查
  if (!lanyardArea || !staffImage || !staffSpeech || !hannahBw || !lineLeft || !lineRight) {
    console.error("[init] One or more required elements are missing.");
    return;
  }
  
  // 辅助函数
  const show = el => el && el.classList.add("is-visible");
  const hide = el => el && el.classList.remove("is-visible");

  // --- scrollama setup ---
  const scroller = scrollama();

  scroller
    .setup({
      step: "#scrollytelling-text .step",
      // 手机端稍微晚一点触发，避免文字还没读完就变了
      offset: isMobile ? 0.75 : 0.5,
      once: false // 关键：允许反复触发
    })
    .onStepEnter(res => {
      const stepId = res.element.dataset.step;
      const dir = res.direction;

      // ====================================================
      // 场景 1: Lanyard 区域 (过渡区)
      // ====================================================
      if (stepId === "lanyard") {
        
        // A. 从上往下滚入 (正常流程)
        if (dir === "down") {
          // 1. 手机端隐藏第一段文字
          if (isMobile && firstStep) firstStep.classList.add('mobile-hidden');
          
          // 2. 显示“点击领取”按钮
          show(lanyardArea);
          
          // 3. 确保 Staff 暂时是隐藏的（等待点击），除非用户是往回滚又下来的
          //    但为了逻辑简单，我们假设重新进入这里就是重置到“点击前”的状态
          hide(staffImage);
          hide(staffSpeech);

          // 4. 只有单页模式（非iframe）才锁死滚动
          if (!isEmbedded) {
            document.body.style.overflow = 'hidden';
          }
        }

        // B. 从下往上滚入 (倒叙回放 - 关键修复)
        // 也就是从 Step 2 倒退回 Lanyard 区域
        else if (dir === "up") {
          // 1. 隐藏按钮 (因为我们要显示 Staff)
          hide(lanyardArea); 
          
          // 2. 恢复 Staff 和气泡 (仿佛刚刚点击完的状态)
          show(staffImage);
          show(staffSpeech);

          // 3. 把 Hannah 变回黑白
          hannahBw.style.opacity = '1';

          // 4. 把背景变回模糊
          lineLeft.style.filter = 'blur(5px)';
          lineRight.style.filter = 'blur(5px)';
        }
      }

      // ====================================================
      // 场景 2: Step 2 (进入正文)
      // ====================================================
      if (stepId === "2" && dir === "down") {
         // 1. 隐藏 Staff
         hide(staffImage);
         hide(staffSpeech);
         
         // 2. 变彩色，去模糊
         hannahBw.style.opacity = '0'; 
         lineLeft.style.filter = 'none'; 
         lineRight.style.filter = 'none'; 
      }
    })
    .onStepExit(res => {
      const stepId = res.element.dataset.step;
      const dir = res.direction;
      
      // ====================================================
      // 场景 3: 彻底离开 Lanyard 往上滚 (回到 Step 1)
      // ====================================================
      if (stepId === "lanyard" && dir === "up") {
        // 1. 清场：隐藏所有覆盖层
        hide(lanyardArea);
        hide(staffImage);
        hide(staffSpeech);

        // 2. 解锁滚动
        document.body.style.overflow = ''; 

        // 3. 手机端：让第一段文字重新出现
        if (isMobile && firstStep) {
          firstStep.classList.remove('mobile-hidden');
        }
      }
    });

  // --- 点击事件 (Click Interaction) ---
  lanyardArea.addEventListener("click", () => {
    hide(lanyardArea); 
    show(staffImage); 
    show(staffSpeech); 
    
    // 点击后解锁滚动，允许继续往下看
    document.body.style.overflow = '';
  });

  // --- Resize ---
  window.addEventListener("resize", scroller.resize);

  // --- Scroll Hint Logic: 一滚动就消失 ---
  const scrollHint = document.getElementById('scroll-down-hint');
  
  window.addEventListener('scroll', () => {
    if (!scrollHint) return;

    // 如果向下滚动超过 50px，就添加 hidden 类
    if (window.scrollY > 50) {
      scrollHint.classList.add('hidden');
    } else {
      // 如果回到顶部，再显示出来
      scrollHint.classList.remove('hidden');
    }
  });
});