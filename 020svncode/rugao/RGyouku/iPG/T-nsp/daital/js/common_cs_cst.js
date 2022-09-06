/* @description 广告ADP服务器IP地址    **/
var ADP_ServiceIP = "http://10.2.4.159:8080/";
var AAA_ServiceIP = "http://10.9.219.34:18080/";
var rootUrl = "http://10.9.219.34";
/** @description epgUrl 业务模板存放路径，到1HD_blue的下层*/
var epgUrl = "/iPG/T-nsp/";
var epgPageUrl = location.href.substring(0, parseInt(location.href.lastIndexOf("/")) + 1);
/** @description npvrServiceUrl npvr服务器IP，port*/
var npvrServiceUrl = "http://172.30.0.51:8081/npvr/";
var skinImgUrl = "skin/images/";
var btvImgUrl="skin/btvImg/";
var defaultPic = skinImgUrl+"show_pic.png";
var tipWindowObj = null, buyObj = null;
var mediaTipFlag = false;//剧集弹出框标识
var searchTipFlag = false;//搜索弹出框标识
var newListFlag = false;//新闻拆条弹出框标识
var searchCataIds="6571807";

var closeTimer;
var closeCount = 0;

var nginx_host = "10.9.220.8";
var nginx_port = "80";
var reportAddr = "http://"+nginx_host+":"+nginx_port+"/dc";
var tModel = SysInfo.STBBrand+","+SysInfo.STBModel;
var tId = SysInfo.STBSerialNumber;
var uc = getSmartCardId();

function syncReportMessageByStatus(status) {
    var reportJson = "";
    if (getGlobalVar("reportVodAssetJson")!=""){
        reportJson = getGlobalVar("reportVodAssetJson");
    } else if (getGlobalVar("reportVodPackageJson")!="") {
        reportJson = getGlobalVar("reportVodPackageJson");
    }else if (getGlobalVar("reportBtvJson")!=""){
        reportJson = getGlobalVar("reportBtvJson");
    }
    reportToCoshipBigData(changejson(reportJson,status));
}
function changejson(jsonStr,status){
    var obj = JSON.parse(jsonStr);
    obj.eStatus = status;
    return JSON.stringify(obj);
}
function reportToCoshipBigData(data) {
    this.xmlHttp = null;
    this.createXMLHttpRequest = function () {
        if(window.XMLHttpRequest) {
            this.xmlHttp = new XMLHttpRequest();
            if (this.xmlHttp.overrideMimeType) {
                this.xmlHttp.overrideMimeType('text/xml');
            }
        } else {
            if(window.ActiveXObject) {
                this.xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
    };
    this.getData = function () {
        this.createXMLHttpRequest();
        var xmlHttp = this.xmlHttp;
        this.xmlHttp.open("POST", reportAddr, true); // 默认异步
        this.xmlHttp.send(data);
        this.xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4) {
                if(xmlHttp.status == 200) {
					//alert("report success"+data);
                } else {//超时间方法,传入空会自动弹出服务器忙的提示
                    //showMsg("", "系统忙,请稍候重试。");
                }
            }
        };
    };
    this.getData();
}
function getUUid() {
    var timestamp = new Date().getTime();
    var randomTime = Math.ceil(Math.random()*100000);
    return tId+"_"+timestamp+"_"+randomTime;
}
function transTime(timeStr) {
    if (timeStr != null && timeStr !=""){
        var year = timeStr.substring(0,4);
        var month = timeStr.substring(4,6);
        var day = timeStr.substring(6,8);
        var hour = timeStr.substring(8,10);
        var min = timeStr.substring(10,12);
        var sec = timeStr.substring(12,14);
        return year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
    } else {
        return "";
    }
}
function getTimeSeconds(time) {//20170721095020 计算时间差 返回秒
    var hour = stringToInt((time.substring(8,10)));
    var min = stringToInt(time.substring(10,12));
    var sec = stringToInt(time.substring(12,14));
    return hour*60*60+min*60+sec;
}
function stringToInt(str) {
    if (str.substring(0,1)=="0"){
        return parseInt(str.substring(1,2));
	} else{
        return parseInt(str);
	}
}
function getDuration(startTime,endTime){
    if (endTime.substring(6,8) > startTime.substring(6,8) || endTime.substring(4,6) > startTime.substring(4,6)) {
        var time1 = getTimeSeconds(endTime);
        var hour = (23 - parseInt((startTime.substring(8,10))))*60*60;
        var min = (59 - parseInt(startTime.substring(10,12)))*60;
        var sec = 60 - parseInt(startTime.substring(12,14));
        var time2 = hour + min + sec;
        return time1+time2;
    }else {
        var end = getTimeSeconds(endTime);
        var start = getTimeSeconds(startTime);
        return end-start;
}
}
function clearAllReportJson() {
    setGlobalVar("reportBtvJson","");
    setGlobalVar("reportVodAssetJson","");
    setGlobalVar("reportVodPackageJson","");
}

/* @description 全局对象**/
var V, IEPG = V = IEPG || {};

/** @description epgUrl 业务模板存放路径，到1HD_blue的下层*/
var goUrl = location.href.split("/T-nsp")[0];  // such as:http://172.21.12.12:8080
var tipUrl = goUrl+"/T-nsp/";    // 弹框前缀路径
var epgVodUrl="../../";

/* @description 购买弹出框标识    **/
var buyTip=false;
/* @description 试看结束购买弹出框标识    **/
var tryBuyTip=false;
/* @description 收藏成功弹出框标识，收藏成功按红色键进入我的收藏 **/
var collectFlag=false;
/* @description 评分弹出标志 **/
var gradeTipFlag=false;
/* XML请求数据头部 */
var xmlHead = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>";
/*XML请求数据必填参数*/
var portalId = 102;
/*XML请求数据必填参数  卡号*/
var cardId = getSmartCardId();
/** userId 为用户ID */
var userId = getUserId();

