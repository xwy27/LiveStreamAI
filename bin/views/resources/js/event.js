var eventTarget = new EventTarget();

//事件注册
function regisiter(eventType, callback) {
    eventTarget.addEventListener(eventType, function (e) {
        callback(e.detail);
    });
}

//认证成功事件
regisiter("Certify_Success", function (e) {
    let data = e;
    if (data.code == 0) {
        console.log("Certify_Success");
    }
})

//人气值刷新事件
regisiter("VIEW", function (e) {
    let data = e;
    // TODO:
    // console.log("VIEW: " + data.toString());
})

// 进入直播间或关注直播间事件
regisiter("INTERACT_WORD", function (e) {
    let data = e;
    let uname = data.data.uname;
    let timedata = new Date(data.data.timestamp * 1000);
    let time = timedata.toLocaleDateString() + " " + timedata.toTimeString().split(" ")[0];
    // TODO:
    if (data.data.msg_type == 2) { //个人推测，不一定准确
        console.log(time + " " + uname + " 关注直播间");
    } else {
        // console.log(data.cmd + " " + time + " " + uname + " 进入直播间");
    }
})

// 高能榜单进入直播间(?)
regisiter("ENTRY_EFFECT", function (e) {
    let data = e;
    let uname = data.data.copy_writing.split("<" + "%")[1].split("%>")[0];
    let timedata = new Date(data.data.trigger_time / 1000000);
    let time = timedata.toLocaleDateString() + " " + timedata.toTimeString().split(" ")[0];
    // TODO:
    // console.log(data.cmd + " " + time + " " + uname + " 进入直播间");
})

//礼物赠送事件
regisiter("SEND_GIFT", function (e) {
    let data = e;
    let uname = data.data.uname;
    let gift_num = data.data.num;
    let act = data.data.action;
    let gift_name = data.data.giftName;
    let timedata = new Date(data.data.timestamp * 1000);
    let time = timedata.toLocaleDateString() + " " + timedata.toTimeString().split(" ")[0];
    // TODO:
    // console.log(data.cmd + " " + time + " " + uname + " :" + act + " " + gift_num + " " + gift_name);
})

//弹幕事件
regisiter("DANMU_MSG", function (e) {
    let data = e;
    let uname = data.info[2][1];
    let timedata = new Date(data.info[9].ts * 1000);
    let time = timedata.toLocaleDateString() + " " + timedata.toTimeString().split(" ")[0];
    let text = data.info[1];
    // TODO: 解析提问弹幕
    // if (!text.startsWith("Q:")) {
    //     return;
    // }
    // text = text.substring(2).trim()
    console.log(data.cmd + " " + time + " " + uname + " :" + text);
    taskQueue.addTask(doChat, {
        "user": uname,
        "text": text
    });
})
