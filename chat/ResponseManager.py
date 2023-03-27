import json
import copy
from abc import ABC, abstractmethod

import openai

from utils import config
from utils import historyDB

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
testResponseManager = TestResponseManager()

# Up 性格 prompt
UpCharacteristic = config.getOrDefault("UpCharacteristic", [])
# openai 认证
openai.api_key = config.getOrDefault("OpenAIAPIKey", "TEST")
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
openAIResponseManager = OpenAIResponseManager()