try {
    if( typeof Utility != "undefined") {
        Utility.setDrawFocusRing(0);
    }
} catch (e) {
    if( typeof Coship != "undefined") {
        Coship.setDrawFocusRing(1);
    }
}

function checkUser(){
    // var sid = getSid();
    // if (sid == "" || sid == "0") {
    //     showMsgWmj("","请插入有效卡！");
    //     return false;
    // }
    var userId = getUserId();
    if (userId == "" || userId == "0") {
        showMsgWmj("","用户鉴权失败，请联系客服96596!");
		return false;
    }
    return true;
}

// function checkUser() {
//     var sid = getSid();
//     if (sid == "" || sid == "0") {
//         showMsg("请插入有效卡！");
//         return false;
//     } else {
//         var userId = getUserId();
//         if (userId == "" || userId == "0") {
//             showMsg("请插入有效卡，并重新启动机顶盒进行认证！");
//             return false;
//         }
//     }
//     return true;
// }


function getSid() {
    try {
        return Utility.getSystemInfo("SID");
    } catch (e) {
        return 0;
    }
}



/*function getUserId() {
   try {
        var userId = Utility.getSystemInfo("UID");
        if (userId == ""){
            return 0;
        }else{
            return userId;
        }
    } catch (e) {
        return 0;
    }
}*/

function getUserId() {//获取userId
	var userId;
	// try {
	//     userId = iPanel.getGlobalVar("userId");
	// } catch (e) {
	//     userId=0;
	// }
	// if(iPanel.getGlobalVar("userId")==""){
	//     return "0";
	// }
	/*userId = getGlobalVar('userId');
    if(userId == ""){
        userId = getSmartCardId();
    }
    return userId;*/
	return getSmartCardId();
}

function getSmartCardId(){
    if(Utility.getSystemInfo("SID")==""){
        return 0
    }
    try {
        return  Utility.getSystemInfo("SID");
    } catch (e) {
        return "0";
    }
}//获取智能卡号



function New(aClass, params) {
    function _new() {
        if(aClass.initializ) {
            aClass.initializ.call(this, params);
        }
    }
    _new.prototype = aClass;
    return new _new();
}

