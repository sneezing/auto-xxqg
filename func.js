importClass(android.graphics.Paint);
importClass(android.view.View);
//db操作
importClass(android.database.sqlite.SQLiteDatabase);

var tikuCommon = require("./tikuCommon.js");
var PrefCheckBox = require('./config.js');
var questionCommon = require("./questionCommon.js");
var competition = require("./competition.js");

var storage = storages.create("data");

/**
 * @description: 获取json数组元素个数函数
 * @param: jsonData-json数据
 * @return: null
 */
function getJsonLength(jsonData) {
    var jsonLength = 0;
    for (var item in jsonData) {
        jsonLength++;
    }
    return jsonLength;
}


/**
 * @description: 新闻联播小视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_news(n, seconds) {
    seconds = parseInt(seconds) + parseInt(random(0, 10));
    for (var i = 0; i < seconds; i += 5) {
        sleep(5000);
        while (!text("播放").exists()) //如果离开了联播小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个新闻小视频界面，请重新返回视频");
            delay(2);
        }
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        toast("这是防息屏弹窗，请无视 awa");
    }
}

/**
 * @description: 广播学习计时(弹窗)函数
 * @param: r_time-已经收听的时间 seconds-学习秒数
 * @return: null
 */
function radio_timing(r_time, seconds) {
    for (var i = 0; i < seconds; i++) {
        sleep(1000);
        if (i % 20 == 0) //每5秒打印一次信息
        {
            console.info("广播已经收听" + (i + 1 + r_time) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        if (i % 15 == 0) //每15秒弹一次窗防止息屏
        {
            toast("这是防息屏弹窗，可忽略-. -");
        }
    }
}

/*      数据库控制函数开始  来源:lazystudy*/
/**
 * @description: 读取文章数据库
 * @param: title,date
 * @return: res
 */
function getLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    var dbName = "tiku.db";
    //文件路径
    var path = files.path(dbName);
    //确保文件存在
    if (!files.exists(path)) {
        // files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    //创建或打开数据库
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(500),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    // db.execSQL(cleanTable);
    var sql = "SELECT * FROM  learnedArticles WHERE title = '" + rtitle + "' AND date = '" + date + "'";
    var cursor = db.rawQuery(sql, null);
    var res = cursor.moveToFirst();
    cursor.close();
    db.close();
    log(res);
    return res;
}

/**
 * @description: 获取的文章题目写入数据库
 * @param: title,date
 * @return: res
 */
function insertLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    var dbName = "tiku.db";
    var path = files.path(dbName);
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(253),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    var sql = "INSERT INTO learnedArticles VALUES ('" + rtitle + "','" + date + "')";
    db.execSQL(sql);
    db.close();
}

/*        数据库控制函数结束         */

/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    seconds = parseInt(seconds);
    var randNum = random(0, 10);
    randNum = parseInt(randNum); //惨痛的教训:这里必须要转成int类型，否则就成了几百秒 xzy 2021-5-5更新
    seconds = seconds + randNum;
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    for (var i = 0; i < seconds; i++) {
        while (!textContains("欢迎发表你的观点").exists()) //如果离开了文章界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            delay(2);
        }
        if (i % 5 == 0) //每5秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "篇文章已经学习" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        sleep(1000);
        if (i % 10 == 0) //每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
        {
            toast("这是防息屏toast,请忽视-。-");
            if (i <= seconds / 2) {
                swipe(x, h1, x, h2, 500); //向下滑动
            } else {
                swipe(x, h2, x, h1, 500); //向上滑动
            }
        }
    }
}

