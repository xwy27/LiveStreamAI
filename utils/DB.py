# -*- coding:utf-8 -*-
import sqlite3
import codecs

class HistoryDB:
    def __init__(self) -> None:
        self.connection = sqlite3.connect("history.db")
        self.connection.text_factory = self.decode
        self.cursor = self.connection.cursor()
        self.historyTable = "History"
        self._initDB()

    def decode(self, s):
        if isinstance(s, bytes):
            return codecs.decode(s, "unicode_escape")
        return s

    def _initDB(self) -> None:
        self.cursor.execute(
            f"CREATE TABLE IF NOT EXISTS {self.historyTable} (name TEXT primary key, history TEXT)"
        )

    def getHistory(self, name: str) -> str:
        return self.cursor.execute(
            f"SELECT history FROM {self.historyTable} WHERE name = ?",
            (name,),
        ).fetchone()

    def getAllHistory(self) -> str:
        return self.cursor.execute(
            f"SELECT history FROM {self.historyTable}"
        ).fetchall()


    def insertHistory(self, name: str, history: str) -> None:
        self.cursor.execute(
            f"INSERT OR REPLACE INTO {self.historyTable} VALUES (?, ?)",
            (name, history),
        )

    def cleanDB(self) -> None:
        self.cursor.execute(f"DELETE FROM {self.historyTable}")
        print("对话历史数据已清除...")

    def closeDB(self) -> None:
        self.cleanDB() # TODO: 定期清除
        self.cursor.close()
        self.connection.close()

historyDB = HistoryDB()