Object.extend = function(destination, source) {
    for(var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

var $ = function(id) {
    return typeof id == 'string' ? document.getElementById(id) : id;
};
var G = function(object, attribute) {
    return object.getAttribute(attribute);
};
var tags = function(object, tagname) {
    return object.getElementsByTagName(tagname);
};

var changeBg = function (id, url) {//改变背景图
    if (url.indexOf("url") >= 0){
        $(id).style.background = url + " no-repeat";
    }else{
        $(id).style.background = "url(" + url + ") no-repeat";
    }
};
function changeObjClass(id, className) {//改变对象样式
	$(id).className = className;
}
var KEY = {
	"ZERO" : 48,
	"ONE" : 49,
	"TWO" : 50,
	"THREE" : 51,
	"FOUR" : 52,
	"FIVE" : 53,
	"SIX" : 54,
	"SEVEN" : 55,
	"EIGHT" : 56,
	"NINE" : 57,

	"LEFT" : 37,
	"RIGHT" : 39,
	"UP" : 38,
	"DOWN" : 40,
	"ENTER" : 13,
	"PREV" : 33,
	"NEXT" : 34,
	"QUIT" : 27,
	"RED" : 82,
	"YELLOW" : 89,
	"BLUE" : 406,
	"GREEN" : 71,

	"PLAY" : 3864,
	"PLAY1" : 3862,
	"SEARCH" : 3880,

	"UP_N" : 87,		//N9101盒子键值
	"DOWN_N" : 83,
	"LEFT_N" : 65,
	"RIGHT_N" : 68,
	"ENTER_N" : 10,
	"PREV_N" : 306,
	"NEXT_N" : 307,
	"QUIT_N" : 72,
	"RED_N" : 403,
	"GREEN_N" : 404,
	"YELLOW_N" : 405,
	"BLUE_N" : 406,
	"BACK" : 8,
	"RETURN" : 640,
	"MENU":468,
	"BINDING":645
};

document.onkeydown = grabEvent;
var keycode;
function grabEvent(e) {
    e = (e) ? e : window.event;
    keycode = e.keyCode || e.which;
   if(tipFlag) {
		switch(keycode) {
			case KEY.BACK:
			case KEY.RETURN:
			case KEY.QUIT:
				e.preventDefault();
				if(searchTipFlag) {//搜索弹出框按返回时的处理
					if(($("search_Input").value).length != 0) {
					    if(keycode == KEY.QUIT){
					        deleteAll();
					    }else{
					        deleteValue();
					    }
					} else {
						closeTip();
					}
				} else {//弹出框默认处理
					closeTip();
					//goTo.back();
				}
				break;
			case KEY.LEFT:
			case KEY.LEFT_N:
				moveLeft();
				break;
			case KEY.ENTER:
			case KEY.ENTER_N:
			if(pwdFlag){
					while(CheckAppPWS()){
						Buy.doBuy();//提示购买时按确认键购买
					}
				}
				break;
			case KEY.RIGHT:
			case KEY.RIGHT_N:
				moveRight();
				break;
		}
	} else if(mediaTipFlag) {//弹出集数选择框
		switch(keycode) {
			case KEY.ENTER:
			case KEY.ENTER_N:
				doMediaConfirm();
				break;
			case KEY.BACK:
			case KEY.RETURN:
			case KEY.QUIT:
				e.preventDefault();
				hiddenMedia();
				break;
			case KEY.LEFT:
			case KEY.LEFT_N:
				e.preventDefault();
				moveMediaLeft();
				break;
			case KEY.RIGHT:
			case KEY.RIGHT_N:
				e.preventDefault();
				moveMediaRight();
				break;
			case KEY.NEXT:
			case KEY.NEXT_N:
				turnNextMediaPage();
				break;
			case KEY.PREV:
			case KEY.PREV_N:
				turnPrevMediaPage();
				break;
		}
	}else if(newListFlag) {//弹出集数选择框
		switch(keycode) {
			case KEY.UP:
			case KEY.UP_N:
				moveUp();
				break;
			case KEY.DOWN:
			case KEY.DOWN_N:
				moveDown();
				break;
			case KEY.PREV:
			case KEY.PREV_N:
				turnPrevPage();
				break;
			case KEY.NEXT:
			case KEY.NEXT_N:
				turnNextPage();
				break;
			case KEY.ENTER:
			case KEY.ENTER_N:
				doConfirm();
				break;
			case KEY.BACK:
			case KEY.RETURN:
				e.preventDefault();
				doHideNewClass();
				break;
		  }
	}else {
		switch(keycode) {
			case KEY.ONE:
			case KEY.TWO:
			case KEY.THREE:
			case KEY.FOUR:
			case KEY.FIVE:
			case KEY.SIX:
			case KEY.SEVEN:
			case KEY.EIGHT:
			case KEY.NINE:
			case KEY.ZERO:
				doNumberKey(keycode);
				break;
			case KEY.UP:
			case KEY.UP_N:
				moveUp();
				break;
			case KEY.DOWN:
			case KEY.DOWN_N:
				moveDown();
				break;
			case KEY.LEFT:
			case KEY.LEFT_N:
				moveLeft();
				break;
			case KEY.RIGHT:
			case KEY.RIGHT_N:
				moveRight();
				break;
			case KEY.NEXT:
			case KEY.NEXT_N:
				turnNextPage();
				break;
			case KEY.PREV:
			case KEY.PREV_N:
				turnPrevPage();
				break;
			case KEY.ENTER:
			case KEY.ENTER_N:
				e.preventDefault();
				doConfirm();
				break;
            case KEY.PLAY:
            case KEY.PLAY1:
                doPlayKey();
                break;
            case KEY.BACK:
            case KEY.RETURN:
                e.preventDefault();
				clearGlobalVar();
				doEvent.back();
				break;
			case KEY.RED:
			case KEY.RED_N:
			case 118:
				doEvent.red();
				break;
			case KEY.GREEN:
			case KEY.GREEN_N:
			case 119:
				doEvent.green();
				break;
			case KEY.YELLOW:
			case KEY.YELLOW_N:
			case 120:
				doEvent.yellow();
				break;
			case KEY.BLUE:
			case KEY.BLUE_N:
			case 121:
				doEvent.blue();
				break;
			case KEY.POSITION:
			case KEY._POSITION:
				doEvent.position();
				break;
			case KEY.QUIT:
			case KEY.QUIT_N:
                e.preventDefault();
                doEvent.quit();
                break;
			case KEY.MENU:
				e.preventDefault();
				doEvent.home();
				break;
			case KEY.BINDING:
				location.href = "/iPG/T-nsp/vodctrlmessage/scanLogin.html";
				break;
		}
    }
}

function doNumberKey(keycode){

}

/**
 * @description trim 去掉字符串前后空格
 * @param {string} _str 需要处理的字符串
 */
function trim(_str) {
	try{
		return _str.replace(/(^\s*)|(\s*$)/g, "");
	}catch(e){}

}

var doEvent = {
    /** @description  红色键处理函数*/
    red : function() {
		doRedKey();
    },
    /** @description  绿色键处理函数*/
    green : function() {
		doGreenKey();
    },
    /** @description  黄色键处理函数*/
    yellow : function() {
		doYellowKey();
    },
    /** @description  蓝色键处理函数*/
    blue : function() {
		doBlueKey();
    },
    /** @description  返回键处理函数*/
    back : function() {
        goTo.back();
    },
    /** @description  主页键处理函数*/
    home : function() {
		clearGlobalVar();
        goTo.portal();
    },
    /** @description  定位键处理函数*/
    position : function() {
        goTo.search();
    },
    /** @description  退出键处理函数*/
    quit : function() {
        goTo.toIndex();
    }
};

function doRedKey(){}
function doGreenKey(){}
function doYellowKey(){}
function clearGlobalVar(){}
function doBlueKey(){}

function setGlobalVar(sName, sValue) {
    try {
        sValue = sValue + "";
        Utility.setEnv(sName, sValue);
    } catch (e) {
        document.cookie = escape(sName) + "=" + escape(sValue);
    }
}

function getGlobalVar(sName) {
    var result = null;
    try {
        result = Utility.getEnv(sName);
        if(result == undefined) {
            result = "";
        }
    } catch (e) {
        var aCookie = document.cookie.split("; ");
        for(var i = 0; i < aCookie.length; i++) {
            var aCrumb = aCookie[i].split("=");
            if(escape(sName) == aCrumb[0]) {
                result = unescape(aCrumb[1]);
                break;
            }
        }
    }
    return result;
}

//----------------------  路径缓存操作---------------------------------------------------------
/*
 * 在有页面跳转动作时调用 ，用来保存当前页面的URL，URL 之间以 urlSplitChar 号分隔，
 * 调用此方法之前页面需要保存其它的变量需要自己操作
 */
var urlSplitChar = "#";//URL之间的分隔符，可配，但注意确保不会与URL参数重复
var globalPath = {
    setUrl : function() {
        var tempUrl = getGlobalVar("GLOBALURLPATH") == undefined ? "" : getGlobalVar("GLOBALURLPATH");//取全局变量
        tempUrl = tempUrl + urlSplitChar + location.href;  //将已存在的路径和当前URL之间加上分隔符
		var arr = tempUrl.split(urlSplitChar);
		if(arr.length > 6) {
			var removeLength = arr.length - 6;
			var newArr = arr.slice(removeLength);//从指定位置开始复制数组，一直到最后
			tempUrl = arr[1] + urlSplitChar + newArr.join(urlSplitChar);//保留原来数组中第一个路径（portal进入的路径）
		}
        setGlobalVar("GLOBALURLPATH", tempUrl);
    },
    getUrl : function() {//返回上一路径
        var tempUrl = getGlobalVar("GLOBALURLPATH");
        var tuArr = tempUrl.split(urlSplitChar);
        var tl = tuArr.length;
        var tul = tuArr.pop();
        if(!tul || tul == "") {
            tul = getGlobalVar("PORTAL_ADDR");
        }
        var newUrl = tuArr.join(urlSplitChar);
        setGlobalVar("GLOBALURLPATH", newUrl);
        location.href = tul;
    },
    cleanUrl : function() {
        setGlobalVar("GLOBALURLPATH", "");
    }
};
//----------------- 日期、星期、时间---------------------------------------
var showTime = {
    init : function() {
        if($("time")) {
            this.getTime();
            setInterval(this.getTime, 60000);
        }
    },
    getTime : function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        var hour = date.getHours();
        var minute = date.getMinutes();
        month = month < 10 ? "0" + month : month;
        day = day < 10 ? day = "0" + day : day;
        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        var day_ = year + "." + month + "." + day;
        var week_ = week[date.getDay()];
        var time_ = hour + ":" + minute;
        if($("date") && $("week")) {
            $("time").innerHTML = time_;
            $("week").innerHTML = week_;
            $("date").innerHTML = day_;
        } else {
            $("time").innerHTML = day_ + " " + week_ + " " + time_;
        }
    }
};
//******************************* 获取套餐价格单位 *********************************
function getGoodsPriceUnit(priceUnit){
	switch(priceUnit){
		case "1":
			priceUnit = "只能观看1次";
			break;
		case "2":
			priceUnit = "分钟";
			break;
		case "3":
			priceUnit = "小时";
			break;
		case "4":
			priceUnit = "天";
			break;
		case "5":
			priceUnit = "周";
			break;
		case "6":
			priceUnit = "月";
			break;
		case "7":
			priceUnit = "年";
			break;
		case "8":
			priceUnit = "兆";
			break;
	}
	return priceUnit;
}
//******************************* 真焦点处理 *********************************
// inputs 标签状态保存
var inputsStates;
//将页面上所有的标签都设为可用
function enabledAll() {//所有 input 标签
	var inputs = document.getElementsByTagName("input");
	for(var i = 0; i < inputs.length; i++) {
		inputs[i].disabled = inputsStates[i];
	}
}

//将页面上所有的标签都设为不可用
function disabledAll() {//所有 input 标签
	var inputs = document.getElementsByTagName("input");
	inputsStates = new Array(inputs.length);
	for(var i = 0; i < inputs.length; i++) {
		inputsStates[i] = inputs[i].disabled;
		inputs[i].disabled = true;
	}
}

//*************************** 秒转换为 xx:xx:xx的通用方法***********************************
function MillisecondToDate(msd) {
	var time = parseInt(msd,10);
	if (null!= time &&""!= time) {
		if (time >60&& time <60*60) {
			var m = parseInt(time /60.0,10);
			var s =  parseInt((parseFloat(time /60.0) - parseInt(time /60.0,10)) *60,10);
			m = m<10?"0"+m:m;
			s = s<10?"0"+s:s;
			time = m +":"+s ;
		}else if (time >=60*60&& time <60*60*24) {
			var h = parseInt(time /3600.0,10);
			var m = parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60,10)
			var s = parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60,10);
			h = h<10?"0"+h:h;
			m = m<10?"0"+m:m;
			s = s<10?"0"+s:s;
			time = h+":"+m +":"+s ;
		}else {
			var s = time<10?"0"+time:time;
			time = "00:"+s;
		}
	}else{
		time = "00:00:00";
	}
	return time;

}




