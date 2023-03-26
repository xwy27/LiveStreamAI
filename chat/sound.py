from abc import ABC, abstractclassmethod
from io import BytesIO

import edge_tts
import pygame

class BaseSoundManager(ABC):
    def __init__(self) -> None:
        super().__init__()

    @abstractclassmethod
    async def play(utter):
        raise NotImplementedError("子类必须实现该方法")


class EdgeTTSSoundManager(BaseSoundManager):
    def __init__(self) -> None:
        pass

    async def getSound(self, text):
        voice = "zh-CN-XiaoxiaoNeural"
        communicate = edge_tts.Communicate(text, voice, rate="+0%", volume="+10%")
        mp3 = b''
        try:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    mp3 += chunk["data"]
        except edge_tts.exceptions.NoAudioReceived:
            print("failed")
        finally:
            return mp3

    async def play(self, utter):
        MP3ByteData = await self.getSound(utter)
        pygame.init()
        file = BytesIO(MP3ByteData)
        sound = pygame.mixer.Sound(file)
        sound.play()
        pygame.time.wait(int(sound.get_length() * 1000))
        pygame.quit()
edgtTTSSoundManager = EdgeTTSSoundManager()