function CollectAndShareAndComment() {
    while (!desc("工作").exists()); //等待加载出主页
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    delay(2);
    var zt_flag = false; //判断进入专题界面标志
    var fail = 0; //点击失败次数
    var date_string = getTodayDateString(); //获取当天日期字符串
    for (var i = 0, t = 0; i < cCount;) {
        try {
            if ((id("general_card_title_id").findOnce(t).parent().parent().click() || id("general_card_title_id").findOnce(t).parent().parent().parent().click()) == true) {
                delay(5);
                // // delay(10); //等待加载出文章页面，后面判断是否进入了视频文章播放要用到
                //获取当前正在阅读的文章标题
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists()) { //如果没有找到评论框则认为没有进入文章界面，一直等待
                    delay(2);
                    console.warn("正在等待加载文章界面...");
                    if (n > 3) { //等待超过3秒则认为进入了专题界面，退出进下一篇文章
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (text("展开").exists()) { //如果存在“展开”则认为进入了文章栏中的视频界面需退出
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    delay(2);
                    continue;
                }
                if (zt_flag == true) { //进入专题页标志
                    console.warn("进入了专题界面，即将退出并进下一篇文章!");
                    t++;
                    back();
                    delay(2);
                    zt_flag = false;
                    continue;
                }
                var currentNewsTitle = ""
                if (id("xxqg-article-header").exists()) {
                    currentNewsTitle = id("xxqg-article-header").findOne().child(0).text(); // 最终解决办法
                } else if (textContains("来源").exists()) {
                    currentNewsTitle = textContains("来源").findOne().parent().children()[0].text();
                } else if (textContains("作者").exists()) {
                    currentNewsTitle = textContains("作者").findOne().parent().children()[0].text();
                } else if (descContains("来源").exists()) {
                    currentNewsTitle = descContains("来源").findOne().parent().children()[0].desc();
                } else if (descContains("作者").exists()) {
                    currentNewsTitle = descContains("作者").findOne().parent().children()[0].desc();
                }
                console.log("正在学习第" + (i + 1) + "篇文章,标题：", currentNewsTitle);
                CollectAndShare(i); //收藏+分享 若运行到此报错请注释本行！
                Comment(i); //评论
                delay(2);
                back(); //返回主界面
                while (!desc("工作").exists()); //等待加载出主页
                delay(2);
                i++;
                t++; //t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
            } else {
                t++;
            }
        } catch (e) {
            listView.scrollForward();
            t = 0;
            delay(1.5);
        }
    }
}

/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function articleStudy(x) {
    while (!desc("工作").exists()); //等待加载出主页
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    if (x == 0) {
        desc("工作").click(); //点击主页正下方的"学习"按钮
        delay(2);
        click(aCatlog);
    }
    delay(2);
    var zt_flag = false; //判断进入专题界面标志
    var fail = 0; //点击失败次数
    var date_string = getTodayDateString(); //获取当天日期字符串
    for (var i = 0, t = 0; i < aCount;) {
        try {
            if ((id("general_card_title_id").findOnce(t).parent().parent().click() || id("general_card_title_id").findOnce(t).parent().parent().parent().click()) == true) {
                delay(5);
                // // delay(10); //等待加载出文章页面，后面判断是否进入了视频文章播放要用到
                //获取当前正在阅读的文章标题
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists()) { //如果没有找到评论框则认为没有进入文章界面，一直等待
                    delay(2);
                    console.warn("正在等待加载文章界面...");
                    if (n > 3) { //等待超过3秒则认为进入了专题界面，退出进下一篇文章
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (text("展开").exists()) { //如果存在“展开”则认为进入了文章栏中的视频界面需退出
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    /* if (rTime != 0) {
                        while (!desc("工作").exists());
                        console.info("因为广播被打断，重新收听广播...");
                        delay(0.5);
                        listenToRadio();//听电台广播
                        while (!desc("工作").exists());
                        desc("工作").click();
                    } */
                    delay(2);
                    continue;
                }
                if (zt_flag == true) { //进入专题页标志
                    console.warn("进入了专题界面，即将退出并进下一篇文章!");
                    t++;
                    back();
                    delay(2);
                    zt_flag = false;
                    continue;
                }
                var currentNewsTitle = ""
                if (id("xxqg-article-header").exists()) {
                    currentNewsTitle = id("xxqg-article-header").findOne().child(0).text(); // 最终解决办法
                } else if (textContains("来源").exists()) {
                    currentNewsTitle = textContains("来源").findOne().parent().children()[0].text();
                } else if (textContains("作者").exists()) {
                    currentNewsTitle = textContains("作者").findOne().parent().children()[0].text();
                } else if (descContains("来源").exists()) {
                    currentNewsTitle = descContains("来源").findOne().parent().children()[0].desc();
                } else if (descContains("作者").exists()) {
                    currentNewsTitle = descContains("作者").findOne().parent().children()[0].desc();
                } else {
                    console.log("无法定位文章标题,即将退出并阅读下一篇")
                    t++;
                    back();
                    delay(2);
                    continue;
                }
                if (currentNewsTitle == "") {
                    console.log("标题为空,即将退出并阅读下一篇")
                    t++;
                    back();
                    delay(2);
                    continue;
                }
                var flag = getLearnedArticle(currentNewsTitle, date_string);
                if (flag) {
                    //已经存在，表明阅读过了
                    console.info("该文章已经阅读过，即将退出并阅读下一篇");
                    t++;
                    back();
                    delay(2);
                    continue;
                } else {
                    //没阅读过，添加到数据库
                    insertLearnedArticle(currentNewsTitle, date_string);
                }
                console.log("正在学习第" + (i + 1) + "篇文章,标题：", currentNewsTitle);
                fail = 0; //失败次数清0
                //开始循环进行文章学习
                //log(i+"next"+aTime);
                article_timing(i, aTime);
                if (i < cCount) {
                    CollectAndShare(i); //收藏+分享 若运行到此报错请注释本行！
                    Comment(i); //评论
                }
                delay(2);
                back(); //返回主界面
                while (!desc("工作").exists()); //等待加载出主页
                delay(2);
                i++;
                t++; //t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
            } else {
                t++;
            }
        } catch (e) {
            listView.scrollForward();
            t = 0;
            delay(1.5);
        }
    }

}

function main() {
    if (!judge_tiku_existence()) { //题库不存在则退出
        return;
    }
    try {
        if (!requestScreenCapture()) {
            toastLog("请求截图失败，停止执行！");
            exit();
        }
    } catch (e) {
        console.error("[捕获错误] " + e);
    }
    auto.waitFor(); //等待获取无障碍辅助权限
    start_app(); //启动app
    var start = new Date().getTime(); //程序开始时间 

    getScores(); //获取积分
    var randomNum = random(0, 4);
    console.info("开始随机执行任务顺序：" + randomNum);
    toastLog("第一步：打开广播")
    listenToRadio();
    while (myScores["双人对战"] < 1 || myScores["四人赛"] < 3 || myScores['本地频道'] != 1 || myScores['挑战答题'] != 6 || myScores['每日答题'] != 5 || myScores['视听学习'] != 6 || myScores['我要选读文章'] != 12 /*|| myScores['分享'] != 1 || myScores['发表观点'] != 1*/ ) {
        toastLog("双人对战会影响整体刷分效果，请单独执行！");
        toastLog("四人赛会影响整体刷分效果，请单独执行！");
        switch (randomNum) {
            case 0:
                if (myScores['每日答题'] != 5) {
                    dailyQuestion();
                }
                //if (myScores["双人对战"] < 1) {competition.SR();} 
                if (myScores['挑战答题'] != 6) {
                    challengeQuestion();
                }
                //if (myScores["四人赛"] < 3) {competition.zsy();}  
                if (myScores['专项答题'] < 4) {
                    specialQuestion();
                }
                //if (myScores['视听学习'] != 6){if(storage.get("videoChoose") == 1){videoStudy_bailing();}else{videoStudy_news();}}
                if (myScores['我要选读文章'] != 12) {
                    articleStudy();
                }
                if (myScores['每周答题'] < 4) {
                    weeklyQuestion();
                }
                if (myScores['本地频道'] != 1) {
                    localChannel1();
                }
                break;
            case 1:
                if (myScores['每周答题'] < 4) {
                    weeklyQuestion();
                }
                if (myScores['本地频道'] != 1) {
                    localChannel1();
                }
                if (myScores['挑战答题'] != 6) {
                    challengeQuestion();
                }
                if (myScores['专项答题'] < 4) {
                    specialQuestion();
                }
                //if (myScores["四人赛"] < 3) {competition.zsy();}
                //if (myScores['视听学习'] != 6){if(storage.get("videoChoose") == 1){videoStudy_bailing();}else{videoStudy_news();}}
                if (myScores['每日答题'] != 5) {
                    dailyQuestion();
                }
                if (myScores['我要选读文章'] != 12) {
                    articleStudy();
                }
                //if (myScores["双人对战"] < 1) {competition.SR();}
                break;
            case 2:
                if (myScores['我要选读文章'] != 12) {
                    articleStudy();
                }
                if (myScores['每日答题'] != 5) {
                    dailyQuestion();
                }
                if (myScores['每周答题'] < 4) {
                    weeklyQuestion();
                }
                //if (myScores['视听学习'] != 6){if(storage.get("videoChoose") == 1){videoStudy_bailing();}else{videoStudy_news();}}
                //if (myScores["双人对战"] < 1) {competition.SR();}
                if (myScores['本地频道'] != 1) {
                    localChannel1();
                }
                //if (myScores["四人赛"] < 3) {competition.zsy();}
                if (myScores['挑战答题'] != 6) {
                    challengeQuestion();
                }
                if (myScores['专项答题'] < 4) {
                    specialQuestion();
                }
                break;
            case 3:
                //if (myScores["双人对战"] < 1) {competition.SR();}
                if (myScores['每周答题'] < 4) {
                    weeklyQuestion();
                }
                //if (myScores['视听学习'] != 6){if(storage.get("videoChoose") == 1){videoStudy_bailing();}else{videoStudy_news();}}
                if (myScores['专项答题'] < 4) {
                    specialQuestion();
                }
                //if (myScores["四人赛"] < 3) {competition.zsy();}
                if (myScores['本地频道'] != 1) {
                    localChannel1();
                }
                if (myScores['我要选读文章'] != 12) {
                    articleStudy();
                }
                if (myScores['挑战答题'] != 6) {
                    challengeQuestion();
                }
                if (myScores['每日答题'] != 5) {
                    dailyQuestion();
                }
                break;
            default:
                //if (myScores['视听学习'] != 6){if(storage.get("videoChoose") == 1){videoStudy_bailing();}else{videoStudy_news();}}
                if (myScores['每日答题'] != 5) {
                    dailyQuestion();
                }
                if (myScores['专项答题'] < 4) {
                    specialQuestion();
                }
                if (myScores['挑战答题'] != 6) {
                    challengeQuestion();
                }
                if (myScores['我要选读文章'] != 12) {
                    articleStudy();
                }
                //if (myScores["双人对战"] < 1) {competition.SR();}
                if (myScores['每周答题'] < 4) {
                    weeklyQuestion();
                }
                if (myScores['本地频道'] != 1) {
                    localChannel1();
                }
                //if (myScores["四人赛"] < 3) {competition.zsy();}
        }
        getScores(); //再次获取积分，核对文章和视听时长，补学
        continue; //break结束当前循环，continue继续执行当前循环
    }
    stopRadio();
    if (myScores['分享'] != 1 || myScores['发表观点'] != 1) {
        aCount = 2; //置文章数2，学习文章2，启动分享收藏评论2
        CollectAndShareAndComment();
    }
    if (myScores['视听学习'] != 6) {
        if (storage.get("videoChoose") == 1) {
            videoStudy_bailing();
        } else {
            videoStudy_news();
        }
    }
    var end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    log(flagShut);
    if (flagShut != 1) {
        threads.shutDownAll();
        console.hide();
        engines.stopAll();
        exit();
    } else {
        return 0;
    }
}

/**         if (id("home_bottom_tab_button_work").exists()) {
            id("home_bottom_tab_button_work").findOne().click();}
            while (!id("home_bottom_tab_button_work").exists()) {//20201001 学习按钮文字属性由"学习"改为 "工作"，以下所有点击学习按钮加载主页均同步修改
            id("home_bottom_tab_button_work").findOne().click();
            **/
/** 
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
    if (!PrefCheckBox.getPref().get("perf2")) {
        console.setPosition(0, device.height / 2); //部分华为手机console有bug请注释本行
        console.show(); //部分华为手机console有bug请注释本行
    }

    console.log("启动学习强国");
    if (!launchApp("学习强国")) { //启动学习强国app
        console.error("找不到学习强国App!");
        return;
    }
    delay(3); //如果已清理强国app后台，默认打开主页;如果未清理后台，3秒应该可以拉起强国app  
    if (className("android.view.View").text("继续挑战").exists()) { //双人对战 争上游结束页
        back();
        delay(1);
    }
    if (className("android.view.View").text("开始对战").exists()) { //双人对战开始页
        back();
        delay(1);
    }
    if (className("android.widget.Button").text("退出").exists()) { //双人对战退出房间
        className("android.widget.Button").text("退出").findOne().click();
        back();
        delay(1);
    }
    if (className("android.view.View").text("开始比赛").exists()) { //争上游答题开始页
        back();
        delay(1);
    }
    if (className("android.view.View").text("答题练习").exists()) { //我要答题页
        back();
        delay(1);
    }
    if (id("menu_contact").exists()) { //强国通讯录
        id("home_bottom_tab_button_work").findOne().click();
        delay(1);
    }
    if (id("more_text").exists()) { //学习积分页
        back();
        delay(1);
    }
    if (id("my_display_name").exists()) { //我的主页
        back();
        delay(1);
    }
    /*while (!id("home_bottom_tab_button_work").exists()){
       back();delay(2);
       continue;
       } */ //适合内部返回主页，不适合已清理强国后台情况下初始拉起强国app
    while (!id("home_bottom_tab_button_work").exists()) { //20201001 学习按钮文字属性由"学习"改为 "工作"，以下所有点击学习按钮加载主页均同步修改
        id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
        console.log("等待加载出主页");
        delay(1);
        continue; /*break;exists(); back();*/
    }
    delay(1);
}

/**
 * @description: 定义延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds); //sleep函数参数单位为毫秒所以乘1000
}

/**
 * @description: 获取积分
 * @param: null
 * @return: null
 */
function getScores() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    console.log("正在获取积分...");
    while (!text("积分明细").exists()) { //自主页点击右上角积分数字进入学习积分
        if (id("comm_head_xuexi_score").exists()) {
            id("comm_head_xuexi_score").findOnce().click();
        } else if (text("积分").exists()) {
            text("积分").findOnce().parent().child(1).click();
        } else if (id("comm_head_xuexi_mine").exists()) { //自强国通页面进入我的主页点击学习积分
            id("comm_head_xuexi_mine").findOnce().click();
            if (id("my_display_name").exists()) { //我的主页
                id("my_recycler_view").findOnce().child(0).click();
            }
        }
        delay(3);
    }
    let err = false;
    while (!err) {
        try {
            className("android.widget.ListView").findOnce().children().forEach(item => {
                let name = item.child(0).child(0).text();
                let str = item.child(2).text().split("/");
                let score = str[0].match(/[0-9][0-9]*/g);
                myScores[name] = score;
            });
            err = true;
        } catch (e) {
            console.log(e);
        }
    }
    console.log(myScores);
    aCount = 12 - myScores["我要选读文章"];
    vCount = 6 - myScores["视听学习"];
    rTime = (6 - myScores["视听学习时长"]) * 60;
    console.log('剩余文章：' + aCount.toString() + '篇')
    console.log('剩余视频：' + vCount.toString() + '个')
    console.log('视听学习时长：' + rTime.toString() + '秒')
    delay(1);
    back();
    delay(1);
}

