import os

class Config(object):
    def __init__(self) -> None:
        self.config = dict()
        self.required_configs = ["房间号"]

        CUR_DIR = os.path.dirname(os.path.abspath(__file__))
        # 读取配置文件
        filePath = os.path.join(CUR_DIR, "../config/config.txt")
        if not os.path.exists(filePath):
            print("缺少配置文件: config.txt")
            exit(-1)
        with open(filePath, 'r') as f:
            for line in f.readlines():
                data = line.strip()
                if len(data) == 0:
                    continue
                if data.find("=") == -1:
                    print("配置文件格式错误")
                    exit(-1)
                data = data.split("=")
                self.config[data[0]] = data[1]
        self.loadCustomConfig(CUR_DIR)
        self.checkRequiredConfig()

    def loadCustomConfig(self, CUR_DIR):
        ''' 载入自定义配置, 按需修改 '''
        # OpenAI: Up 性格 prompt
        filePath = os.path.join(CUR_DIR, "../config/UpCharacteristic.txt")
        if not os.path.exists(filePath):
            print("缺少配置文件: UpCharacteristic.txt")
            exit(-1)
        self.config["UpCharacteristic"] = []
        with open(filePath, 'r') as f:
            for line in f.readlines():
                data = line.strip()
                if len(data) == 0:
                    continue
                self.config["UpCharacteristic"].append({"role": "system", "content": data})

    def checkRequiredConfig(self):
        errorMsg = ""
        for key in self.required_configs:
            if key not in self.config:
                errMsg += f"缺少配置:{key}\n"
        if errorMsg != "":
            print(errorMsg)
            exit(-1)

    def getOrDefault(self, key, default):
        return self.config.get(key, default)

    def get(self, key):
        return self.config[key]

config = Config()