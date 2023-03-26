import time
import asyncio

class TaskQueue:
    def __init__(self, maxSize):
        self._maxSize = maxSize
        self._isShutdown = False
        self._lock = asyncio.Lock()
        self._queue = asyncio.Queue(maxsize=self._maxSize)

    async def addTask(self, coro):
        await self._queue.put([time.time(), coro])

    async def executeTasks(self):
        while not self._isShutdown and True:
            [addTime, coro] = await self._queue.get()
            async with self._lock:
                # TODO: 分离过滤逻辑
                if time.time() - addTime < 10:
                    await coro
                self._queue.task_done()

    async def stop(self):
        async with self._lock:
            self._queue = asyncio.Queue(maxsize=10)
            self._isShutdown = True

    async def start(self):
        async with self._lock:
            self._isShutdown = False
            asyncio.create_task(self.executeTasks())