/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---12分
 * @param: null
 * @return: null
 */
//文章学习函数之1 点击基于日期s=date_String或 "学习强国"平台
function articleStudy1() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    var aCatlog = aCat[num]; //文章学习类别，随机取"推荐""要闻"、"新思想"
    var date_string = getTodayDateString(); //获取当天日期字符串
    var s = date_string;
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    click(aCatlog);
    delay(2);
    var zt_flag = false; //判断进入专题界面标志
    var fail = 0; //点击失败次数
    console.log('文章类别：' + aCatlog + '关键词：' + s)
    for (var i = 0, t = 0; i < aCount;) {
        if (click(s, t) == true) //如果点击成功则进入文章页面,不成功意味着本页已经到底,要翻页
        {
            let n = 0;
            while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
            {
                delay(1);
                console.warn("正在等待加载文章界面...");
                if (n > 3) //等待超过3秒则认为进入了专题界面，退出进下一篇文章
                {
                    console.warn("没找到评论框!该界面非文章界面!");
                    zt_flag = true;
                    break;
                }
                n++;
            }
            if (textContains("央视网").exists() || textContains("广播").exists() || textContains("中央广播电视总台").exists() || textContains("播放").exists() || textContains("展开").exists()) //如果存在“央视网、中央广播电视总台、播放、展开”则认为进入了视频需退出。关键词测试
            {
                console.warn("进入视频界面，退出并进下一篇文章!");
                t++;
                back();
                /* while (!id("home_bottom_tab_button_work").exists());
                delay(0.5);
                click("电台");
                delay(1);
                click("最近收听");
                console.log("因广播被打断，重新收听广播...");
                delay(1);
                back();*/
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                delay(1);
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：' + s)
                click(aCatlog);
                delay(1);
                continue;
            }

            if (id("v_play").exists() || id("bg_play").exists()) //进入电台页面2020.09.28
            {
                console.warn("进入电台界面，退出并进下一篇文章!");
                t++;
                if (id("btn_back").exists()) {
                    id("btn_back").findOnce().click(); //返回 2020.09.28需关闭电台收听
                } else {
                    back;
                } //返回 2020.09.28需关闭电台收听
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                delay(1);
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：' + s)
                click(aCatlog);
                delay(1);
                continue;
            }

            if (zt_flag == true) //进入专题页标志
            {
                console.warn("进入了专题界面，退出并进下一篇文章!")
                t++;
                back();
                delay(1);
                zt_flag = false;
                continue;
            }
            console.log("正在学习第" + (i + 1) + "篇文章...");
            fail = 0; //失败次数清0
            article_timing(i, aTime);
            if (i < cCount) //收藏分享2篇文章
            {
                CollectAndShare(i); //收藏+分享 若运行到此报错请注释本行！
                Comment(i); //评论
            }
            back(); //返回主界面
            while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
            delay(1);
            i++;
            t++; //t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
        } else {
            if (id("v_play").exists() || id("bg_play").exists()) //进入电台页面2020.09.28
            {
                console.warn("进入电台界面，退出并进下一篇文章!");
                t++;
                if (id("btn_back").exists()) {
                    id("btn_back").findOnce().click(); //返回 2020.09.28需关闭电台收听
                } else {
                    back;
                }
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                delay(1);
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：' + s)
                click(aCatlog);
                delay(1);
                continue;
            }

            if (i == 0) //如果第一次点击就没点击成功则认为首页无当天文章
            {
                date_string = getYestardayDateString();
                s = date_string;
                /*s = "“学习强国”学习平台";*/
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                click(aCatlog);
                console.warn("首页没有找到当天文章，即将学习昨日新闻!" + aCatlog + s);
                continue;
            }

            if (fail > 3) //连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
            {
                date_string = getYestardayDateString();
                /*s = date_string;*/
                s = "“学习强国”学习平台";
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                click(aCatlog);
                console.warn("没有找到当天文章，即将学习昨日新闻!" + aCatlog + s);
                fail = 0; //失败次数清0
                continue;
            }

            if (!textContains(s).exists()) //当前页面当天新闻
            {
                fail++; //失败次数加一
            }
            listView.scrollForward(); //向下滑动(翻页)
            t = 0;
            delay(1.5);
        }
    }
}
//文章学习函数之2 基于播报判断.因基于父子控件判断，点击基于日期s=date_String 感谢chongyadong
function articleStudy2() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    var aCatlog = aCat[num]; //文章学习类别，随机取"推荐""要闻"、"新思想"
    var date_string = getTodayDateString(); //获取当天日期字符串
    var s = date_string;
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    click(aCatlog);
    delay(2);
    var zt_flag = false; //判断进入专题界面标志
    var currentNewsTitle = "";
    var fail = 0; //点击失败次数
    console.log('文章类别：' + aCatlog + '关键词：' + s)
    for (var i = 0, t = 0; i < aCount;) {
        var art_obj = text(s).findOnce(t);
        //console.info(art_obj);
        if ((art_obj != null) && (art_obj.parent().childCount() == 4)) {
            t++; //t为实际查找的文章控件在当前布局中的标号,和i不同,勿改动!
            if ((art_obj.parent().child(3).text() == "播报") && (art_obj.parent().child(0).text() != currentNewsTitle)) //如果播报存在就进入文章正文
            {
                currentNewsTitle = art_obj.parent().child(0).text();
                log(currentNewsTitle);
                art_obj.parent().click();
                delay(1);
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
                {
                    delay(1);
                    console.warn("正在等待加载文章界面...");
                    if (n > 3) //等待超过3秒则认为进入了专题界面，退出进下一篇文章
                    {
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (textContains("央视网").exists() || textContains("广播").exists() || textContains("中央广播电视总台").exists() || textContains("播放").exists() || textContains("展开").exists()) //如果存在“央视网、中央广播电视总台、播放、展开”则认为进入了视频需退出。关键词测试
                {
                    console.warn("进入视频界面，退出并进下一篇文章!");
                    t++;
                    back();
                    /*while (!id("home_bottom_tab_button_work").exists());
                    delay(0.5);
                    click("电台");
                    delay(1);
                    click("最近收听");
                    console.log("因广播被打断，重新收听广播...");
                    delay(1);
                    back();*/
                    while (!id("home_bottom_tab_button_work").exists());
                    id("home_bottom_tab_button_work").findOne().click();
                    delay(1);
                    num = random(0, commentText.length - 1); //重取随机数
                    aCatlog = aCat[num];
                    s = date_string;
                    /*s = "“学习强国”学习平台";*/
                    console.log('文章类别：' + aCatlog + '关键词：' + s)
                    click(aCatlog);
                    delay(1);
                    continue;
                }

                if (id("v_play").exists() || id("bg_play").exists()) //进入电台页面2020.09.28
                {
                    console.warn("进入电台界面，退出并进下一篇文章!");
                    t++;
                    if (id("btn_back").exists()) {
                        id("btn_back").findOnce().click(); //返回 2020.09.28需关闭电台收听
                    } else {
                        back;
                    } //返回 2020.09.28需关闭电台收听
                    while (!id("home_bottom_tab_button_work").exists());
                    id("home_bottom_tab_button_work").findOne().click();
                    delay(1);
                    num = random(0, commentText.length - 1); //重取随机数
                    aCatlog = aCat[num];
                    s = date_string;
                    /*s = "“学习强国”学习平台";*/
                    console.log('文章类别：' + aCatlog + '关键词：' + s)
                    click(aCatlog);
                    delay(1);
                    continue;
                }

                if (zt_flag == true) //进入专题页标志
                {
                    console.warn("进入了专题界面，退出并进下一篇文章!")
                    t++;
                    back();
                    delay(1);
                    zt_flag = false;
                    continue;
                }
                console.log("正在学习第" + (i + 1) + "篇文章...");
                fail = 0; //失败次数清0
                article_timing(i, aTime);
                if (i < cCount) //收藏分享2篇文章
                {
                    CollectAndShare(i); //收藏+分享 若c运行到此报错请注释本行！
                    Comment(i); //评论
                }
                back(); //返回主界面
                while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
                delay(1);
                i++;
            } else { //判断非目标文章
                if (t > 2) {
                    listView.scrollForward(); //向下滑动(翻页
                    console.log("----------翻页------------");
                    t = 0;
                    delay(1.5);
                }
            }
        } else {
            if (fail > 3) //连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
            {
                date_string = getYestardayDateString();
                s = date_string;
                /*s = "“学习强国”学习平台";*/
                num = random(0, commentText.length - 1); //重取随机数
                aCatlog = aCat[num];
                click(aCatlog);
                console.warn("没有找到当天文章，即将学习昨日新闻!" + aCatlog + s);
                fail = 0; //失败次数清0
                continue;
            }
            if (!textContains(date_string).exists()) //当前页面当天新闻
            {
                fail++; //失败次数加一
            }
            listView.scrollForward(); //向下滑动(翻页
            console.log("----------翻页------------");
            t = 0;
            delay(1.5);
        }
    }
}

/**
 * @description:新闻联播小视频学习函数
 * @param: null
 * @return: null
 */
function videoStudy_news() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    click("电视台");
    var vCatlog = vCat[num]; //视频学习类别，随机取 "第一频道"、"学习视频"、"联播频道"
    if (num == 0) {
        var s = "中央广播电视总台";
    } else if (num == 1) {
        var s = "央视新闻";
    } else {
        var s = "中央广播电视总台";
    }
    delay(1);
    click(vCatlog);
    delay(2);
    var listView = className("ListView"); //获取listView视频列表控件用于翻页
    var fail = 0; //点击失败次数
    delay(1);
    console.log('视频类别：' + vCatlog + '关键词：' + s)
    for (var i = 0, t = 1; i < vCount;) {
        if (click(s, t) == true) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            fail = 0; //失败次数清0
            video_timing_news(i, vTime); //学习每个新闻联播小片段
            back(); //返回联播频道界面
            while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
            delay(1);
            i++;
            t++;
            if (i == 3) { //如果是平板等设备，请尝试修改i为合适值！
                listView.scrollForward(); //翻页
                delay(2);
                t = 2;
            }
        } else {
            if (fail > 3) //连续翻几页没有点击成功则改换频道
            {
                num = random(0, commentText.length - 1); //重取随机数
                vCatlog = vCat[num];
                click(vCatlog);
                delay(2);
                if (num == 0) {
                    var s = "央视网";
                } else if (num == 1) {
                    var s = "新华社";
                } else {
                    var s = "中央广播电视总台";
                }
                delay(1);
                console.warn("改换：" + vCatlog + '关键词：' + s);
                fail = 0; //失败次数清0
                continue;
            }
            if (!textContains(s).exists()) //未找到关键词
            {
                fail++; //失败次数加一
            }
            listView.scrollForward(); //翻页
            delay(2);
            t = 3;
        }
    }
}

