from bilibili_api import live

from chat import ChatTask, testResponseManager, edgtTTSSpeakManager, openAIResponseManager
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
                ChatTask(
                    user=user,
                    text=text,
                    # custom ResponseManager and SpeakManager can be replaced
                    # refer to chat/ResponseManager.py and chat/SpeakManager.py
                    responseManager=testResponseManager,
                    speakManager=edgtTTSSpeakManager,
                ),
            )
            print(f"[{self.room.room_display_id}] {user}: {text}")