//*************************** 消息弹出框 ***********************************
/**
 * @description subText 消息弹出框，显示提示信息,传入 空,弹出服务器忙的提示
 */

var tipDivId = "tip_visibility";//弹出框div的ID
var messInfoId = "tip_window";//显示消息文字的div的ID
var lastObj;//弹出窗口之前有焦点的对象
var tipFlag = false;//弹出框标识，true为有弹出框，默认为false；
var delNpvrFlag = false;//弹出框删除npvr标识，true为有弹出框，默认为false；
var OKButtonId = "OKButton";
function showMsg(url, msg) {
	if(!tipFlag)// 如果当前已经没有弹出窗口,则需要保存当前焦点对象和面页按键的有效状态
	{
		if(!lastObj){
			lastObj = document.activeElement;
			disabledAll();
		}
	}
	var tipDiv = $(tipDivId);
	var tipWindow = $(messInfoId);
	if(url == "") {
		url = epgUrl + "tip/a_info.htm";
/*		if(msg == "") {
			msg = "系统忙，请稍后再试！";
		}*/
	}
	new ajaxUrl({"url" : url, "handler" : function(resText) {
		tipDiv.style.visibility = "visible";
		if(resText.indexOf("collectInfo") >= 0){
			if(resText.indexOf("成功") >= 0){
				resText = "<!-- a_collectInfo --><h1>温馨提示</h1><h2>尊敬的用户:</h2><h3 id='message'>您好！回放频道《"+
				tvChannelList[listFocus].channelName+"》已经放入[我的点播>回放频道收藏]。</h3><div class='tip_button'>"+
				"<ul class='one_button' style='top:-30px;'><li><input name='' type='button' value='确认' id='OKButton'"+
				"onclick='closeTip();'/></li></ul></div>";
			}
		}
		if(resText.indexOf("a_errorInfo") >= 0){
			if(resText.indexOf("成功") >= 0){
				resText = "<!-- a_errorInfo --><h1>温馨提示</h1><h2>尊敬的用户:</h2><h3 id='message'>您好！节目《"+
				Buy.name+"》已经放入[我的点播>点播节目收藏]。</h3><div class='tip_button'>"+
				"<ul class='one_button' style='top:-30px;'><li><input name='' type='button' value='确认' id='OKButton'"+
				"onclick='closeTip();'/></li></ul></div>";
			}
		}
		tipWindow.innerHTML = resText;
		tipFlag = true;
		if(resText.indexOf("a_searchTip") >= 0) {//搜索提示框
		    searchTipFlag = true;
			$('search_Input').focus();
			return;
		}
		if(msg != ""){
			$("message").innerHTML = msg;
		}
		//弹出窗口确定按钮Id必须为 OKButton ,OKButton为弹出窗口专用ID
		if($(OKButtonId)){
			$(OKButtonId).focus();
		}
		if(resText.indexOf("a_recmd") >= 0) {//搜索提示框
			var reCount=parseInt($("userRecmLevel").innerHTML);
			$("userRecmLevel").innerHTML =reCount+1;
			$("recmCount").innerHTML =reCount+1;
		}else if(resText.indexOf("a_buyPackTip") >= 0) {
			$("pmName").innerHTML =subText(Buy.name,36,0);
			$("TCName1").innerHTML =goodsName;
			$("TCName2").innerHTML =goodsName;
			$("TCPrice").innerHTML =goodsPriceTC;
		}else if(resText.indexOf("a_buyTip") >= 0) {
			$("TipPlayTime").innerHTML = Buy.playTimes;
			$(OKButtonId).onclick = function() {
				if(IS_INPUT_PASSWORD){inputPassword();}
				else{Buy.doBuy();}
			};
		}else if(resText.indexOf("a_buyPackOk") >= 0) {
			$("tcName").innerHTML =getGlobalVar("tc_name");
		} else if(resText.indexOf("a_buyOk") >= 0) {
			$(OKButtonId).onclick = function() {
				var msg = "您好！[续看]功能记录了您上次在观看《"+ Buy.name +"》时在节目进行" + MillisecondToDate(Buy.breakTime) +"处中止了节目播放，请您选择是否从上次中止时间继续观看。";
				if(Buy.isPack == "1" &&Buy.breakTime !=0 && Buy.playFlag !="1"){
					var url = epgUrl+"tip/a_playBreak.htm";
					showMsg(url,msg);
				}else if(Buy.isPack == "2"  &&Buy.breakTime !=0){
					var url = epgUrl+"tip/a_bookMarkPlay.htm";
					showMsg(url,msg);
				}else{
					Buy.doPlay();
				}
			};
		}else if(resText.indexOf("a_breakTimeTip") >= 0){
			$(OKButtonId).onclick = function() {
				Buy.doPlay();
			};
			$("rePlayButton").onclick = function() {
				setGlobalVar("timePosition","");
				Buy.doPlay();//重新播放
			};
		}else if(resText.indexOf("a_sortChoose") >= 0){
			$(OKButtonId).onclick = function() {
				closeTip();
				$("list_"+listFocus).className="";
				listFocus = 0;
				curPage = 1;
				resort(index);
				$("list_"+listFocus).className="";
			};
		}
		if(resText.indexOf("a_searchTip") >= 0 || resText.indexOf("a_buyPackTip") >= 0 || resText.indexOf("a_buyTip") >= 0 || resText.indexOf("a_buyOk") >= 0 || resText.indexOf("a_breakTimeTip") >= 0 || resText.indexOf("a_sortChoose") >= 0 || resText.indexOf("a_buyTvTip") >= 0||resText.indexOf("a_bookMarkPlay") >= 0||resText.indexOf("a_bookMarkTip") >= 0||resText.indexOf("a_bookMarkTip") >= 0||resText.indexOf("a_playNextTip") >= 0){
		      tipFlag=true;
        }else{
		closeTimer = setInterval(function(){
			if(closeCount < 5){
				closeCount++;
			}else{
				closeTip();
			}
		},1000);
		}
	}
	});
}


