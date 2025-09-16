// 全局定义audioElement
const audioElement = new Audio();
audioElement.crossOrigin = "anonymous";
audioElement.loop = true;

// 获取DOM元素
const playPauseBtn = document.getElementById('playPauseBtn');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const loadBtn = document.getElementById('loadBtn');
const fileSelectBtn = document.getElementById('fileSelectBtn');
const audioUrl = document.getElementById('audioUrl');
const fileInput = document.getElementById('fileInput');
const barWidth = document.getElementById('barWidth');
const gradientSelect = document.getElementById('gradientSelect');
const statusEL = document.getElementById('status');

const currentTimeEL = document.getElementById('currentTime');
const durationEL = document.getElementById('duration');
const progressBarEL = document.getElementById('progressBar');
const muteBtnEL = document.getElementById('muteBtn');
const volumeBarEL = document.getElementById('volumeBar');

const playPauseBtnEL = document.getElementById('playPauseBtn');
const prevBtnEL = document.getElementById('prevBtn');
const nextBtnEL = document.getElementById('nextBtn');

// 获取Canvas元素和上下文
const barCanvas = document.getElementById('barVisualizer');
const barCtx = barCanvas.getContext('2d');

const circleCanvas = document.getElementById('circleVisualizer');
const circleCtx = circleCanvas.getContext('2d');

const waveCanvas = document.getElementById('waveVisualizer');
const waveCtx = waveCanvas.getContext('2d');

const dotCanvas = document.getElementById('dotVisualizer');
const dotCtx = dotCanvas.getContext('2d');

//1. 粒子效果频谱
const ParticleCanvas = document.getElementById('ParticleVisualizer');
const ParticleCtx = ParticleCanvas.getContext('2d');

//2. 网格频谱
const GridCanvas = document.getElementById('GridVisualizer');
const GridCtx = GridCanvas.getContext('2d');

//3. 环形波形频谱
const RingWaveCanvas = document.getElementById('RingWaveVisualizer');
const RingWaveCtx = RingWaveCanvas.getContext('2d');

//4. 瀑布流频谱
const WaterCanvas = document.getElementById('WaterVisualizer');
const WaterCtx = WaterCanvas.getContext('2d');

//5. 3D柱状频谱
const SDBarCanvas = document.getElementById('3DBarVisualizer');
const SDBarCtx = SDBarCanvas.getContext('2d');

//6. 声波纹效果
const SoundwaveCanvas = document.getElementById('SoundwaveVisualizer');
const SoundwaveCtx = SoundwaveCanvas.getContext('2d');

let isSourceConnected = false;

// 音频上下文和相关变量
let audioContext;
let analyser;
let source;
let animationId;
let dataArray;
let bufferLength;
// 添加旋转角度变量
let rotationAngle = 0;
// 圆形频谱中心图片
const centerImage = new Image();
centerImage.src = 'http://cdn.cc/music/%E6%97%A5%E9%9F%A9%E9%87%91%E6%9B%B2/Baby%20I%27m%20Sorry%20%28Inst.%29%20-%20MYNAME.jpg';

// 调整Canvas大小
function resizeCanvases() {
    const canvases = [barCanvas, circleCanvas, waveCanvas, dotCanvas];
    canvases.forEach(canvas => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    });
}

window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// 初始化音频上下文
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }
}

// 获取颜色方案
function getGradientStyle(ctx, height, value, index, total, type) {
    const hue = index / total * 360;
    const lightness = 50 + (value / 255) * 30;

    switch (gradientSelect.value) {
        case 'rainbow':
            return `hsl(${hue}, 100%, ${lightness}%)`;
        case 'fire':
            if (type === 'circle') {
                return `hsl(${30 + (value / 255) * 20}, 100%, ${lightness}%)`;
            }
            return `hsl(${30 - index / total * 15}, 100%, ${lightness}%)`;
        case 'ocean':
            return `hsl(${200 + index / total * 40}, 70%, ${lightness}%)`;
        default: // blue
            return `hsl(${200 + index / total * 40}, 100%, ${lightness}%)`;
    }
}

// 绘制条形频谱
function drawBarVisualizer() {
    const width = barCanvas.width;
    const height = barCanvas.height;

    analyser.getByteFrequencyData(dataArray);

    barCtx.clearRect(0, 0, width, height);

    const barCount = bufferLength;
    const barWidthVal = parseInt(barWidth.value);
    const barSpacing = 1;
    const maxBarHeight = height;

    let x = 0;

    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i] / 255) * maxBarHeight;

        barCtx.fillStyle = getGradientStyle(barCtx, maxBarHeight, dataArray[i], i, barCount, 'bar');
        barCtx.fillRect(x, height - barHeight, barWidthVal, barHeight);

        x += barWidthVal + barSpacing;

        if (x >= width) break;
    }
}

