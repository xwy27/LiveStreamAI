import os
import json
import copy
from abc import ABC, abstractmethod

from utils import config

class BaseResponseManager(ABC):
    ''' 对话响应生成基类 '''
    def __init__(self) -> None:
        pass

    @abstractmethod
    async def getUtter(self, user, text) -> str:
        raise NotImplementedError("子类必须实现该方法")

class TestResponseManager(BaseResponseManager):
    def __init__(self) -> None:
        pass

    async def getUtter(self, user, text) -> str:
        message = {"role": "assitante", "content": "测试返回"}
        return f"对于{text}，我认为{message['content']}"

class OpenAIResponseManager(BaseResponseManager):
    def __init__(self) -> None:
        super().__init__()

    async def getUtter(self, user, text) -> str:
        # get history data
        history = json.loads((historyDB.getHistory(user) or ("[]",))[0])
        # merge charactersitic
        messages = copy.deepcopy(UpCharacteristic)
        messages.extend(history)
        # add current utterance
        messages.append({"role": "user", "content": text})
        # retrieve ai response
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages= messages
            )
        except Exception as e:
            print(f"Error: {e}")
            return ""
        message = response["choices"][0]["message"]
        # save history
        messages.append(message)
        return f"对于{text}，我认为{message['content']}"

class ChatterBotResponseManager(BaseResponseManager):
    def __init__(self) -> None:
        import chatterbot
        # 获取模型数据库路径
        CUR_DIR = os.path.dirname(os.path.abspath(__file__))
        database_uri = os.path.abspath(os.path.join(CUR_DIR, "../ChatterBot/chatterbot.sqlite3"))
        self.chatbot = chatterbot.ChatBot(
            "ChatBot", # Name of the chatbot
            storage_adapter="chatterbot.storage.SQLStorageAdapter",
            database_uri=f"sqlite:///{database_uri}"
        )
        super().__init__()

    async def getUtter(self, user, text) -> str:
        # TODO: user history
        return f"对于{text}，我认为{self.chatbot.get_response(text).text}"

''' 继承回复生成基类后，在这里添加载入代码
    修改config/config.txt中的 ResponseManager 配置即可使用自定义声音播放
    可参考：ChatterBotResponseManager 使用方式
'''
responseManager = None
chosen = config.getOrDefault("ResponseManager", "TestResponseManager")
if chosen == "TestResponseManager":
    responseManager = TestResponseManager()
elif chosen == "ChatterBotResponseManager":
    responseManager = ChatterBotResponseManager()
elif chosen == "OpenAIResponseManager":
    import openai
    from utils import historyDB
    # Up 性格 prompt
    UpCharacteristic = config.getOrDefault("UpCharacteristic", [])
    # openai 认证
    openai.api_key = config.getOrDefault("OpenAIAPIKey", "TEST")
    responseManager = OpenAIResponseManager()
else:
    pass