/**
 * @description GetXmlHttpObject ajax请求时状态判断
 * @param {function} _handler 回调函数
 */

var xmlHttp;
function GetXmlHttpObject(_handler) {
    var objXmlHttp = null;
    if(window.XMLHttpRequest) {
        objXmlHttp = new XMLHttpRequest();
    } else {
        if(window.ActiveXObject) {
            objXmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    objXmlHttp.onreadystatechange = function() {
        if(objXmlHttp.readyState == 4) {
            if(objXmlHttp.status == 200) {
                _handler(xmlHttp.responseText);
            } else {
                //超时间方法,传入空会自动弹出服务器忙的提示
                showMsg("","系统忙,请稍候重试。");
            }
        }
    };
    return objXmlHttp;
}

/**
 * @description ajaxUrl ajax请求函数，与服务器进行数据交互
 * @param {string} _callbackfun 回调函数
 */

function ajaxUrlNotEval(_url, _callbackfun) {
    xmlHttp = GetXmlHttpObject(_callbackfun);
    xmlHttp.open("GET", _url, true);
    xmlHttp.send(null);
}






function ajaxUrl(param, _flag) {
	this.url = param.url || "";
    this.method = param.method || "get";
    this.handler = param.handler;
	this.xmlHttp = null;
	this.flag = _flag || "json";

	this.createXMLHttpRequest = function () {
		if (window.ActiveXObject) {
			this.xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}else {
			this.xmlHttp = new XMLHttpRequest();
		}
	}
	this.getData = function () {
		this.createXMLHttpRequest();
		var xmlhttp = this.xmlHttp;
		var handler = this.handler;
		var flag = this.flag;
		var obj = new Object();
		this.xmlHttp.open(this.method, this.url, true);
		this.xmlHttp.send(null);
		this.xmlHttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200 || xmlhttp.status == 0) {
					callBackData(xmlhttp,handler,flag);
				}
			}
		}
	}
	this.getData();
}
/**
 * @description 此函数的作用是解析ajax返回的json，将数据变为json对象
 * @param {string} _data ajax返回xmlHttp.responseText
 */