// 绘制圆形频谱（带旋转图片）
function drawCircleVisualizer() {
    const width = circleCanvas.width;
    const height = circleCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    analyser.getByteFrequencyData(dataArray);

    circleCtx.clearRect(0, 0, width, height);

    // 计算平均音频强度用于控制旋转速度
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const average = sum / bufferLength;

    // 根据音频强度调整旋转速度
    const rotationSpeed = 0.005 + (average / 255) * 0.02;
    rotationAngle += rotationSpeed;

    // 绘制中心图片（带旋转效果）
    const imgSize = radius * 0.4;
    if (centerImage.complete) {
        circleCtx.save();

        // 移动到中心点并旋转
        circleCtx.translate(centerX, centerY);
        circleCtx.rotate(rotationAngle);

        // 创建圆形裁剪路径
        circleCtx.beginPath();
        circleCtx.arc(0, 0, imgSize, 0, Math.PI * 2);
        circleCtx.clip();

        // 绘制图片（注意坐标已基于中心点）
        circleCtx.drawImage(centerImage, -imgSize, -imgSize, imgSize * 2, imgSize * 2);

        circleCtx.restore();

        // 添加旋转光环效果
        circleCtx.save();
        circleCtx.translate(centerX, centerY);
        circleCtx.rotate(-rotationAngle * 2); // 反向旋转，速度加倍

        circleCtx.strokeStyle = `hsla(${rotationAngle * 20 % 360}, 100%, 60%, 0.5)`;
        circleCtx.lineWidth = 2;
        circleCtx.beginPath();
        circleCtx.arc(0, 0, imgSize + 5, 0, Math.PI * 2);
        circleCtx.stroke();

        circleCtx.beginPath();
        circleCtx.arc(0, 0, imgSize + 10, 0, Math.PI * 2);
        circleCtx.stroke();

        circleCtx.restore();
    }

    // 绘制内圈条形
    const innerRadius = imgSize + 15;
    const barCount = 60;
    const barWidth = 2;

    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const barHeight = (dataArray[dataIndex] / 255) * (radius - innerRadius - 20);

        circleCtx.save();
        circleCtx.translate(centerX, centerY);
        circleCtx.rotate(angle);

        circleCtx.fillStyle = getGradientStyle(circleCtx, radius, dataArray[dataIndex], i, barCount, 'circle');
        circleCtx.fillRect(innerRadius, -barWidth / 2, barHeight, barWidth);

        circleCtx.restore();
    }

    // 绘制外圈线条
    const outerRadius = radius - 5;
    const lineCount = 120;

    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const dataIndex = Math.floor(i * bufferLength / lineCount);
        const lineLength = (dataArray[dataIndex] / 255) * 15 + 2;

        circleCtx.save();
        circleCtx.translate(centerX, centerY);
        circleCtx.rotate(angle);

        circleCtx.strokeStyle = getGradientStyle(circleCtx, radius, dataArray[dataIndex], i, lineCount, 'circle');
        circleCtx.lineWidth = 2;
        circleCtx.beginPath();
        circleCtx.moveTo(outerRadius, 0);
        circleCtx.lineTo(outerRadius + lineLength, 0);
        circleCtx.stroke();

        circleCtx.restore();
    }
}

// 绘制水平波形
function drawWaveVisualizer() {
    const width = waveCanvas.width;
    const height = waveCanvas.height;

    analyser.getByteTimeDomainData(dataArray);

    waveCtx.clearRect(0, 0, width, height);

    waveCtx.lineWidth = 2;
    waveCtx.strokeStyle = '#4a00e0';
    waveCtx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
            waveCtx.moveTo(x, y);
        } else {
            waveCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    waveCtx.stroke();

    // 添加填充效果
    waveCtx.lineTo(width, height / 2);
    waveCtx.lineTo(0, height / 2);
    waveCtx.closePath();

    const gradient = waveCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(74, 0, 224, 0.5)');
    gradient.addColorStop(1, 'rgba(74, 0, 224, 0.1)');

    waveCtx.fillStyle = gradient;
    waveCtx.fill();
}