/**
 * @description: “百灵”小视频学习函数
 * @param: vCount,vTime
 * @return: null
 */
function videoStudy_bailing(vCount, vTime) {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2; //横坐标2分之3处
    h1 = (h / 6) * 5; //纵坐标6分之5处
    h2 = (h / 6); //纵坐标6分之1处
    vCount = random(18, 21);
    vTime = 20;
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    console.log("开始学习百灵视频");
    delay(2);
    click("百灵");
    delay(2);
    click("竖");
    delay(2);
    var a = className("FrameLayout").depth(23).findOnce(0); //根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
    //  a.click();
    click((w / 2) + random() * 10, h / 4); //坐标点击第一个视频
    delay(1);
    console.info("本次观看" + vCount + "个小视频（该数据随机）");
    for (var i = 0; i < vCount; i++) {
        console.log("正在观看第" + (i + 1) + "个小视频");
        video_timing_bailing(i, vTime); //观看每个小视频
        if (i != vCount - 1) {
            swipe(x, h1, x, h2, 500); //往下翻（纵坐标从5/6处滑到1/6处）
        }
    }
    console.info("百灵视频学习完毕，返回");
    back();
    delay(2);
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮

}

/**
 * @description: 百灵视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_bailing(n, seconds) {
    seconds = seconds + random(0, 5);
    for (var i = 0; i < seconds; i++) {
        if (desc("继续播放")) {
            click("继续播放");
        }
        while (!textContains("分享").exists()) //如果离开了百灵小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个小视频界面，请重新返回视频");
            delay(2);
            while (!id("home_bottom_tab_button_work").exists());
            id("home_bottom_tab_button_work").findOne().click();
            delay(1);
            click("百灵");
            delay(2);
            click("竖");
            delay(2);
            a = className("FrameLayout").depth(23).findOnce(0); //根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
            a.click();
            delay(2);
            break;
        }
        delay(1);
        if (i % 10 == 0) //每10秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
            toast("防息屏弹窗,请无视");
        }
    }
}

/**
 * @description: 听“电台”新闻广播函数  补视听时长
 * @param: null
 * @return: null
 */
function listenToRadio() {
    var r_start = new Date().getTime(); //广播开始时间 
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    click("电台");
    delay(1);
    click("听广播"); //202012听新闻广播 改为 听广播
    delay(2);
    if (textContains("最近收听").exists()) {
        click("最近收听");
        console.log("正在收听广播...");
        delay(1);
        back(); //返回
        delay(1);
    }
    if (textContains("推荐收听").exists()) {
        click("推荐收听");
        console.log("正在收听广播...");
        delay(1);
        back(); //返回
        delay(1);
    }
    id("home_bottom_tab_button_work").findOne().click();
    delay(1);
    var r_end = new Date().getTime(); //广播结束时间
    var radio_time = (parseInt((r_end - r_start) / 1000)); //广播已经收听的时间
    var left_time = rTime - radio_time;
    //log("执行radio_timing");
    //radio_timing(parseInt((r_end - r_start) / 1000), left_time);//广播剩余需收听时间
    //stopRadio();
}

/**
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    console.log("停止收听广播！");
    click("电台");
    delay(1);
    click("听广播"); //202012听新闻广播 改 听广播
    delay(2);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(2);
    }
    if (textContains("正在收听").exists()) {
        click("正在收听");
        console.log("正在停止广播...");
        delay(2);
        id("v_play").findOnce(0).click(); //点击暂停播放按钮
        delay(2);
        if (id("btn_back").findOne().click() == 0) { //后退
            delay(2);
            back();
        }
    }
    console.log("广播已停止播放...");
    delay(1);
}


/**
 * @description: 收藏加分享函数  (收藏+分享)---1+1=2分
 * @param: i-文章标号
 * @return: null
 */