function parseJSON(_data) {
	if((_data.indexOf("a_") >= 0 && _data.indexOf("<!--") >= 0) || _data.indexOf("success") >= 0 ) {//此句的作用在于返回的不是json格式数据
		return _data;
	}
    if( typeof _data !== "string" || !_data) {
        return null;
    }
    return eval("(" + _data + ")");
}

/**
 * @description callBackData 对ajax返回的数据进行统一的处理
 * @param {object} xmlHttp 为ajax返回xmlHttp对象
 * @param {function} _handler 当请求的数据成功返回时，为页面的回调函数
 *  @param {string} flag 是否是json对象
 */

function callBackData(_xmlHttp, _handler, flag) {
//	Utility.println("crespo ajax callbackData flag:"+flag+" responseText:"+_xmlHttp.responseText);

	if(flag == "json"){
	var resText = parseJSON(_xmlHttp.responseText);
	} else {
		var resText = _xmlHttp.responseText;
	}
//	Utility.println("crespo ajax callbackData resText:"+resText);
	_handler(resText);
}

function subText(str, sub_length, num) {//汉字与字符都都在时截取长度
    var temp1 = str.replace(/[^\x00-\xff]/g, "**");
    var temp2 = temp1.substring(0, sub_length);
    var x_length = temp2.split("\*").length - 1;
    var hanzi_num = x_length / 2;
    sub_length = sub_length - hanzi_num;
    //实际需要sub的长度是总长度-汉字长度
    var res = str.substring(0, sub_length);
    if(num == 0) {
        if(sub_length < str.length)
            res = res + "...";
        return res;
    }else if(num == 1){
        if(sub_length < str.length) {
            return "<marquee scrollLeft='1' behavior='scroll' direction='left' scrollamount='6' scrolldelay='100'>" + str + "</marquee>";
        } else {
            return str;
        }
    }else{
		return res;
	}
}

var marqueeTimer=-1;
function substringText(str,sub_length,targerElementName,num,size)
{
    var timeFlag = 0;
    var txtSpan1 = "";
    var txtSpan2 = "";
    var windowDiv  = "";
    var topDiv =  "";
    //var fontSize = fontSize ? 20 : fontSize; //当前元素限定字体的大小
	var fontSize = size==undefined ? 20 : size;
    var textLength = 0;
    var speed = 30; // 滚动的速度

    function doWithString(str,sub_length,targerElementName,num)
    {		//汉字与字符都都在时截取长度
        var temp1 = str.replace(/[^\x00-\xff]/g,"**");
        var temp2 = temp1.substring(0,sub_length);
        var x_length = temp2.split("\*").length - 1 ;
        var hanzi_num = x_length /2 ;
        sub_length = sub_length - hanzi_num ;//实际需要sub的长度是总长度-汉字长度
        var res = str.substring(0,sub_length);
        if(num==0)
        {
            if(sub_length < str.length )
            {
                res = res;
                createNormalDiv(targerElementName,res);
            }else
            {
                createNormalDiv(targerElementName,str);
            }
        }else
        {
            if(sub_length < str.length )
            {
                createScrollDiv(targerElementName,str);
            }else
            {
                createNormalDiv(targerElementName,str);
            }
        }
    }
    function createNormalDiv(targerElementName,text)
    {
		try{
			showNormalData();
		}catch(e){}
    }
    function createScrollDiv(divName,text)
    {
        initElement(divName,text);
        marqueeTimer=window.setInterval(Marquee,speed);
    }
    function initElement(divName,text)
    {
        textLength = text.replace(/[^\x00-\xff]/g,"**").length;
        topDiv = document.getElementById(divName);
        topDiv.innerText = ' ';
        var childNodes = topDiv.getElementsByTagName("span");
        if(childNodes.length == 0)
        {
            for(var i=0; i<childNodes.length; i++)
            {
                topDiv.removeChild(childNodes[i]);
            }
        }
        windowDiv = document.createElement("div");
        txtSpan1 = document.createElement("span");
        txtSpan2 = document.createElement("span");

        windowDiv.appendChild(txtSpan1);
        windowDiv.appendChild(txtSpan2);
        topDiv.appendChild(windowDiv);

        windowDiv.style.position = "absolute";
       // windowDiv.style.width = topDiv.offsetWidth + "px";
        //windowDiv.style.width = "100px";//310
		windowDiv.style.width = ($(targerElementName).offsetWidth)+"px";
        windowDiv.style.height = "390px";
        windowDiv.style.overflow = "hidden";
        windowDiv.className=topDiv.className;
        //windowDiv.style.top=(topDiv.offsetTop) + "px";
        windowDiv.style.lineHeight="60px";
        windowDiv.style.textAlign="left";

        txtSpan1.innerHTML = text;
        txtSpan1.style.float = "left";
       // txtSpan1.style.textAlign="left";
        txtSpan1.style.paddingLeft="10px";
        txtSpan1.style.width = fontSize*textLength/2  + windowDiv.offsetWidth + "px";
        txtSpan1.style.display = "block";
        txtSpan1.style.wordWrap = "normal";
        txtSpan1.style.overflow = "hidden";
        txtSpan1.style.fontSize=fontSize+"px";

        txtSpan2.innerHTML = text;
        txtSpan2.style.position = "absolute";
       // txtSpan2.style.textAlign="left";
        txtSpan2.style.paddingLeft="10px";
        txtSpan2.style.left = windowDiv.offsetWidth + "px";
        txtSpan2.style.width = fontSize*textLength/2  + windowDiv.offsetWidth + "px";
        txtSpan2.style.display = "none"
        txtSpan2.style.fontSize=fontSize+"px";

    }
    function Marquee()
    {
        if(timeFlag == 0)
        {
            if(txtSpan1.offsetWidth - windowDiv.offsetWidth - windowDiv.scrollLeft<=0)
            {
                txtSpan1.style.display = "none";
                txtSpan2.style.display = "block"
                windowDiv.scrollLeft = 0;
                timeFlag = 1;
            }else
            {
                windowDiv.scrollLeft++;
            }
        }else
        {
            if(txtSpan2.offsetWidth - windowDiv.scrollLeft<=0)
            {
                windowDiv.scrollLeft = 0;
            }else
            {
                windowDiv.scrollLeft++;
            }
        }
    }
    doWithString(str,sub_length,targerElementName,num);
}

