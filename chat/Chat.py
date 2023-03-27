from .ResponseManager import testResponseManager
from .SpeakManager import edgtTTSSpeakManager

async def ChatTask(
    user,
    text,
    responseManager=testResponseManager,
    speakManager=edgtTTSSpeakManager
):
    utter = await responseManager.getUtter(user, text)
    await speakManager.play(utter)