function CollectAndShare(i) {
    while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    console.log("正在进行第" + (i + 1) + "次收藏和分享...");

    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
    var collectOrder = textOrder + 2;
    var shareOrder = textOrder + 3;
    var collectIcon = className("ImageView").filter(function(iv) {
        return iv.drawingOrder() == collectOrder;
    }).findOnce();

    var shareIcon = className("ImageView").filter(function(iv) {
        return iv.drawingOrder() == shareOrder;
    }).findOnce();

    //var collectIcon = classNameContains("ImageView").depth(10).findOnce(0);//右下角收藏按钮
    collectIcon.click(); //点击收藏
    console.info("收藏成功!");
    delay(1);

    //var shareIcon = classNameContains("ImageView").depth(10).findOnce(1);//右下角分享按钮
    shareIcon.click(); //点击分享
    while (!textContains("分享到学习强国").exists()); //等待弹出分享选项界面
    delay(1);
    click("分享到学习强国");
    delay(2);
    console.info("分享成功!");
    back(); //返回文章界面
    delay(1);
    collectIcon.click(); //再次点击，取消收藏
    console.info("取消收藏!");
    delay(1);
}

/**
 * @description: 评论函数---2分
 * @param: i-文章标号
 * @return: null
 */
function Comment(i) {
    while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    click("欢迎发表你的观点"); //单击评论框
    console.log("正在进行第" + (i + 1) + "次评论...");
    delay(1);
    var num = random(0, commentText.length - 1) //随机数
    setText(commentText[num]); //输入评论内容
    delay(1);
    click("发布"); //点击右上角发布按钮
    console.info("评论成功!");
    delay(2);
    click("删除"); //删除该评论
    delay(2);
    click("确认"); //确认删除
    console.info("评论删除成功!");
    delay(1);
}


/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
//基于控件点击 20200911 部分手机 本地在频道列表为控件3 但部分为控件14，可点击后基于切换地区判断。
//20201020如果在综合页面进入本地，则识别不到新思想，因此改基于综合判断。20201022 山东省界面更新频道内控件3会跳转外部链接故改0
//20210116 控件14改动为15，控件3有无变动未知
function localChannel1() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    console.log("点击本地频道");
    delay(1);
    if (className("android.widget.TextView").text("综合").exists()) {
        className("android.widget.TextView").text("综合").findOne().parent().parent().child(3).click();
        delay(2);
        if (className("android.widget.TextView").text("切换地区").exists()) {
            className("android.support.v7.widget.RecyclerView").findOne().child(0).click();
            delay(2);
            console.log("返回主界面");
            back();
            className("android.widget.TextView").text("综合").findOne().parent().parent().child(0).click();
        } else {
            className("android.widget.TextView").text("综合").findOne().parent().parent().child(15).click(); //14 15
            delay(2);
            className("android.support.v7.widget.RecyclerView").findOne().child(0).click();
            delay(2);
            console.log("返回主界面");
            back();
            className("android.widget.TextView").text("综合").findOne().parent().parent().child(11).click();
        }
        id("home_bottom_tab_button_work").findOne().click();
        delay(1);
    } else {
        console.log("请手动点击本地频道！");
    }
}

/**
@description: 学习平台订阅
@param: null
@return: null
*/
function sub() {
    desc("工作").click();
    delay(2);
    click("订阅");
    delay(2);
    click("添加");
    delay(2);
    click("学习平台", 0); // text("学习平台").findOne().click() == click("学习平台", 0) 解决订阅问题
    delay(0.5);
    click("强国号", 0);
    delay(1.5);
    let sublist = className("android.view.View").findOnce(0);
    log(sublist);
    var i = 0;
    while (i < asub) {
        let object = desc("订阅").find();
        if (!object.empty()) {
            object.forEach(function(currentValue) {
                if (currentValue && i < asub) {
                    let like = currentValue.parent()
                    if (like.click()) {
                        console.log("订阅成功");
                        i++;
                        delay(2);
                    } else {
                        console.error("订阅失败");
                    }
                }
            })
        } else if (text("你已经看到我的底线了").exists()) {
            console.log("尝试订阅学习平台")
            back();
            delay(1);
            click("添加");
            delay(1);
            click("学习平台", 0);
            delay(2);
            let sublist = className("ListView").findOnce(1);
            while (i < asub) {
                let object = desc("订阅").find();
                if (!object.empty()) {
                    object.forEach(function(currentValue) {
                        if (currentValue && i < asub) {
                            let like = currentValue.parent()
                            if (like.click()) {
                                console.log("订阅成功");
                                i++;
                                delay(2);
                            } else {
                                console.error("订阅失败");
                            }
                        }
                    })
                } else if (text("你已经看到我的底线了").exists()) {
                    console.log("没有可订阅的强国号了,退出!!!")
                    back();
                    delay(2);
                    return;
                } else {
                    delay(1);
                    sublist.scrollForward();
                }
            }
        } else {
            delay(1);
            sublist.scrollDown();
        }
    }
    back();
    delay(2);
}

/**
 * @description: 日期转字符串函数
 * @param: y,m,d 日期数字 2020 xx xx
 * @return: s 日期字符串 "2019-xx-xx"
 */
function dateToString(y, m, d) {
    var year = y.toString();
    if ((m + 1) < 10) {
        var month = "0" + (m + 1).toString();
    } else {
        var month = (m + 1).toString();
    }
    if (d < 10) {
        var day = "0" + d.toString();
    } else {
        var day = d.toString();
    }
    var s = year + "-" + month + "-" + day; //年-月-日
    return s;
}

/**
 * @description: 获取当天日期
 * @param: null
 * @return: s 日期字符串 "2020 xx xx"
 */
function getTodayDateString() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d); //年，月，日
    return s
}

/**
 * @description: 获取昨天日期
 * @param: null
 * @return: s 日期字符串 "2020 xx xx"
 */
function getYestardayDateString() {
    var date = new Date();
    num++; //num是程序开始获取的随机数，前1-3天，+1防止num=0的情况
    date.setDate(date.getDate() - num);
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d); //年，月，日
    return s
}


/*************************************************挑战 争上游 双人答题部分******************************************************/

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
        delay(1);
        click("我要答题");
    } else {
        (!text("我要答题").exists());
        delay(1);
        text("我要答题").findOne().parent().click();
    }
    if (!textContains("答题练习").exists()) {
        while (!text("答题练习").exists()); //排行榜 答题竞赛
        delay(1);
        className("android.view.View").text("答题练习").findOne().parent().child(10).click();
    } else {
        while (!text("挑战答题").exists());
        delay(1);
        text("挑战答题").click(); //原流程，20200910改版，ver2.14不会自动更新，因可以判断故保留。
    }
    console.log("开始挑战答题")
    delay(4);
    let conNum = 0; //连续答对的次数
    let lNum = 1; //轮数
    while (true) {
        challengeQuestionLoop(conNum);
        delay(4);
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        { //该部分修改，逻辑为a：>=5题，失败则结束挑战答题返回主界面;b0：<5题，第一次失败，分享复活；b1：分享复活再次失败，仍<5题，需再来一局；b2：分享复活再次失败，已>5题，结束挑战答题返回主界面
            delay(2);
            if (lNum >= lCount && conNum >= qCount) {
                console.log("挑战答题结束！返回主页！");
                if (textContains("结束本局").exists()) {
                    /*在分享页面回退4次返回主页*/
                    back();
                    delay(1);
                    back();
                    delay(1);
                    back();
                    delay(1);
                    back();
                    delay(1);
                } else {
                    /*在本局结束页面回退3次返回主页*/
                    back();
                    delay(1);
                    back();
                    delay(1);
                    back();
                    delay(1);
                }
                break;
            } else if (textContains("分享就能复活").exists() || textContains("每周仅可复活一次").exists()) {
                console.log("分享复活...")
                delay(1);
                click("分享就能复活");
                delay(2);
                console.info("分享成功!");
                back(); //返回答题界面
                delay(4);
            } else {
                console.log("等3秒开始下一轮...")
                delay(3); //等待3秒开始下一轮
                text("再来一局").click();
                /* back();
                //desc("结束本局").click();//有可能找不到结束本局字样所在页面控件，所以直接返回到上一层
                delay(1);
                //desc("再来一局").click();
                back();
             if(!textContains("答题练习").exists()){
               while (!text("答题练习").exists());//排行榜 答题竞赛
               delay(1);
               className("android.view.View").text("答题练习").findOne().parent().child(10).click();
             }else{
               while (!text("挑战答题").exists());
               delay(1);
               text("挑战答题").click();//原流程，20200910改版
              }*/
                delay(4);
                if (conNum >= qCount) {
                    lNum++;
                }
                conNum = 0;
            }
            console.warn("第" + (lNum + 1).toString() + "轮开始...")
        } else //答对了
        {
            conNum++;
        }
    }
}

