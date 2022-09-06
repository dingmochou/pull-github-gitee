var Tabdata;//标签数据
	var rollTabData;//getRoleTab接口返回的数据
    var CellArr = [];
    var Area = 0;
    var Tab;
    var ScrollH;
    var tabIndex = 0;
    var homeTab = 0;
    var updateTab = 0;
    var isBack="n";
    var lastUpdateTime;
    var updateInterval = 7200000;//更新布局时间间隔；
    var isNeedUpdate = false;
	//var weatherArray = null;
    var wIndex = 0;
	var smartCardId = null;
	var trueCardId = null;//未经处理的智能卡号
    
    var planId;//布局ID
	var confirmUrl="";//焦点移动到资源块上的链接url
	try{
		var user =users.currentUser;
	}catch(e){
		
	}
    //区分是开机进入首页还是刷新进入首页，逻辑：开机后isMenu=0,加载布局后isMenu=1存入缓存，且只有重启才清楚该标志
    var isMenu =  parseInt(getGlobalVar('isMenu') || 0);

//	var keyUpTime =0;
	var resultCode = -1;//-1表示向aaa查询用户信息失败
	var caName = null;

    var confKey = 1;//后门按键

	var userCode = null;
    var stbNo = null;
    var mac = null;
    try{
        userCode = CITV.loginInfo.getValue("userId");
        stbNo = hardware.STB.serialNumber;
        mac = network.macAddress;
    }catch(e){

    }
	
	var isAutoGoPlay = true;  //开机后用户在N秒后没做任何操作，则自动打开直播页面
	var waitTime = 0;
	
	var iepgAddr = '';
	var canPreview = "0";//不支持预发布布局预览
	
	var liveArr = [];//直播窗口对象数组     


   	var weatherCityCode = "0000";

    var frequency;
    var rawFrequency;
    var serviceId;


    var mp;
    var portalVolume = 10;

    function initPage(planType){
        //document.getElementById('test').innerHTML = "这是单引擎";
        setTime(planType);
        heartBeat();
        getCardId();
		if(isMenu === 1){//判断是否通过菜单键刷新重新进入首页
			cleanFocusCache();
		}
		getSavaData();
        iepgAddr = getQueryString("iepgAddr") || getGlobalVar('iepgAddr');//判断是否从后门配置参数获取的布局
        if(iepgAddr !==null && iepgAddr !=='undefined' && iepgAddr !=='' && iepgAddr !=='null'){
            getConfigure();
            if(isBack === "y"){
                var tabData = getGlobalVar("tabData");
                initTab(tabData,planType);
                
                //initWeatherInfo();
            }else{
                //initWeatherInfo();
                getData(planType);
            }
            setGlobalVar('isMenu',1);
        }else{
            if (isBack === "y") {
                if (NeedUpdate()) {
                    load(false,planType);
                } else {
                    showLayout(false,planType);
                    var tabData = getGlobalVar("tabData");
                    initTab(tabData,planType);
                }
            } else {
                load(true,planType);
            }
            setGlobalVar('isMenu', 1);
        }

    }
	
    function load(firstGoPlay,planType){
        ajax({
            type:"GET",
            url: iepgIP+'getPram?PramName='+tableName+'&version=V001',
            async:true,
            success: function (data)  {
                cityData = eval('(' + data + ')').datas;
                queryTownUserInfo(function() {
                    //getHotPlay();
                    showLayout(true,planType);
                    if(firstGoPlay){
                        try{
                            waitTime = parseInt(iPanel.eventFrame.firstToPlayAuto);
                        }catch(e){
                            waitTime = 15;
                        }
                        if(waitTime > 0){
                            setTimeout("firstGoPlayAuto()",waitTime*1000);
                        }
                    }
                    
                });
            },
            error: function () {
            }
        });
    }

    function getCardId(){
        return getSmartCardId();
    }

    function getConfigure(){
        iepgIP = getQueryString("iepgAddr") || getGlobalVar('iepgAddr');
        areaCode = getQueryString("areaCode") || getGlobalVar('areaCode');
        version = getQueryString("version") || getGlobalVar('version');
		canPreview = getQueryString("canPreview") || getGlobalVar('canPreview');
    }

    

    

    function NeedUpdate(){
        var now = new Date().getTime();
        if(now - lastUpdateTime > updateInterval){
            isNeedUpdate = true;
        }
        return isNeedUpdate;
    }

    function getData(planType){
        ajax({
            type: "GET",
            url: iepgIP+'getRoleTab?roleId=&productType=DVB&areaCode='+areaCode+'&appType='+planType+'&smartCardId='+trueCardId+'&isTest='+canPreview+'&uc='+getUC(),
            error: function () {

            },
            success: function (data) {
                var startUpDateTime = new Date().getTime();
                setGlobalVar("lastUpdateTime",startUpDateTime);
                setGlobalVar("tabData",data);
                initTab(data,planType);
                initKeyboardConf(data);
            }
        });
    }

    function queryTownUserInfo(callback){
        //TODO 调用 BO 接口，获取用户分组/区域码
        //trueCardId = "8280204130199880";
        var URL = userInfoInterface.NavCheck;
        //拼接webService接口请求报文
        var data = '<?xml version="1.0" encoding="UTF-8"?> <NavCheck deviceId="'+trueCardId+'" client="'+trueCardId+'"/>';
        
        ajax({
            type:"POST",
            url: URL,
            async:true,
            parseData:false,
            processData:false,
            contentType:"application/soap+xml;charset=utf-8",
            data:data,
            success: function (data)  {
                try{
                    data = eval('(' + data + ')');
                    var infoList = data.parameterInfoList;
                    for (var i = infoList.length - 1; i >= 0; i--) {
                        if(infoList[i].key == "GROUP_CODE"){
                            districtCode = infoList[i].value;
                        }
                    }
                    setArea();
                    callback();
                }catch(e){
                    callback();
                }
                
            },
            error: function () {
                callback();
            }
        }); 
    }

    function initTab(data,planType) {
        var jsonData = JSON.parse(data);
		rollTabData = jsonData;
//        $('bg').style.background = 'url(' + jsonData.roleList[0].tabList[0].tabBgUrl + ')';
        planId = jsonData.planId;
        Tabdata = jsonData.roleList[0].tabList;
		/*if(areaCode === "1002"){
			$("xt").innerHTML = "test:"+districtCode+","+areaCode+","+version+","+resultCode+","+trueCardId+","+Tabdata.length;
		} */
        if (jsonData.options != null && jsonData.options.carouselInterval != null) {
            timeInterval = parseInt(jsonData.options.carouselInterval);
        }

           
        Tab = new TabView(Tabdata, tabIndex);

        Tab.init('RoleTab', 'TabCell');

        if (isBack != "y") {
            if (isMenu == 1) {
                tabIndex = updateTab;
            }else{
                tabIndex = homeTab;
            }
        }
        
        Tab.focusPos = tabIndex;

        tabAdapt(Tabdata.length);
        Tab.onfocus();
        //初始化
        if(isBack === "y"){
            if(isNeedUpdate){
                initCellData(tabIndex);
				initMarqueeData(planType);
            }else{
				backContent();
				initCell(CellArr[tabIndex].data, tabIndex);
				var marqueeData = getGlobalVar("marqueeData");
                initMarquee(JSON.parse(marqueeData).marqueeList);
            }
        }else{
            initCellData(tabIndex);
			initMarqueeData(planType);
        }
		
		//checkLivePlay(tabIndex);
		
        Tab.tabFub = function (index) {
            stopLivePlay();
		//	$("xt").innerHTML = "rollTabId:"+rollTabId+",rollArr:"+rollArr.length;
            tabIndex = index;
            //console.log(Tabdata[index].tabId)
            if (CellArr[index] && !isNeedUpdate){
                ScrollH = CellArr[index];
                checkCarouse(null);
				if(ScrollH.isShow === 0){
					CellArr[index].init(index);
					CellArr[index].isShow = 1;
				}else{
					checkLivePlay(tabIndex);
				}
			//	lock = true;
            } else {
                initCellData(index);

            }
        }
        Tab.downFun = function () {
            if (CellArr[tabIndex]){
                Area++;
                Tab.onblur(true);
				ScrollH.focusId = ScrollH.firstFocusId;
				if($(ScrollH.focusId+"").style.display === "none"){//如果下一个资源块为隐藏状态，则默认将焦点移到滑动资源块数组第0个上
					ScrollH.focusId = rollArr[0].cellId;
				}
				confirmUrl = ScrollH._data[ScrollH.focusId].intent;				
				ScrollH && ScrollH.onfocus();
            }
            var cellObj = {};
            cellObj.cellId = CellArr[tabIndex].focusId
            cellCheckCarouse(null,cellObj);
        }
        Tab.upFun = function () {
        	if(focusLogoArr){
        		Area--;
        		Tab.onblur(true);

        	}
        }
        
    }

    //从栏目页返回到首页后初始化CellArr
	function backContent(){
	//	console.log(CellArr);
        for(var i = 0;i<CellArr.length;i++){
			if(CellArr[i] !== null){
				var mFocusId = CellArr[i].focusId;
				CellArr[i] = new ScrollHView(CellArr[i].data,i);
				CellArr[i].focusId = mFocusId;
				CellArr[i].isShow = 0; 
			//	CellArr[i].init(i);
				CellArr[i].upFun = function (){
					Area--;
					Tab.onfocus();
				}
			}
        }
	//	console.log(CellArr);
    }

	//设置日期
	function setTime(planType) {
		if (planType=="welcome") {return;}
		var nowDate = new Date();
		var year = nowDate.getFullYear();
		var month = nowDate.getMonth()+1;
		var monthDay = nowDate.getDate();
		var weekDay = nowDate.getDay();
		var hours = nowDate.getHours().toString();
		var min = nowDate.getMinutes().toString();
		if (month/10 < 1) {
			month = "0" + month;
		}
		if (monthDay/10 < 1) {
			monthDay = "0" + monthDay;
		}
		if(weekDay == 0)
			weekDay=" 星期日 ";
		else if(weekDay == 1)
			weekDay=" 星期一 ";
		else if(weekDay == 2)
			weekDay=" 星期二 ";
		else if(weekDay == 3)
			weekDay=" 星期三 ";
		else if(weekDay == 4)
			weekDay=" 星期四 ";
		else if(weekDay == 5)
			weekDay=" 星期五 ";
		else if(weekDay == 6)
			weekDay=" 星期六 ";
		if(hours.length < 2){
			hours = "0"+hours;
		}
		if(min.length < 2){
			min = "0"+min;
		}
		var timeStr = hours+":"+min
        var dateStr = year+"/"+month+"/"+monthDay;
        var weekStr =  weekDay;
		$("timeSpan").innerHTML = timeStr;
        $("dateSpan").innerHTML = dateStr;
        $("weekSpan").innerHTML = weekStr;
		
		setTimeout("setTime();",1000);
	}

    function setArea(){
        localArea = getArea(weatherCityCode);
	    var realArea = getArea(districtCode);
        areaCode =  realArea.pramValue.split(",")[0];
        version = realArea.pramValue.split(",")[1];
    }
	
	function saveDistrictCode(){
		try{
			Utility.setEnv("districtCode",districtCode);
			iPanel.misc.setGlobal("districtCode",districtCode);
			iPanel.misc.save();
		}catch(e){
            
        }
		if(smartCardId !==null && smartCardId !=='undefined' && smartCardId !=='' && smartCardId.length > 2 ){
			ajax({
				type: "GET",
				url: iepgIP + "addSmartCardDistrictRel?appType=0&smartCardId=" + trueCardId + "&districtCode=" + districtCode + "&statusCode=" + resultCode + "&factoryName=" + caName,
				success: function (data) {
				},
				error: function () {

				}
			});
        }
	}

	var isKeyUp = true;	

    



    function getUserId() {
        var userId;
        try {
            userId = Utility.getSystemInfo("UID");
            if(Utility.getSystemInfo("UID")==""){
                userId = CITV.loginInfo.userId;
            }
        } catch (e) {
            userId=0;
        }
        return userId;
    }
    //function getUserId() {  return "guizhou";  }
    function getSmartCardId(){
        var sId;
        try {
            sId = SysInfo.STBSerialNumber;
        } catch (e) {
            sId = "8280202265213138";
        }
        if (sId.indexOf("152")==0) {
            sId =sId.slice(0,17)
        }
        smartCardId = sId;
        trueCardId = sId;
        return sId;
    }