// 绘制圆点波形频谱
function drawDotVisualizer() {
    const width = dotCanvas.width;
    const height = dotCanvas.height;

    // 确保analyser存在
    if (!analyser) return;

    // 获取时域数据
    analyser.getByteTimeDomainData(dataArray);

    // 清除画布
    dotCtx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 10;

    // 确保maxRadius是有效值
    if (isNaN(maxRadius) || maxRadius <= 0) return;

    for (let i = 0; i < bufferLength; i++) {
        // 确保数据有效
        if (isNaN(dataArray[i])) continue;

        // 将数据值归一化到0-2范围
        const value = dataArray[i] / 128.0;

        // 确保value是有效数值
        if (isNaN(value)) continue;

        const percent = i / bufferLength;
        const angle = percent * Math.PI * 2;

        // 计算圆点半径，限制在合理范围内
        let circleRadius = (value - 1) * (maxRadius / 4) + 2;
        circleRadius = Math.max(1, Math.min(10, circleRadius)); // 限制在1-10像素之间

        // 计算圆点位置
        const distance = maxRadius * 0.8; // 固定距离，避免圆点过于分散
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        // 确保坐标有效
        if (isNaN(x) || isNaN(y)) continue;

        // 绘制圆点
        dotCtx.beginPath();
        dotCtx.arc(x, y, circleRadius, 0, Math.PI * 2);

        // 使用HSL颜色模式，根据位置设置不同色调
        const hue = percent * 360;
        dotCtx.fillStyle = `hsla(${hue}, 100%, 60%, 0.7)`;
        dotCtx.fill();
    }
}

// 1. 粒子效果频谱
function drawParticleVisualizer() {
    const width = ParticleCanvas.width;
    const height = ParticleCanvas.height;

    analyser.getByteFrequencyData(dataArray);
    ParticleCtx.clearRect(0, 0, width, height);

    const particleCount = bufferLength / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
        const value = dataArray[i];
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = (value / 255) * (Math.min(width, height) / 3);

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const size = 2 + (value / 255) * 8;
        const hue = (i / particleCount) * 360;

        ParticleCtx.beginPath();
        ParticleCtx.arc(x, y, size, 0, Math.PI * 2);
        ParticleCtx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
        ParticleCtx.fill();
    }
}