/**
 * @description: 挑战答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    let ClickAnswer; //定义已点击答案
    if (conNum >= qCount) //答题次数足够退出，每轮qCount=5+随机1-3次
    {
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("本轮答题数足够，随机点击答案");
        var question = className("ListView").findOnce().parent().child(0).text();
        question = question.replace(/\s/g, "");
        var options = []; //选项列表
        if (className("ListView").exists()) {
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(1).text();
                options.push(answer_q);
            });
        } else {
            console.error("答案获取失败!");
            return;
        } //20201217添加 极低概率下，答题数足够，下一题随机点击，碰到字形题
        if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
            question = question + options[0]; //字形题 读音题 在题目后面添加第一选项               
        }
        console.log((conNum + 1).toString() + ".随机点击题目：" + question);
        var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
        console.log("本次答题随机延时:" + otherDalayTime + "秒");
        delay(otherDalayTime); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        //如果随机点击答案正确，则更新到本地题库tiku表
        delay(0.5); //等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.log("更新本地题库答案...");
            checkAndUpdate(question, answer, ClickAnswer);
        }
        console.log("---------------------------");
        return;
    }
    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
    } else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
        console.log("本次答题随机延时:" + otherDalayTime + "秒");
        delay(otherDalayTime); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        return;
    }
    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }
    question = question.replace(/\s/g, "");
    var options = []; //选项列表
    if (className("ListView").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    } else {
        console.error("答案获取失败!");
        return;
    }
    if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
        question = question + options[0]; //字形题 读音题 在题目后面添加第一选项               
    }
    console.log((conNum + 1).toString() + "搜库题目：" + question);
    var answer = getAnswer(question, 'tiku');
    console.info("答案：" + answer);
    if (/^[a-zA-Z]{1}$/.test(answer)) { //如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        toastLog("answer from char=" + answer);
    }
    let hasClicked = false;
    let listArray = className("ListView").findOnce().children(); //题目选项列表
    if (answer == "") //如果没找到答案
    {
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击");
        var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
        console.log("本次答题随机延时:" + otherDalayTime + "秒");
        delay(otherDalayTime); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        hasClicked = true;
        console.log("随机点击:" + ClickAnswer); //如果随机点击答案正确，则更新到本地题库tiku表
        delay(0.5); //等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.log("更新本地题库答案...");
            checkAndUpdate(question, answer, ClickAnswer);
        }
        console.log("---------------------------");
    } else //如果找到了答案
    {
        listArray.forEach(item => {
            var listDescStr = item.child(0).child(1).text();
            if (listDescStr == answer) {
                var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
                console.log("本次答题随机延时:" + otherDalayTime + "秒");
                delay(otherDalayTime); //随机延时0.5-1秒
                item.child(0).click(); //点击答案
                hasClicked = true;
                delay(0.5); //等待0.5秒，是否出现X
                if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                        "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    console.log("题库答案正确……");
                }
                if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                        "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    console.error("题库答案错误!!!");
                    checkAndUpdate(question, answer, ClickAnswer);
                }
                console.log("---------------------------");
            }
        });
    }
    if (!hasClicked) //如果没有点击成功
    { //因导致不能成功点击问题较多，故该部分不更新题库，大部分问题是题库题目适配为填空题或多选题或错误选项
        console.error("未能成功点击，随机点击");
        let i = random(0, listArray.length - 1);
        var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
        console.log("本次答题随机延时:" + otherDalayTime + "秒");
        delay(otherDalayTime); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        console.log("随机点击:" + ClickAnswer);
        delay(0.5); //等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.log("随机点击正确……");
        }
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.error("随机点击错误!!!");
            checkAndUpdate(question, answer, ClickAnswer);
        }
        console.log("---------------------------");
    }
}

/**
 * @description: 判断题库是否存在
 * @param: null
 * @return: null
 */
function judge_tiku_existence() {
    var dbName = "tiku.db"; //题库文件名
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库！请将题库文件放置与js文件同一目录下再运行！");
        return false;
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOT EXISTS tiku(\
    question CHAR(253),\
    answer CHAR(100)\
    );";
    db.execSQL(createTable);
    return true;
}

/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {
    var dbName = "tiku.db"; //题库文件名
    var path = files.path(dbName);

    var db = SQLiteDatabase.openOrCreateDatabase(path, null);

    sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '" + question + "%'"
    var cursor = db.rawQuery(sql, null);
    if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        return answer;
    } else {
        console.error("题库中未找到答案");
        cursor.close();
        return '';
    }
}

/**
 * @description: 增加或更新数据库
 * @param: sql
 * @return: null
 */
function insertOrUpdate(sql) {
    var dbName = "tiku.db";
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    db.execSQL(sql);
    db.close();
}

/*************************************************每日答题/每周答题部分***************************************************/

/**
 * @description: 每日答题
 * @param: null
 * @return: null
 */
function dailyQuestion() {
    while (!id("home_bottom_tab_button_work").exists()); //等待加载出主页
    id("home_bottom_tab_button_work").findOne().click(); //点击主页正下方的"学习"按钮
    delay(2);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
        delay(1);
        click("我要答题");
    } else {
        (!text("我要答题").exists());
        delay(1);
        text("我要答题").findOne().parent().click();
    }
    while (!text("每日答题").exists());
    delay(1);
    text("每日答题").click();
    console.log("开始每日答题")
    delay(2);
    let dlNum = 0; //每日答题轮数
    while (true) {
        dailyQuestionLoop();
        /*dailyQuiz();*/
        if (text("再来一组").exists()) {
            delay(2);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                delay(1);
            } else {
                console.log("每日答题结束！返回主页！")
                text("返回").click();
                delay(0.5);
                back();
                delay(1);
                back();
                delay(1);
                break;
            }
        }
    }
}

/**
 * @description: 每周答题
 * @param: null
 * @return: null
 */
function weeklyQuestion() {
    var swipeNum = 0;
    let h = device.height; //屏幕高
    let w = device.width; //屏幕宽
    let x = (w / 3) * 2; //横坐标2分之3处
    let h1 = (h / 6) * 5; //纵坐标6分之5处
    let h2 = (h / 6); //纵坐标6分之1处
    text("我的").click();
    if (!textContains("我要答题").exists()) {
        delay(1);
        click("我要答题");
    } else {
        (!text("我要答题").exists());
        delay(1);
        text("我要答题").findOne().parent().click();
    }
    /*while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");*/
    while (!text("每周答题").exists());
    delay(1);
    text("每周答题").click();
    console.log("开始每周答题")
    //delay(2);
    //text("未作答").click();

    //翻页点击每周作答
    //let sublist = className("ListView").findOnce(0);//控件错误，用swipe划，7.0以下可能错误
    let i = 0; //参考订阅的翻页，只进行一次点击
    while (i < 1) {
        if (text("未作答").exists()) {
            text("未作答").click();
            i++;
        } else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的每周答题了,退出!!!")
            back();
            delay(1);
            back();
            delay(1);
            back();
            delay(1);
            return;
        } else {
            if (swipeNum < swipeTimes || customize_flag == true) {
                console.log("开始第" + (swipeNum + 1) + "次下滑");
                delay(1);
                swipe(x, h1, x, h2, 500); //往下翻（纵坐标从5/6处滑到1/6处）
                swipeNum++;
                delay(0.5);
            } else {
                log("滑动次数达到设定次数，结束滑动");
                back();
                delay(1);
                back();
                delay(1);
                back();
                delay(1);
                return;
            }
        }
    }
    ////翻页点击每周作答

    let dlNum = 0; //每日答题轮数
    while (true) {
        delay(1)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("每周答题结束，返回！")
            text("返回").click();
            delay(2);
            back();
            delay(1);
            back();
            delay(1);
            while (!textContains("我要答题").exists()) {
                back();
                delay(1);
            }
            break;
        } else if (text("查看解析").exists()) {
            console.log("每周答题结束！")
            back();
            delay(0.5);
            back();
            delay(0.5);
            break;
        } else if (text("再来一组").exists()) {
            delay(2);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                delay(1);
            } else {
                console.log("每周答题结束，返回！")
                text("返回").click();
                delay(2);
                while (!textContains("我要答题").exists()) {
                    console.log("专项答题结束，返回！")
                    back();
                    delay(1);
                }
                back();
                delay(1);
                break;
            }
        }
    }
    //回退返回主页 
    while (!id("home_bottom_tab_button_work").exists()) {
        back();
        delay(0.5);
    }
}

