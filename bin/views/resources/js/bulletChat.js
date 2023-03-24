var ws = null // websocket

//生成认证数据
function getCertification(json) {
    let encoder = new TextEncoder(); //编码器
    let jsonView = encoder.encode(json); //utf-8编码
    let buff = new ArrayBuffer(jsonView.byteLength + 16); //数据包总长度：16位头部长度+bytes长度
    let view = new DataView(buff); //新建操作视窗
    view.setUint32(0, jsonView.byteLength + 16); //整个数据包长度
    view.setUint16(4, 16); //头部长度
    view.setUint16(6, 1); //协议版本
    view.setUint32(8, 7); //类型,7为加入房间认证
    view.setUint32(12, 1); //填1
    for (let r = 0; r < jsonView.byteLength; r++) {
        view.setUint8(16 + r, jsonView[r]); //填入数据
    }
    return buff;
}

//处理服务器发送过来的数据，初步打包
/*打包格式（JSON）
键        值类型
Len        int
HeadLen     int
Ver        int
Type       int
Num        int
body       JSON（Type != 3）或者int（Type == 3）
*/
function handleMessage(blob, call) {
    let reader = new FileReader();
    reader.onload = function (e) {
        let buff = e.target.result; //ArrayBuffer对象
        let decoder = new TextDecoder(); //解码器
        let view = new DataView(buff); //视图
        let offset = 0;
        let packet = {};
        let result = [];
        while (offset < buff.byteLength) { //数据提取
            let packetLen = view.getUint32(offset + 0);
            let headLen = view.getUint16(offset + 4);
            let packetVer = view.getUint16(offset + 6);
            let packetType = view.getUint32(offset + 8);
            let num = view.getUint32(12);
            if (packetVer == 3) { //解压数据
                let brArray = new Uint8Array(buff, offset + headLen, packetLen - headLen);
                let BrotliDecode = makeBrotliDecode(); //生成Brotli格式解压工具的实例
                let buffFromBr = BrotliDecode(brArray); //返回Int8Array视图
                let view = new DataView(buffFromBr.buffer);
                let offset_Ver3 = 0;
                while (offset_Ver3 < buffFromBr.byteLength) { //解压后数据提取
                    let packetLen = view.getUint32(offset_Ver3 + 0);
                    let headLen = view.getUint16(offset_Ver3 + 4);
                    let packetVer = view.getUint16(offset_Ver3 + 6);
                    let packetType = view.getUint32(offset_Ver3 + 8);
                    let num = view.getUint32(12);
                    packet.Len = packetLen;
                    packet.HeadLen = headLen;
                    packet.Ver = packetVer;
                    packet.Type = packetType;
                    packet.Num = num;
                    let dataArray = new Uint8Array(buffFromBr.buffer, offset_Ver3 + headLen, packetLen -
                        headLen);
                    packet.body = decoder.decode(dataArray); //utf-8格式数据解码，获得字符串
                    result.push(JSON.stringify(packet)); //数据打包后传入数组
                    offset_Ver3 += packetLen;
                }
            } else {
                packet.Len = packetLen;
                packet.HeadLen = headLen;
                packet.Ver = packetVer;
                packet.Type = packetType;
                packet.Num = num;
                let dataArray = new Uint8Array(buff, offset + headLen, packetLen - headLen);
                if (packetType == 3) { //获取人气值
                    packet.body = (new DataView(buff, offset + headLen, packetLen - headLen)).getUint32(
                        0); //若入参为dataArray.buffer，会返回整段buff的视图，而不是截取后的视图
                } else {
                    packet.body = decoder.decode(dataArray); //utf-8格式数据解码，获得字符串
                }
                result.push(JSON.stringify(packet)); //数据打包后传入数组
            }
            offset += packetLen;
        }
        call(result); //数据后续处理
    }
    reader.readAsArrayBuffer(blob); //读取服务器传来的数据转换为ArrayBuffer
}

function webSocket(roomId) {
    if ("WebSocket" in window) {
        console.log("房间号：" + roomId);
        var timer;
        ws = new WebSocket("wss://broadcastlv.chat.bilibili.com:443/sub");

        ws.onopen = function (e) {
            console.log("open");
            var certification = {
                "uid": 0,
                "roomid": roomId,
                "protover": 3,
                "platform": "web",
                "type": 2,
                "key": "" //值为空字符串好像也没问题
            }
            ws.send(getCertification(JSON.stringify(certification)));
            console.log(JSON.stringify(certification))
            //发送心跳包
            timer = setInterval(function () {
                let buff = new ArrayBuffer(16);
                let i = new DataView(buff);
                i.setUint32(0, 0); //整个封包
                i.setUint16(4, 16); //头部
                i.setUint16(6, 1); //协议版本
                i.setUint32(8, 2); //操作码,2为心跳包
                i.setUint32(12, 1); //填1
                ws.send(buff);
            }, 30000); //30秒

        }

        ws.onmessage = function (e) {
            //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
            let blob = e.data;
            handleMessage(blob, function (result) {
                //触发事件
                for (let i = 0; i < result.length; i++) {
                    let json = JSON.parse(result[i]);
                    if (json.Type == 5) {
                        let event = new CustomEvent(JSON.parse(json.body).cmd, {
                            detail: JSON.parse(json.body)
                        });
                        eventTarget.dispatchEvent(event);
                    }
                    if (json.Type == 8) {
                        let event = new CustomEvent("Certify_Success", {
                            detail: JSON.parse(json.body)
                        });
                        eventTarget.dispatchEvent(event);
                    }
                    if (json.Type == 3) {
                        let event = new CustomEvent("VIEW", {
                            detail: json.body
                        });
                        eventTarget.dispatchEvent(event);
                    }
                }
            });
        }

        ws.onclose = function (e) {
            //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
            console.log("server close");
            if (timer != null) {
                clearInterval(timer); //停止发送心跳包
            }
            // setTimeout(webSocket, 4000); //4秒后重连
        }

        ws.onerror = function (e) {
            //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
            console.log(e);
        }
    } else {
        console.log("您的浏览器不支持WebSocket");
    }
}

