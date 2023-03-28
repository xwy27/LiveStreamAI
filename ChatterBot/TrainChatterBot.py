import os
import chatterbot
from chatterbot.trainers import ChatterBotCorpusTrainer, ListTrainer

chatbot = chatterbot.ChatBot(
    "ChatBot", # Name of the chatbot
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///chatterbot.sqlite3"
)

# 使用lib提供的语料
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train("chatterbot.corpus.chinese") # 中文
# trainer.train("chatterbot.corpus.english") # 英文

# 使用自己的语料
with open(os.path.join("./ChatData.txt"), "r", encoding="utf-8") as f:
    trainer = ListTrainer(chatbot)
    trainer.train(f.readlines())