/**
 * @description: 专项答题
 * @param: null
 * @return: null
 */
function specialQuestion() {
    var swipeNum = 0;
    let h = device.height; //屏幕高
    let w = device.width; //屏幕宽
    let x = (w / 3) * 2; //横坐标2分之3处
    let h1 = (h / 6) * 5; //纵坐标6分之5处
    let h2 = (h / 6); //纵坐标6分之1处
    text("我的").click();
    if (!textContains("我要答题").exists()) {
        delay(1);
        click("我要答题");
    } else {
        (!text("我要答题").exists());
        delay(1);
        text("我要答题").findOne().parent().click();
    }
    /*while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");*/
    while (!text("专项答题").exists());
    delay(1);
    text("专项答题").click();
    console.log("开始专项答题")
    delay(2);
    /*
       if(text("继续答题").exists())
       {
             text("继续答题").click();
       }else{
             text("开始答题").click();
       }
    */

    //翻页点击专项答题
    let i = 0;
    while (i < 1) {
        if (text("继续答题").exists()) {
            text("继续答题").click();
            i++;
            //console.log("1471")
        } else if (text("开始答题").exists()) {
            text("开始答题").click();
            i++;
            //console.log("1474")
        } else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的专项答题了,退出!!!")
            back();
            delay(1);
            back();
            delay(1);
            back();
            delay(1);
            return;
        } else if (text("已过期").exists()) {
            console.log("存在已过期的专项答题,无法作答，退出!!!")
            back();
            delay(2);
            back();
            delay(1);
            back();
            delay(1);
            return;
        } else {
            if (swipeNum < swipeTimes || customize_flag == true) {
                console.log("开始第" + (swipeNum + 1) + "次下滑");
                delay(1);
                swipe(x, h1, x, h2, 500); //往下翻（纵坐标从5/6处滑到1/6处）
                swipeNum++;
                delay(0.5);
            } else {
                log("滑动次数达到设定次数，结束滑动");
                back();
                delay(1);
                back();
                delay(1);
                back();
                delay(1);
                return;
            }
        }
    }
    ////翻页点击专项答题

    let dlNum = 0; //每日答题轮数
    while (true) {
        delay(1)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("专项答题结束！")
            text("返回").click();
            delay(2);
            back();
            break;
        } else if (text("查看解析").exists()) {
            console.log("专项答题结束，返回！")
            back();
            delay(0.5);
            back();
            delay(0.5);
            back();
            delay(1);
            while (!textContains("我要答题").exists()) {
                back();
                delay(1);
            }
            break;
        } else if (text("再来一组").exists()) {
            delay(2);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                delay(1);
            } else {
                console.log("专项答题结束，返回！")
                delay(2);
                while (!textContains("专项答题").exists()) {
                    console.log("专项答题结束，返回！")
                    back();
                    delay(1);
                }
                back();
                delay(1);
                break;
            }
        }
    }
    //回退返回主页 
    while (!id("home_bottom_tab_button_work").exists()) {
        back();
        delay(0.5);
    }
}

/**
 * @description: 在答题选项画✔，用于各项答题部分
 * @param: x,y 坐标
 * @return: null
 */
function drawfloaty(x, y) {
    //floaty.closeAll();
    var window = floaty.window(
        <frame gravity="center">
            <text id="text" text="✔" textColor="red" />
        </frame>
    );
    window.setPosition(x, y - 45);
    return window;
}

/**
 * @description: 每日每周专项答题循环
 * @param: null
 * @return: null
 */
function dailyQuestionLoop() {
    var blankArray = [];
    var question = "";
    var answer = "";
    if (textStartsWith("填空题").exists()) {
        var questionArray = getFitbQuestion();
        questionArray.forEach(item => {
            if (item != null && item.charAt(0) == "|") { //是空格数
                blankArray.push(item.substring(1));
            } else { //是题目段
                question += item;
            }
        });
        question = question.replace(/\s/g, "");
        console.log("题目：" + question);
        var ansTiku = getAnswer(question, 'tiku');
        answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
        if (answer == "") { //答案空，前面题库未找到答案,找提示
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            console.info("提示答案：" + answer);
            var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
            console.log("本次答题随机延时:" + otherDalayTime + "秒");
            delay(otherDalayTime); //随机延时0.5-1秒
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
            checkAndUpdate(question, ansTiku, answer);
        } else { //答案非空，题库中已找到答案
            console.info("答案：" + answer);
            console.info("提示答案：" + answer);
            var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
            console.log("本次答题随机延时:" + otherDalayTime + "秒");
            delay(otherDalayTime); //随机延时0.5-1秒
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    var otherDalayTime = (random(0.5, 1) + otherQuestionSpeed);
                    console.log("本次答题随机延时:" + otherDalayTime + "秒");
                    delay(otherDalayTime); //随机延时0.5-1秒
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        }
    } else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        var questionArray = getChoiceQuestion();
        questionArray.forEach(item => {
            if (item != null && item.charAt(0) == "|") { //是空格数
                blankArray.push(item.substring(1));
            } else { //是题目段
                question += item;
            }
        });
        var options = []; //选项列表
        if (className("ListView").exists()) { //选择题提取答案，为字形题 注音题准备
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(2).text(); //此处child(2)为去除选项A.的选项内容，与争上游不同
                options.push(answer_q);
            });
        } else {
            console.error("答案获取失败!");
            return;
        }
        question = question.replace(/\s/g, "");
        if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
            question = question + options[0]; //字形题 读音题 在题目后面添加第一选项                
        }
        console.log("题目：" + question);
        var ansTiku = getAnswer(question, 'tiku');
        answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示中的答案：" + answer);
            if (text("单选题").exists()) { //仅单选题更新题库，多选题不更新进题库
                checkAndUpdate(question, ansTiku, answer);
            }
        } else {
            console.info("答案：" + ansTiku);
            delay(random(0.5, 1))
            clickByAnswer(answer);
        }
    }
    delay(random(0.5, 1)); //随机延时0.5-1秒
    if (text("确定").exists()) { //每日每周答题*-/9-+
        text("确定").click();
        delay(random(0.5, 1)); //随机延时0.5-1秒
    } else if (text("下一题").exists()) { //专项答题
        text("下一题").click();
        delay(random(0.5, 1)); //随机延时0.5-1秒
    } else if (text("完成").exists()) { //专项答题最后一题
        text("完成").click();
        delay(random(0.5, 1)); //随机延时0.5-1秒
    } else {
        console.warn("未找到右上角按钮，尝试根据坐标点击");
        click(device.width * 0.85, device.height * 0.06); //右上角确定按钮，根据自己手机实际修改
        console.warn("请手动处理");
        delay(5);
    }
    console.log("---------------------------");
    delay(2);
}


/**
 * @description: 获取填空题题目数组
 * @param: null
 * @return: questionArray
 */
function getFitbQuestion() {
    var questionCollections = className("EditText").findOnce().parent().parent();
    var questionArray = [];
    var findBlank = false;
    var blankCount = 0;
    var blankNumStr = "";
    var i = 0;
    questionCollections.children().forEach(item => {
        if (item.className() != "android.widget.EditText") {
            if (item.text() != "") { //题目段
                if (findBlank) {
                    blankNumStr = "|" + blankCount.toString();
                    questionArray.push(blankNumStr);
                    findBlank = false;
                }
                questionArray.push(item.text());
            } else {
                findBlank = true;
                /*blankCount += 1;*/
                blankCount = (className("EditText").findOnce(i).parent().childCount() - 1);
                i++;
            }
        }
    });
    return questionArray;
}


/**
 * @description: 获取选择题题目数组
 * @param: null
 * @return: questionArray
 */
function getChoiceQuestion() {
    var questionCollections = className("ListView").findOnce().parent().child(1);
    var questionArray = [];
    questionArray.push(questionCollections.text());
    return questionArray;
}


