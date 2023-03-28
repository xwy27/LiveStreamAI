from abc import ABC, abstractclassmethod

from utils import config

class BaseSpeakManager(ABC):
    ''' 声音播放基类 '''
    def __init__(self) -> None:
        super().__init__()

    @abstractclassmethod
    async def play(utter):
        raise NotImplementedError("子类必须实现该方法")

class EdgeTTSSpeakManager(BaseSpeakManager):
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
edgtTTSSpeakManager = EdgeTTSSpeakManager()

''' 继承声音播放基类后，在这里添加载入代码
    修改config/config.txt中的 SpeakManager 配置即可使用自定义声音播放
    可参考：EdgeTTSSpeakManager 使用方式
'''
speakManager = None
chosen = config.getOrDefault("SpeakManager", "EdgeTTSSpeakManager")
if chosen == "EdgeTTSSpeakManager":
    from io import BytesIO
    import edge_tts
    import pygame
    speakManager = EdgeTTSSpeakManager()
else:
    pass
