from bilibili_api import live

from chat import chatTask, testResponseManager, edgtTTSSoundManager, openAIResponseManager
from utils import TaskQueue

class RoomHandler:
    def __init__(self, room) -> None:
        self._danmakuQueue = TaskQueue(maxSize=10)
        self.room = live.LiveDanmaku(room)
        self.handlers = {
            "DANMU_MSG": self.on_danmaku
        }
        self.registerHandlers()

    def registerHandlers(self):
        for event_type, handler in self.handlers.items():
            self.room.add_event_listener(event_type, handler)

    async def start(self):
        await self._danmakuQueue.start()
        await self.room.connect()

    async def stop(self):
        await self._danmakuQueue.stop()
        await self.room.disconnect()

    async def on_danmaku(self, event):
        text = event["data"]["info"][1]
        user = event["data"]["info"][2][1]
        if text.startswith("Q:"):
            text = text[2:].strip()
            if len(text) <= 0:
                return
            await self._danmakuQueue.addTask(
                chatTask(
                    user=user,
                    text=text,
                    # custom responseManager and soundManager can be replaced
                    # refer to chat/chat.py and chat/sound.py
                    responseManager=testResponseManager,
                    soundManager=edgtTTSSoundManager,
                ),
            )
            print(f"[{self.room}] - {user}: {text}")