/**
 * @description: 获取提示字符串
 * @param: null
 * @return: tipsStr
 */
function getTipsStr() {
    var tipsStr = "";
    while (tipsStr == "") {
        if (text("查看提示").exists()) {
            var seeTips = text("查看提示").findOnce();
            seeTips.click();
            delay(1);
            click(device.width * 0.5, device.height * 0.41);
            delay(1);
            click(device.width * 0.5, device.height * 0.35);
        } else {
            console.error("未找到查看提示");
        }
        if (text("提示").exists()) {
            var tipsLine = text("提示").findOnce().parent();
            //获取提示内容
            // 直接获取方法
            var timu1 = tipsLine.parent();
            var timu2 = timu1.child(1);
            var tipsStr = timu2.child(0).text();
            /*
            // OCR方法：（尽量使用直接获取的方法）
            console.hide();
            delay(1);
            var image = captureScreen();
            var range = images.inRange(image, '#550000', '#ff9958');
            var objStr = OCR.Ocr(range);
            obj = JSON.parse(objStr);
            console.show();
            var i = 0;
            while (true) {
                if(!obj[i]) break;
                tipsStr += obj[i].label;
                i++;
            }
            console.info("提示获取完毕："+tipsStr);
            */
            //关闭提示
            tipsLine.child(1).click();
            break;
        }
        delay(1);
    }
    return tipsStr;
}


/**
 * @description: 从提示中获取填空题答案
 * @param: questionArray, tipsStr
 * @return: ansTips
 */
function getAnswerFromTips(questionArray, tipsStr) {
    var ansTips = "";
    for (var i = 1; i < questionArray.length - 1; i++) {
        if (questionArray[i].charAt(0) == "|") {
            var blankLen = questionArray[i].substring(1);
            var indexKey = tipsStr.indexOf(questionArray[i + 1]);
            var ansFind = tipsStr.substr(indexKey - blankLen, blankLen);
            /*ansTips += ansFind;*/
            ansTips = ansTips.concat(ansFind);
        }
    }
    return ansTips;
}

/**
 * @description: 根据提示点击选择题选项
 * @param: tipsStr
 * @return: clickStr
 */
function clickByTips(tipsStr) {
    var clickStr = "";
    var isFind = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOne().children();
        listArray.forEach(item => {
            var ansStr = item.child(0).child(2).text();
            if (tipsStr.indexOf(ansStr) >= 0) {
                var otherDalayTime = random(0.5, otherQuestionSpeed);
                console.log("题目点击随机延时:" + otherDalayTime + "秒");
                delay(otherDalayTime); //随机延时0.5-1秒
                item.child(0).click();
                clickStr += item.child(0).child(1).text().charAt(0);
                isFind = true;
            }
        });
        if (!isFind) { //没有找到 点击第一个
            var otherDalayTime = random(0.5, otherQuestionSpeed);
            console.log("题目点击随机延时:" + otherDalayTime + "秒");
            delay(otherDalayTime); //随机延时0.5-1秒
            listArray[0].child(0).click();
            clickStr += listArray[0].child(0).child(1).text().charAt(0);
        }
    }
    return clickStr;
}


/**
 * @description: 根据答案点击选择题选项
 * @param: answer
 * @return: null
 */
function clickByAnswer(answer) {
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr) {
                var otherDalayTime = random(0.5, otherQuestionSpeed);
                console.log("题目点击随机延时:" + otherDalayTime + "秒");
                delay(otherDalayTime); //随机延时0.5-1秒
                item.child(0).click();
            }
        });
    }
}

/**
 * @description: 检查答案是否正确，并更新数据库
 * @param: question, ansTiku, answer
 * @return: null
 */
function checkAndUpdate(question, ansTiku, answer) {
    if (className("Button").desc("下一题").exists() || className("Button").desc("完成").exists()) { //答错了
        swipe(100, device.height - 100, 100, 100, 500);
        var nCout = 0
        while (nCout < 5) {
            if (descStartsWith("正确答案").exists()) {
                var correctAns = descStartsWith("正确答案").findOnce().desc().substr(5);
                console.info("正确答案是：" + correctAns);
                console.log("更新题库答案...");
                updateToServer(question, correctAns);
                if (ansTiku == "") { //题库为空则插入正确答案                
                    var sql = "INSERT INTO tiku VALUES ('" + question + "','" + correctAns + "','')";
                } else { //更新题库答案
                    var sql = "UPDATE tiku SET answer='" + correctAns + "' WHERE question LIKE '" + question + "'";
                }
                insertOrUpdate(sql);
                files.write("./if.txt", parseInt(iff) + 1);
                delay(1);
                break;
            } else {
                var clickPos = className("android.webkit.WebView").findOnce().child(2).child(0).child(1).bounds();
                click(clickPos.left + device.width * 0.13, clickPos.top + device.height * 0.1);
                console.error("未捕获正确答案，尝试修正");
            }
            nCout++;
        }
        if (className("Button").exists()) {
            className("Button").findOnce().click();
        } else {
            click(device.width * 0.85, device.height * 0.06);
        }
    } else { //正确后进入下一题，或者进入再来一局界面
        if (ansTiku == "" && answer != "") { //正确进入下一题，且题库答案为空              
            updateToServer(question, answer);
            var sql = "INSERT INTO tiku VALUES ('" + question + "','" + answer + "','')";
            insertOrUpdate(sql);
            console.log("更新本地题库答案...");
        }
    }
}

/**
 * @description: 上传题目答案至网络题库
 * @param: question, answer
 * @return: null
 */
function updateToServer(question, answer) {
    var errorflag = 0; // 在线题库错误标志位
    var onlineTiKuUrl = onlineTiKuUrl1 + "/insertOrUpdate"; // 将自定义的题库地址组成题库上传地址
    if (!errorflag) {
        console.info("开始上传在线题库");
        var res = http.post(onlineTiKuUrl, {
            "question": question,
            "answer": answer
        });
        if (res.statusCode == 200) {
            console.info("在线题库上传成功！");
        } else {
            var errorinfo = res.statusCode;
            console.error("在线题库失联，请联系管理修复题库，错误代码：" + errorinfo + " ,本次运行不再上传！");
            errorflag = 1;
        }
    } else {
        console.error("在线题库失联，请联系管理修复题库，错误代码：" + errorinfo + " ,本次运行不再上传！");
    }
}

exports.getJsonLength = getJsonLength;
//exports.sau = sau;
exports.video_timing_news = video_timing_news;
exports.radio_timing = radio_timing;
exports.getLearnedArticle = getLearnedArticle;
exports.insertLearnedArticle = insertLearnedArticle;
exports.article_timing = article_timing;
exports.CollectAndShareAndComment = CollectAndShareAndComment;
exports.articleStudy = articleStudy;
exports.main = main;
exports.start_app = start_app;
exports.delay = delay;
exports.getScores = getScores;
exports.articleStudy1 = articleStudy1;
exports.articleStudy2 = articleStudy2;
exports.videoStudy_news = videoStudy_news;
exports.videoStudy_bailing = videoStudy_bailing;
exports.video_timing_bailing = video_timing_bailing;
exports.listenToRadio = listenToRadio;
exports.stopRadio = stopRadio;
exports.CollectAndShare = CollectAndShare;
exports.Comment = Comment;
exports.localChannel1 = localChannel1;
exports.sub = sub;
exports.dateToString = dateToString;
exports.getTodayDateString = getTodayDateString;
exports.getYestardayDateString = getYestardayDateString;
exports.indexFromChar = indexFromChar;
exports.challengeQuestion = challengeQuestion;
exports.challengeQuestionLoop = challengeQuestionLoop;
exports.judge_tiku_existence = judge_tiku_existence;
exports.getAnswer = getAnswer;
exports.insertOrUpdate = insertOrUpdate;
exports.dailyQuestion = dailyQuestion;
exports.weeklyQuestion = weeklyQuestion;
exports.specialQuestion = specialQuestion;
exports.drawfloaty = drawfloaty;
exports.dailyQuestionLoop = dailyQuestionLoop;
exports.getFitbQuestion = getFitbQuestion;
exports.getChoiceQuestion = getChoiceQuestion;
exports.getTipsStr = getTipsStr;
exports.getAnswerFromTips = getAnswerFromTips;
exports.clickByTips = clickByTips;
exports.clickByAnswer = clickByAnswer;
exports.checkAndUpdate = checkAndUpdate;
exports.updateToServer = updateToServer;