//页面做分页处理时，pageLength：总数据长度，pageSize：页面可显示的数据长度
function getMaxPage(pageLength,pageSize){     //求最大页数
	if(pageLength == 0 || pageLength == undefined){return 0;}
	if (pageLength % pageSize != 0) {
		return Math.ceil(pageLength / pageSize);
	}else{
		return pageLength / pageSize;
	}
}
function getMaxPageSize(pageLength,pageSize){    //求为最大页数时pagesize
	if(pageLength == 0 || pageLength == undefined){return 0;}
	if (pageLength % pageSize != 0) {
		return pageLength % pageSize;
	}else {
		return pageSize;
	}
}

//清除文字滚动循环，在失焦时调用
function clearMarquee(){
	if(marquee.obj==undefined)return;
	if(marquee.handle!=undefined)clearInterval(marquee.handle);
	marquee.obj.style.position=marquee.oldPosition;
	marquee.obj.style.overflow=marquee.oldOverflow;
}
/**
 * conObj(contentObject):放置文字的组件对象
 * calObj(calculationObjcet):用于计算的组件对象，即文字过长的情况下，在该组件范围内进行滚动，该组件有显式定义的长宽
 * step：滚动步长，默认是文字宽度
 * delay：滚动频率
 * marqueeNum:文字长度上限(以半角字符为计数单位)，当文字长度超过这个范围，将进行滚动操作
 * content:文字内容，当conObj组件中存在该内容，该参数可以省略
 */
function marquee(conObj,calObj,step,delay,marqueeNum,content){//文字过长时候的滚动操作
	if(marquee.handle!=undefined)clearInterval(marquee.handle);
	var temp=(content!=undefined && typeof content=="string")? content:conObj.innerHTML;
	if(marqueeNum==undefined || getCharLength(temp)<marqueeNum){
		conObj.innerHTML=temp;
		return;
	}
	var x=0;
	marquee.obj=calObj;
	marquee.oldPosition=calObj.style.position;
	calObj.style.position="relative";
	marquee.oldOverflow=calObj.style.overflow;
	calObj.style.overflow="hidden";

	var w=calObj.offsetWidth;
	var h=calObj.offsetHeight;
	step=step? step:parseInt(getCurrentStyle(calObj,"fontSize").replace("px",""));
	var fragment=document.createDocumentFragment();
	for(var i=0,ilen=w;i<ilen;i+=step){
		var rSpan=document.createElement("span");
		rSpan.style.display="inline-block";
		rSpan.style.width=step+"px";
		fragment.appendChild(rSpan);
	}

	var lSpan=document.createElement("span");
	lSpan.style.display="inline-block";
		lSpan.innerHTML=temp;

	var mainSpan=document.createElement("div");
	mainSpan.style.position="absolute";
	mainSpan.style.height=h+"px";
	mainSpan.appendChild(lSpan);
	mainSpan.appendChild(fragment);
	mainSpan.style.left="0px";

	conObj.innerHTML="";
	conObj.appendChild(mainSpan);
	var finalW=mainSpan.offsetWidth;
	var oldW=finalW;
	marquee.handle=setInterval(function(){
		x-=step;
		mainSpan.style.left=x+"px";
		var newW=mainSpan.offsetWidth;
		if(newW<=oldW){
			conObj.innerHTML="<marquee scrollLeft='1' behavior='scroll' direction='left' scrollamount='"+step+"' scrolldelay='"+delay+"'>" + temp + "</marquee>";
			clearInterval(marquee.handle);
		}else{
			oldW+=step;
		}
	},delay);
}

function getCharLength(str){
	var temp1 = str.replace(/[^\x00-\xff]/g, "**");
    return temp1.split("\*").length - 1;
}