// 2. 网格频谱
function drawGridVisualizer() {
    const width = GridCanvas.width;
    const height = GridCanvas.height;

    analyser.getByteFrequencyData(dataArray);
    GridCtx.clearRect(0, 0, width, height);

    const gridSize = 8;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            if (index < bufferLength) {
                const value = dataArray[index];
                const intensity = value / 255;

                GridCtx.fillStyle = `rgba(74, 0, 224, ${intensity * 0.8})`;
                GridCtx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

                // 添加边框
                GridCtx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                GridCtx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

// 2. 网格频谱
function drawGridVisualizer() {
    const width = GridCanvas.width;
    const height = GridCanvas.height;

    analyser.getByteFrequencyData(dataArray);
    GridCtx.clearRect(0, 0, width, height);

    const gridSize = 16;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            if (index < bufferLength) {
                const value = dataArray[index];
                const intensity = value / 255;

                GridCtx.fillStyle = `rgba(74, 0, 224, ${intensity * 0.8})`;
                GridCtx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

                // 添加边框
                GridCtx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                GridCtx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

// 3. 环形波形频谱
function drawRingWaveVisualizer() {
    const width = RingWaveCanvas.width;
    const height = RingWaveCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    analyser.getByteTimeDomainData(dataArray);
    RingWaveCtx.clearRect(0, 0, width, height);

    const radius = Math.min(width, height) / 3;
    RingWaveCtx.lineWidth = 3;

    for (let i = 0; i < 3; i++) {
        const offset = i * 20;
        const waveRadius = radius + offset;

        RingWaveCtx.beginPath();
        for (let j = 0; j < bufferLength; j++) {
            const value = dataArray[j] / 128.0;
            const angle = (j / bufferLength) * Math.PI * 2;
            const pointRadius = waveRadius + (value - 1) * 30;

            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;

            if (j === 0) {
                RingWaveCtx.moveTo(x, y);
            } else {
                RingWaveCtx.lineTo(x, y);
            }
        }
        RingWaveCtx.closePath();

        const hue = (i * 120 + Date.now() / 20) % 360;
        RingWaveCtx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.7)`;
        RingWaveCtx.stroke();
    }
}

// 4. 瀑布流频谱
function drawWaterfallVisualizer() {
    const width = WaterCanvas.width;
    const height = WaterCanvas.height;

    analyser.getByteFrequencyData(dataArray);

    // 将现有内容向下移动
    const imageData = WaterCtx.getImageData(0, 0, width, height - 1);
    WaterCtx.putImageData(imageData, 0, 1);

    // 绘制新的频谱线
    const barWidth = width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const x = i * barWidth;
        const barHeight = (value / 255) * 10;

        const hue = (i / bufferLength) * 360;
        WaterCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        WaterCtx.fillRect(x, 0, barWidth, barHeight);
    }
}

// 5. 3D柱状频谱
function draw3DBarVisualizer() {
    const width = SDBarCanvas.width;
    const height = SDBarCanvas.height;

    analyser.getByteFrequencyData(dataArray);
    SDBarCtx.clearRect(0, 0, width, height);

    const barCount = bufferLength / 4;
    const barSpacing = 2;
    const barWidth = (width - (barCount - 1) * barSpacing) / barCount;

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * 4];
        const barHeight = (value / 255) * height * 0.8;
        const x = i * (barWidth + barSpacing);

        // 绘制3D效果
        const depth = 5;
        const hue = (i / barCount) * 360;

        // 前面
        SDBarCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        SDBarCtx.fillRect(x, height - barHeight, barWidth, barHeight);

        // 顶部
        SDBarCtx.fillStyle = `hsl(${hue}, 100%, 40%)`;
        SDBarCtx.beginPath();
        SDBarCtx.moveTo(x, height - barHeight);
        SDBarCtx.lineTo(x + depth, height - barHeight - depth);
        SDBarCtx.lineTo(x + barWidth + depth, height - barHeight - depth);
        SDBarCtx.lineTo(x + barWidth, height - barHeight);
        SDBarCtx.closePath();
        SDBarCtx.fill();

        // 侧面
        SDBarCtx.fillStyle = `hsl(${hue}, 100%, 30%)`;
        SDBarCtx.beginPath();
        SDBarCtx.moveTo(x + barWidth, height - barHeight);
        SDBarCtx.lineTo(x + barWidth + depth, height - barHeight - depth);
        SDBarCtx.lineTo(x + barWidth + depth, height - depth);
        SDBarCtx.lineTo(x + barWidth, height);
        SDBarCtx.closePath();
        SDBarCtx.fill();
    }
}

// 6. 声波纹效果
function drawSoundWaveVisualizer() {
    const width = SoundwaveCanvas.width;
    const height = SoundwaveCanvas.height;

    analyser.getByteTimeDomainData(dataArray);
    SoundwaveCtx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const amplitude = height / 3;

    SoundwaveCtx.lineWidth = 2;
    SoundwaveCtx.strokeStyle = '#00ff88';

    SoundwaveCtx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 128.0;
        const x = (i / bufferLength) * width;
        const y = centerY + (value - 1) * amplitude;

        if (i === 0) {
            SoundwaveCtx.moveTo(x, y);
        } else {
            SoundwaveCtx.lineTo(x, y);
        }
    }
    SoundwaveCtx.stroke();

    // 添加光晕效果
    const gradient = SoundwaveCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.1)');

    SoundwaveCtx.lineTo(width, centerY);
    SoundwaveCtx.lineTo(0, centerY);
    SoundwaveCtx.closePath();
    SoundwaveCtx.fillStyle = gradient;
    SoundwaveCtx.fill();
}

// 主绘制函数
function draw() {
    if (!analyser) return;

    drawBarVisualizer(); //绘制条形频谱 
    drawCircleVisualizer(); // 绘制圆形频谱（带旋转图片）
    drawWaveVisualizer();// 绘制水平波形
    drawDotVisualizer();// 绘制圆点波形频谱

    drawParticleVisualizer();// 1. 粒子效果频谱

    drawGridVisualizer(); // 2. 网格频谱

    drawRingWaveVisualizer(); // 3. 环形波形频谱

    drawWaterfallVisualizer(); // 4. 瀑布流频谱

    draw3DBarVisualizer();// 5. 3D柱状频谱

    drawSoundWaveVisualizer(); // 6. 声波纹效果

    animationId = requestAnimationFrame(draw);
}

// 开始可视化
function startVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    draw();
    playBtn.disabled = true;
    stopBtn.disabled = false;
    loadBtn.disabled = true;
}

// 停止音频和可视化
// 在stopAudio函数中移除事件监听
// 修改stopAudio函数，添加状态标志
function stopAudio() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // 移除进度条事件监听
    progressBarEL.removeEventListener('input', handleProgressBarChange);
    progressBarEL.removeEventListener('change', handleProgressBarChange);

    audioElement.pause();
    // 使用更安全的方式清空src
    audioElement.removeAttribute('src');
    audioElement.load(); // 重新加载以彻底清除

    [barCtx, circleCtx, waveCtx, dotCtx].forEach(ctx => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    playBtn.disabled = false;
    stopBtn.disabled = true;
    loadBtn.disabled = false;

    statusEL.textContent = "已停止";

    // 重置进度条
    progressBarEL.value = 0;
    currentTimeEL.textContent = "00:00";
    durationEL.textContent = "00:00";

    // 更新播放/暂停按钮状态
    updatePlayPauseBtn();
}


// 设置并播放自定义音频
function setAndPlayAudio(url) {
    initAudioContext();
    stopAudio();

    statusEL.textContent = "加载音频中...";

    audioElement.src = url;

    audioElement.oncanplaythrough = function () {
        // 只有在未连接过的情况下才创建新的source节点
        if (!isSourceConnected) {
            source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            isSourceConnected = true;
        }

        updateDuration();

        // 更新进度条和时间
        audioElement.addEventListener('timeupdate', () => {
            updateCurrentTime(audioElement.currentTime);
            updateProgressBar(audioElement.currentTime);
        });

        // 添加进度条拖动事件（在音频加载完成后添加）
        progressBarEL.addEventListener('input', handleProgressBarChange);
        progressBarEL.addEventListener('change', handleProgressBarChange);

        audioElement.play().then(() => {
            updatePlayPauseBtn();
            startVisualization();  // 音频可视化
            statusEL.textContent = "播放音频中...";
        }).catch(error => {
            statusEL.textContent = "播放错误: " + error.message;
        });
    };

    audioElement.onerror = function () {
        statusEL.textContent = "加载音频错误，请检查URL";
    };
}

// 添加进度条改变事件处理函数
function handleProgressBarChange(e) {
    if (audioElement.duration) {
        const seekTime = (e.target.value / 100) * audioElement.duration;
        audioElement.currentTime = seekTime;
        updateCurrentTime(seekTime);
    }
}

// 更新总时长
function updateDuration() {
    durationEL.innerText = formatTime(audioElement.duration);
}

// 更新当前播放时间
function updateCurrentTime(currentTime) {
    currentTimeEL.innerText = formatTime(currentTime);
}

// 格式化时间为 mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 更新进度条
function updateProgressBar(progress) {
    if (audioElement.duration) {
        progressBarEL.value = (progress / audioElement.duration) * 100;
    }
}

// 更新播放/暂停按钮的图标
// 修改updatePlayPauseBtn函数，处理无音频源的情况
function updatePlayPauseBtn() {
    if (audioElement.src && audioElement.src !== window.location.href) {
        playPauseBtnEL.innerHTML = audioElement.paused ?
            '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        playPauseBtnEL.disabled = false;
    } else {
        playPauseBtnEL.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtnEL.disabled = true;
    }
}

// 播放示例音频
// 修改playBtn的事件处理函数
playBtn.addEventListener('click', async function () {
    setAndPlayAudio('http://cdn.cc/music/%E6%97%A5%E9%9F%A9%E9%87%91%E6%9B%B2/Baby%20I%27m%20Sorry%20%28Inst.%29%20-%20MYNAME.mp3');
});

// 加载自定义音频
loadBtn.addEventListener('click', function () {
    const url = audioUrl.value.trim();
    if (url) {
        setAndPlayAudio(url);
    } else {
        statusEL.textContent = "请输入有效的音频URL";
    }
});

// 文件选择处理
fileSelectBtn.addEventListener('click', function () {
    fileInput.click();
});

fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const url = URL.createObjectURL(file);
        audioUrl.value = file.name;
        setAndPlayAudio(url);
    }
});

// 停止按钮
stopBtn.addEventListener('click', stopAudio);

// 支持直接按Enter键加载URL
audioUrl.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loadBtn.click();
    }
});

// 播放/暂停按钮
playPauseBtn.addEventListener('click', function () {
    // 检查是否有有效的音频源（不仅仅是src属性存在）
    if (audioElement.src && audioElement.src !== window.location.href) {
        if (audioElement.paused) {
            audioElement.play().catch(error => {
                console.error('播放失败:', error);
                statusEL.textContent = "播放失败，请重新加载音频";
            });
        } else {
            audioElement.pause();
        }
        updatePlayPauseBtn();
    } else {
        statusEL.textContent = "没有可播放的音频，请先加载音频";
    }
});

// 音量控制
volumeBarEL.addEventListener('input', (e) => {
    audioElement.volume = e.target.value / 100;
});

// 静音切换
muteBtnEL.addEventListener('click', () => {
    audioElement.muted = !audioElement.muted;
    muteBtnEL.innerHTML = audioElement.muted ?
        '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
});

// 初始化
resizeCanvases();