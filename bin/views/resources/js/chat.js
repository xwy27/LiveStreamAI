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

async function fetchAIUtterance(user, text) {
    const utter = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ user: user, text: text})
    }).then(res => {
        return res.json();
    });
    return utter["msg"];
}

async function doChat(parameters) {
    const user = parameters["user"];
    const text = parameters["text"];
    if (typeof user != 'string' || typeof text != 'string' ||
        user.length <= 0 || text.length <= 0) {
        return "";
    }
    // fetch ai utterance
    const utter = await fetchAIUtterance(user, text);
    console.log("doChat", parameters, utter);
    await speak("对于" + parameters["text"] + ", 我认为：" + utter);
}

class TaskQueue {
    constructor() {
        this.maxSize = 10;
        this.queue = [];
        this.isRunning = false;
    }

    async addTask(task, parameters) {
        if (this.queue.length == this.maxSize) {
            console.error(Error("队列已满"));
            return;
        }
        const timestamp = new Date();
        this.queue.push({ task, parameters, timestamp });
        this.processQueue();
    }

    async processQueue() {
        if (this.isRunning) return;
        this.isRunning = true;
        while (this.queue.length > 0) {
            console.log("processing...");
            const { task, parameters, timestamp } = this.queue.shift();
            // TODO: 分离fitler逻辑
            // 丢弃消息：时间久于15s，或添加其他逻辑
            const timeDiff = new Date() - timestamp;
            if (this.queue.length > 0 && timeDiff >= 15000) {
                continue;
            }
            try {
                await task(parameters);
            } catch (error) {
                console.error(error);
            }
        }
        this.isRunning = false;
    }

    clear() {
        this.isRunning = false;
        this.queue = [];
    }
}

const taskQueue = new TaskQueue();