async def ChatTask(user, text, responseManager, speakManager):
    utter = await responseManager.getUtter(user, text)
    await speakManager.play(utter)
