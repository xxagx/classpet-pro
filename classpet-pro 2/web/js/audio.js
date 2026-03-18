// ClassPet Pro - 游戏感背景音乐系统 (8-bit风格)

class GameAudio {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.currentTrack = null;
        this.init();
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API不支持');
        }
    }

    // 8-bit音效生成器
    createOscillator(freq, type = 'square', duration, volume = 0.3) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        return { osc, gain };
    }

    // 播放音符序列（8-bit风格）
    playSequence(notes, tempo = 120) {
        if (!this.ctx) return;
        
        const beatDuration = 60 / tempo;
        let currentTime = this.ctx.currentTime;
        
        notes.forEach(note => {
            if (note.freq > 0) {
                const { osc } = this.createOscillator(
                    note.freq, 
                    'square', 
                    note.duration * beatDuration,
                    this.volume * (note.velocity || 1)
                );
                osc.start(currentTime);
                osc.stop(currentTime + note.duration * beatDuration);
            }
            currentTime += note.duration * beatDuration;
        });
    }

    // 背景音乐 - 轻快游戏风
    playBackgroundMusic() {
        if (this.isPlaying || !this.ctx) return;
        
        this.isPlaying = true;
        
        // C大调欢快旋律
        const melody = [
            { freq: 523.25, duration: 0.5, velocity: 0.8 },  // C5
            { freq: 587.33, duration: 0.5, velocity: 0.8 },  // D5
            { freq: 659.25, duration: 0.5, velocity: 0.8 },  // E5
            { freq: 523.25, duration: 0.5, velocity: 0.8 },  // C5
            { freq: 0, duration: 0.25, velocity: 0 },        // 休止
            { freq: 523.25, duration: 0.5, velocity: 0.8 },  // C5
            { freq: 587.33, duration: 0.5, velocity: 0.8 },  // D5
            { freq: 659.25, duration: 0.5, velocity: 0.8 },  // E5
            { freq: 783.99, duration: 0.5, velocity: 0.8 },  // G5
            { freq: 0, duration: 0.25, velocity: 0 },        // 休止
            { freq: 783.99, duration: 0.5, velocity: 0.8 },  // G5
            { freq: 659.25, duration: 0.5, velocity: 0.8 },  // E5
            { freq: 587.33, duration: 0.5, velocity: 0.8 },  // D5
            { freq: 523.25, duration: 1, velocity: 0.8 },    // C5
        ];
        
        // 循环播放
        const playLoop = () => {
            if (!this.isPlaying) return;
            this.playSequence(melody, 140);
            setTimeout(playLoop, 8000);
        };
        
        playLoop();
    }

    stopBackgroundMusic() {
        this.isPlaying = false;
    }

    // 加分音效 - 上升音阶
    playScoreUp() {
        if (!this.ctx) return;
        
        const notes = [
            { freq: 523.25, duration: 0.1, velocity: 1 },   // C5
            { freq: 659.25, duration: 0.1, velocity: 1 },   // E5
            { freq: 783.99, duration: 0.2, velocity: 1 },   // G5
            { freq: 1046.50, duration: 0.3, velocity: 1 },  // C6
        ];
        
        this.playSequence(notes, 200);
    }

    // 扣分音效 - 下降音阶
    playScoreDown() {
        if (!this.ctx) return;
        
        const notes = [
            { freq: 392.00, duration: 0.15, velocity: 0.8 }, // G4
            { freq: 349.23, duration: 0.15, velocity: 0.8 }, // F4
            { freq: 329.63, duration: 0.2, velocity: 0.8 },  // E4
        ];
        
        this.playSequence(notes, 180);
    }

    // 进化音效 - 胜利号角
    playEvolution() {
        if (!this.ctx) return;
        
        const notes = [
            { freq: 523.25, duration: 0.15, velocity: 1 },   // C5
            { freq: 659.25, duration: 0.15, velocity: 1 },   // E5
            { freq: 783.99, duration: 0.15, velocity: 1 },   // G5
            { freq: 1046.50, duration: 0.3, velocity: 1 },   // C6
            { freq: 0, duration: 0.1, velocity: 0 },         // 休止
            { freq: 1046.50, duration: 0.2, velocity: 1 },   // C6
            { freq: 1318.51, duration: 0.4, velocity: 1 },   // E6
        ];
        
        this.playSequence(notes, 160);
        
        // 添加和弦效果
        setTimeout(() => {
            this.createChord([523.25, 659.25, 783.99, 1046.50], 0.5);
        }, 400);
    }

    // 兑换奖励音效 - 金币声
    playRedeem() {
        if (!this.ctx) return;
        
        const notes = [
            { freq: 880.00, duration: 0.05, velocity: 1 },   // A5
            { freq: 1108.73, duration: 0.05, velocity: 1 },  // C#6
            { freq: 1318.51, duration: 0.1, velocity: 1 },   // E6
            { freq: 0, duration: 0.05, velocity: 0 },        // 休止
            { freq: 1318.51, duration: 0.1, velocity: 1 },   // E6
            { freq: 1567.98, duration: 0.2, velocity: 1 },   // G6
        ];
        
        this.playSequence(notes, 240);
    }

    // 点击音效 - 短促音
    playClick() {
        if (!this.ctx) return;
        
        const { osc } = this.createOscillator(800, 'sine', 0.05, 0.2);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // 成功音效
    playSuccess() {
        if (!this.ctx) return;
        
        const notes = [
            { freq: 659.25, duration: 0.1, velocity: 1 },    // E5
            { freq: 783.99, duration: 0.1, velocity: 1 },    // G5
            { freq: 987.77, duration: 0.2, velocity: 1 },    // B5
        ];
        
        this.playSequence(notes, 200);
    }

    // 失败/错误音效
    playError() {
        if (!this.ctx) return;
        
        const { osc } = this.createOscillator(150, 'sawtooth', 0.3, 0.3);
        osc.start();
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // 和弦生成
    createChord(frequencies, duration) {
        if (!this.ctx) return;
        
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                const { osc } = this.createOscillator(freq, 'triangle', duration, 0.2);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            }, i * 50);
        });
    }

    // 设置音量
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // 静音/取消静音
    toggleMute() {
        this.volume = this.volume > 0 ? 0 : 0.3;
        return this.volume > 0;
    }
}

// 背景音乐管理器
class BGMManager {
    constructor(audioInstance) {
        this.audio = audioInstance;
        this.enabled = true;
        this.volume = 0.2;
    }

    start() {
        if (this.enabled && this.audio) {
            this.audio.setVolume(this.volume);
            this.audio.playBackgroundMusic();
        }
    }

    stop() {
        if (this.audio) {
            this.audio.stopBackgroundMusic();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.start();
        } else {
            this.stop();
        }
        return this.enabled;
    }
}

// 导出
window.GameAudio = GameAudio;
window.BGMManager = BGMManager;
