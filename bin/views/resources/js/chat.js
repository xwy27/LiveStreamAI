// TODO: TTS(可迁移)
// 简单起见，在前台利用web内置的TTS实现，实质上可以直接在后台完成，并且接入风格化模型
const isSynthesAvailable = true
if (!window.speechSynthesis) {
    isSynthesAvailable = false;
    alert('您的设备不支持语音合成功能');
}
const voice = speechSynthesis.getVoices().filter((voice) => {
    return voice.name.includes('普通话');
})[0];

async function speak(text, volume=1, pitch=1.1, rate=1.1) {
    return new Promise((resolve, reject) => {
        if (!isSynthesAvailable) {
            reject();
        }
        const utterance = new SpeechSynthesisUtterance(
            text=text,
            volume=volume,
            pitch=pitch,
            rate=rate
        );
        utterance.voice = voice;
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
    });
};

async function chatAI(user, text) {
    if (typeof user != 'string' || typeof text != 'string' || user.length <= 0 || text.length <= 0) {
        return ""
    }

    const utter = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ user: user, text: text})
    }).then(res => {
        return res.json();
    });
    return utter["msg"];
}

class ChatQueue {
    constructor() {
        this.maxSize = 10;
        this.queue = [];
        this.isProcessing = false;
    }

    async doChat(user, input) {
        const utter = await chatAI(user, input);
        return utter;
    }

    async addChat(user, input) {
        return new Promise((resolve, reject) => {
            if (this.queue.length == this.maxSize) {
                reject(Error("队列已满"));
            }
            const timestamp = new Date();
            this.queue.push({ user, input, timestamp, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing) return;
        if (this.queue.length == 0) return;
        this.isProcessing = true;
        const { user, input, timestamp, resolve, reject } = this.queue.shift();
        // TODO: 分离fitler逻辑
        // 丢弃消息：时间久于15s，或添加其他逻辑
        const timeDiff = new Date() - timestamp;
        if (this.queue.length > 0 && timeDiff >= 15000) {
            reject(Error("超时"));
        }
        try {
            const response = await this.doChat(user, input)
            await speak("对于" + input + ", 我认为：" + response);
            resolve();
        } catch (error) {
            reject(error);
        }
        this.isProcessing = false;
    }

    clear() {
        this.isProcessing = true;
        this.queue = [];
        this.isProcessing = false;
    }
}

const chatQueue = new ChatQueue();