function getQueryStr(url, param) {
    var rs = new RegExp("(^|)" + param + "=([^\&]*)(\&|$)", "gi").exec(url), tmp;
    if( tmp = rs)
        return tmp[2];
    return "";
}

String.prototype.replaceAll = function(s1,s2) {
    return this.replace(new RegExp(s1,"gm"),s2);
}

String.prototype.replaceQueryStr = function(replaceVal, searchStr) {
    var restr = searchStr + "=" + replaceVal;
    var rs = new RegExp("(^|)" + searchStr + "=([^\&]*)(\&|$)", "gi").exec(this), tmp;
    var val = null;
    if( tmp = rs)
        val = tmp[2];
    if(val == null) {
        if(this.lastIndexOf("&") == this.length - 1)
            return this + restr;
        else if(this.lastIndexOf("?") >= 0)
            return this + "&" + restr;
        return this + "?" + restr;
    }
    var shs = searchStr + "=" + val;
    if(this.lastIndexOf("?" + shs) >= 0)
        return this.replace("?" + shs, "?" + restr);
    return this.replace("&" + shs, "&" + restr);
};


//随机截取影片中的10分钟进行播放
function getRandomPlayTime(totalTime) {
    var preplayTime = Math.floor(totalTime * 0.1);
    var vNum = Math.random();
    var startTime = Math.floor(vNum * (totalTime - preplayTime));
    var endTime = startTime + preplayTime;
    return [startTime, Math.min(endTime, totalTime), preplayTime];
}
function setPreplayRTSP(rtsp) {
    setGlobalVar("vod_play_totalTime", "");
    if (playTimelen != undefined) {
        var timearr = getRandomPlayTime(playTimelen);
        rtsp = rtsp.replaceQueryStr(timearr[0], "startTime").replaceQueryStr(timearr[1], "endTime");
        setGlobalVar("vod_play_totalTime", timearr[2]);
    }
    return rtsp;
}

function closeTip() {//关闭提示信息
	clearInterval(closeTimer);
	closeCount = 0;
	var tipDiv = $(tipDivId);
	var tipWindow = $(messInfoId);
	if(tipWindow) {
		tipDiv.style.visibility = "hidden";
		tipWindow.innerHTML = "";
		//$("message").innerHTML = "";
	}
	tipFlag = false;
	mediaTipFlag = false;
	searchTipFlag = false;
	delNpvrFlag = false;
	pwdFlag=false;
	enabledAll();
	if(lastObj) {
		lastObj.focus();
	}
}
/**
 * @description 焦点滑动实现函数
 * @param {String}
 *            _divId 滑动的焦点层ID
 * @param {Number}
 *            _preTop 滑动前的top值
 * @param {Number}
 *            _top 滑动后的top值
 * @param {String}
 *            _moveDir 滑动方向，V纵向，H横向
 * @param {Number}
 * 			  _percent 滑动系数  默认0.7
 * @return null
 */
function slide(_divId, _preTop, _top, _moveDir, _percent) {
    if( typeof (_divId) != 'undefined' && typeof (_preTop) != 'undefined' && typeof (_top) != 'undefined' && typeof (_moveDir) != 'undefined') {
        this.focusId = _divId;
        this.preTop = _preTop;
        this.focusTop = _top;
        this.moveDir = _moveDir;
    }
    var moveStep = (this.focusTop - this.preTop) * _percent;
    if(Math.abs(moveStep) > 3) {
        this.preTop += moveStep;
        if(this.moveDir == "V") {
            $(this.focusId).style.top = this.preTop + "px";
        } else {
            $(this.focusId).style.left = this.preTop + "px";
        }
        clearTimeout(this.slideTimer);
        this.slideTimer = setTimeout(slide, 1);
    } else {
        if(moveDir == "V") {
            $(this.focusId).style.top = this.focusTop + "px";
        } else {
            $(this.focusId).style.left = this.focusTop + "px";
        }
    }
}

function ajaxUrl(_url, _handler, _data){
    this.xmlHttp = null;
    this.createXMLHttpRequest = function () {
        if(window.XMLHttpRequest) {
            this.xmlHttp = new XMLHttpRequest();
            if (this.xmlHttp.overrideMimeType) {
                this.xmlHttp.overrideMimeType('text/xml');
            }
        } else {
            if(window.ActiveXObject) {
                this.xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
    };
    this.getData = function () {
        this.createXMLHttpRequest();
        var xmlHttp = this.xmlHttp;
//		_url = "http://" + portalIP + ":" + portalPort + _url;
        this.xmlHttp.open("POST", _url, true);
        this.xmlHttp.send(_data);
        this.xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4) {
                if(xmlHttp.status == 200) {
                    callBackData3(xmlHttp, _handler);
                } else {//超时间方法,传入空会自动弹出服务器忙的提示
                    showMsg("", "系统忙,请稍候重试。");
                }
            }
        };
    };
    this.getData();
}


/**
 * @description callBackData 对ajax返回的数据进行统一的处理
 * @param {object} xmlHttp 为ajax返回xmlHttp对象
 * @param {function} _handler 当请求的数据成功返回时，为页面的回调函数
 */

function callBackData3(_xmlHttp, _handler){
    var resText = _xmlHttp.responseText;
    resText = eval("(" + resText + ")");
    _handler(resText);
}


IEPG.getData = function(_APIUrl, _configs){
    var paramUrl, dataUrl;
    var _data = xmlHead + _configs.data;
    var reqUrl = _APIUrl + "?dataType=json";
    new ajaxUrl(reqUrl, _configs.callBack, _data);
};


//json字符串、对象中的转换

var JSON;if(!JSON){JSON={};}
(function(){'use strict';function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());
