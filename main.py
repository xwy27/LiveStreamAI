# -*- coding: utf-8 -*-
import asyncio

from handler import RoomHandler
from utils import config

async def main():
    myRoom = RoomHandler(config.get("房间号"))
    await myRoom.start()

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
