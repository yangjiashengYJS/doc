// JavaScript Document
//属性说明：
//level 	String	要查询的关键字对应的行政级别或商圈，可选值：country、province、city、district、biz_area=>国家、省、市、区,商圈
//subdistrict	Bool	期望返回多少级下级行政区信息，可选 0：不返回下,级行政区1：返回下一级行政区,2：返回下两级行政区,3：返回下三级行政区,默认值：1
/**
 * 地图类
 * 
 */
function mapForGaoDe() {
	var _this = this;
	this.mapObj;
	
	var markers = new Array();
	var markerTexts = new Array();
	
	this.getMarkers = function(){
		return markers;
	};
	
	this.getMarkerTexts = function(){
		return markerTexts;
	};
	
	/**
	 * 初始化地图
	 * 
	 * @param divId 地图所在的DIV
	 * @param zoom 大小
	 * @param level 级别
	 */
	this.init = function(divId, zoom, level) {
		markers = [];
		markerTexts = [];
		if (zoom == null) {
			zoom = 12;
		}
		if (level == null) {
			level = "country";
		}
		mapObj = new AMap.Map(divId, {
			zoom : zoom,
			resizeEnable : true,
			mapStyle: 'amap://styles/blue', //设置地图的显示样式
		});

		// 在对象初始化的时候设定
		AMap.service('AMap.DistrictSearch', function(){
			//回调函数

	         var opts = {
	            subdistrict: 1,   //返回下一级行政区
	            level: level,//查询的范围
	            showbiz:false  //查询行政级别为 市
	        };
	        //实例化DistrictSearch
	        districtSearch = new AMap.DistrictSearch(opts);
	        //TODO: 使用districtSearch对象调用行政区查询的功能
	        districtSearch.search('all',function(status, result){
	            //TODO : 按照自己需求处理查询结果
	            //console.log(result);
	        })
		});

	};
	/**
	 * 清除地图覆盖物
	 */
	this.clearMap = function() {
		mapObj.clearMap();
	};
	/**
	 * 设置中心点
	 * 
	 * @param lnglat 中心点对象[]
	 */
	this.setMapCenter = function(lnglat) {
		mapObj.setCenter(lnglat);
	};
	
	/**
	 * 设置图标顶层
	 */
	this.setMapTop = function(marker){
		marker.setTop(true)
	};
	
	/**
	 * 设置label
	 * @param label 显示的文本
	 * @param x 左上角偏移 
	 * @param y 左上角偏移
	 */
	this.setLabel = function(marker,extData,x,y){
		var labelContent = "";
		if (extData != null) {
			var contentArray = extData.contentArray;
			for ( var i = 0; i < contentArray.length; i++) {
				if (i > 0) {
					labelContent += "<br/>";
				}
				labelContent += contentArray[i].title;
			}
		}
		marker.setLabel({// label默认蓝框白底左上角显示，样式className为：amap-marker-label
			offset : new AMap.Pixel(x, y),// 修改label相对于maker的位置
			content : labelContent
		});
	};

	/**
	 * 创建点
	 * 
	 * @param key 经纬度,中间用逗号分隔
	 * @param extData
	 *            自定义属性,存数组[弹出信息窗体需要的属性]{id:1,name:"33"},获取时.getExtData()["id"]
	 */
	this.addMarker = function(key, icon, extData, callBack) {
		if (icon == null) {
			// 默认图标
			icon = SYS_CTX + '/resources/image/icon_gcoding.png';
		}
		icon = new AMap.Icon({
			image : icon,
			size : new AMap.Size(24, 24), // 图标大小
			imageSize : new AMap.Size(24, 24)
		});
		
		var marker = new AMap.Marker({
			position : key.split(","),
			map : mapObj,
			icon : icon,
			/*label:{
				content:labelContent,
		        offset:new AMap.Pixel(20,0)
		    },*/
			extData:extData
		});		
		markers.push(marker);
		if (callBack != null) {
			callBack(marker);
		} else {
			if(extData != null) {
				this.bindMarkerClick(marker, extData);
			}
			
		}
	};
	
	/**
	 * 根据地址创建点
	 * 
	 * @param cityCode 城市,
	 * @param address 地址
	 * @param icon 图标
	 * @param title 标题
	 * @param content 展示内容
	 */
	this.addMarkerForAddress = function(cityCode, address, icon, extData,callBack) {
		
        var geocoder = new AMap.Geocoder({
            city: cityCode, //城市，默认：“全国”
            radius: 1000, //范围，默认：500
            batch:false
        });
        //地理编码,返回地理编码结果
        geocoder.getLocation(address, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
            	 var geocode = result.geocodes;
                 for (var i = 0; i < geocode.length; i++) {
                     _this.addMarker(geocode[i].location + "", icon, extData,callBack);
                 }
            }
        });
	};
	
	

	/**
	 * 绑定点击事件
	 * 
	 * @param marker 层
	 * @param extData 弹出窗体需要显示的属性contentArray中存数组,每个对象中存title,content属性。
	 */
	this.bindMarkerClick = function(marker, extData) {	
		
		var infoWindow = this.createInfoWindow(extData);
		// 鼠标点击marker弹出自定义的信息窗体
		AMap.event.addListener(marker, 'click', function() {
			infoWindow.open(mapObj, marker.getPosition());
		});
		
	};	

	/**
	 * 创建自定义信息窗口
	 * 
	 * @param contentArray 数组[title,content]
	 */
	this.createInfoWindow = function(extData) {
		var contentArray = extData.contentArray;
		var infoWindow = new AMap.InfoWindow({
			isCustom : true, // 使用自定义窗体
			content : this.createInfoContent(contentArray),
			offset : new AMap.Pixel(16, -45),
			closeWhenClickMap:true
		});
		return infoWindow;
	};

	/**
	 * 创建点对应的文字
	 * 
	 * @param key 经纬度,中间用逗号分隔
	 */
	this.addMarkerText = function(key, extData) {
		var array = extData.contentArray;
		var textHtml = ""
		for(var i = 0 ; i < array.length; i++)
		{
			if(i > 0 )
			{
				textHtml += "<br/>";
			}
			textHtml += array[i].title;
		}
		var markerText = new AMap.Marker({
			position : key.split(","),
			map : mapObj,
			offset : new AMap.Pixel(-5, 5),
			content : textHtml,
			zIndex : 100
		});
		markerTexts.push(markerText);
	};

	/**
	 * 创建自定义信息窗口标题列,主要显示关闭按钮
	 * 
	 * @param title 标题
	 * @param content 自定义显示内容
	 */
	this.createInfoContent = function(contentArray) {		
		
		var info = document.createElement("div");
		info.className = "map-info";

		var index = "";
		// 可以通过下面的方式修改自定义窗体的宽高
		// info.style.width = "400px";
		for(var i = 0 ; i < contentArray.length ; i ++)
		{
			// 定义顶部标题
			var top = document.createElement("div");
			var titleD = document.createElement("div");
			
			
			if(contentArray.length > 1)
			{
				index = (i + 1) + ".";
			}
			
			top.className = "map-info-top";
			top.style.backgroundColor = 'white';
			titleD.innerHTML = index + contentArray[i].title;
			if (i == 0) {
				var closeX = document.createElement("img");
				closeX.src = "http://webapi.amap.com/images/close2.gif";
				closeX.onclick = this.closeInfoWindow;
				top.appendChild(closeX);
			}
			
			top.appendChild(titleD);
			
			info.appendChild(top);

			// 定义中部内容
			var middle = document.createElement("div");
			middle.className = "map-info-middle";
			middle.style.backgroundColor = 'white';
			middle.innerHTML = contentArray[i].content;
			info.appendChild(middle);
			if(contentArray.length > 1 && i < contentArray.length)
			{
				var subButtom = document.createElement("div");
				subButtom.style.border = '1px soild #cccccc';
				info.appendChild(subButtom);
			}
		}
		// 定义底部内容
//		var buttom = document.createElement("div");
//		buttom.className = "map-info-bottom";
//		// bottom.style.position = 'relative';
//		buttom.style.top = '0px';
//		buttom.style.margin = '0 auto';
//		var sharp = document.createElement("img");
//		sharp.src = "http://webapi.amap.com/images/sharp.png";
//		buttom.appendChild(sharp);
//		info.appendChild(buttom);
		return info;
	};

	// 关闭信息窗体
	this.closeInfoWindow = function() {
		mapObj.clearInfoWindow();
	};

	

	/**
	 * 创建多个点
	 * 
	 * @param objArr 数据,数据中有地址
	 * @param pointIcon 点图像
	 */
	this.addMassMarkersForAddress = function(objArr, pointIcon) {
		var markerMap = new Map(); 
		// 空Map m.set('Adam', 67); 		// 添加新的key-value m.set('Bob', 59); 
		//m.has('Adam'); 		// 是否存在key 'Adam': true m.get('Adam'); 
		// 67 m.delete('Adam'); 
		// 删除key 'Adam' m.get('Adam'); // undefined
		
		var index = 0;
		// 地址转成经纬度
		for ( var i = 0; i < objArr.length; i++) {
			var obj = objArr[i];
//			var icon = obj.icon;
			
			$.ajax({
				type : "POST",
				url : "http://restapi.amap.com/v3/geocode/geo",
				dataType : "json",
				async : false,
				data : {
					"key" : "4150dc564688805135ffaf58871fed90",
					"address" : obj.address,
					"city" : "上海市"
				},
				success : function(data) {
					if (data.status == 1) {
						var location = data.geocodes[0].location;
						var objArrs = new Array();
						if(location in markerMap) 
						{
							objArrs = markerMap[location];
						}
						objArrs.push(obj);
						
						markerMap[location] = objArrs;
					} else {
						alert("请求失败!" + data.info);
					}
				}

			});
			
			
		}

		for(var k in markerMap)
		{
			var contentArray = new Array();
			var objArrs = markerMap[k];
			
			var callBack;
			var typeCode = "";
			var icon = "";
			for(var i = 0 ; i < objArrs.length; i ++)
			{
				var obj = objArrs[i];
				if(i == 0)
				{
					icon = obj.icon;
					callBack = obj.objFn;
				}
				var tempObj = obj.objData;
				tempObj["title"] = obj.title;
				tempObj["content"] = obj.content;
				tempObj["typeCode"] = obj.typeCode;
				contentArray.push(tempObj);
//				
//				
//				obj.extData.contentArray = contentArray;
//				if(i == objs.length - 1)
//				{
//					extData = 
//				}
			}
			
			//额外属性
			var extData = {
				contentArray:contentArray	
			}
			_this.addMarker(k, icon, extData,callBack);
//			_this.addMarkerText(k, extData);
			
		}
	};
	
	
	/**
     * 划线，
     * @param lineType ： 实线:solid，虚线:dashed ，默认solid
     * @param path: 折线的节点坐标数组 
     */
    this.drawLine = function(lineType,pathArr)
    {
        if(lineType == null)
        {
            lineType = "solid";
        }
        var line = new AMap.Polyline({
            path:pathArr,
            strokeStyle:lineType,
            strokeColor: "#FF0000", //线颜色
            
        });
        line.setMap(mapObj);
    };
    
    /**
     * 画多边形
     * @param polygonArr 边界点数组
     * @param strokeColor 边界颜色
     * @param fillColor 填充色
     * @param lineType 实线:solid，虚线:dashed ，默认solid
     */
    this.drawPolygon = function(polygonArr,strokeColor,fillColor,lineType)
    {
        var  polygon = new AMap.Polygon({
            path: polygonArr,//设置多边形边界路径
            strokeColor: strokeColor, //线颜色
            strokeOpacity: 0.2, //线透明度
            strokeWeight: 3,    //线宽
            fillColor: fillColor, //填充色
            fillOpacity: 0.2,//填充透明度
            strokeStyle:lineType //虚线
            
        });
        polygon.setMap(mapObj);
    };
    
    
    this.createCluster = function(markers){
    	//利用styles属性修改点聚合的图标样式
		var styles = [{
		    url:SYS_CTX+'/resources/image/site_bg.png',
		    size:new AMap.Size(32,32),
		    offset:new AMap.Pixel(-16,-30)
		},
		{
		    url:SYS_CTX+'/resources/image/site.png',
		    size:new AMap.Size(32,32),
		    offset:new AMap.Pixel(-16,-30)
		},
		{
		    url:SYS_CTX+'/resources/image/site.png',
		    size:new AMap.Size(48,48),
		    offset:new AMap.Pixel(-24,-45), 
		    textColor:'#CC0066'
		}];
		//添加聚合组件
//		map.plugin(["AMap.MarkerClusterer"],function() {
		    var cluster = new AMap.MarkerClusterer(
		    		mapObj,     // 地图实例
		    		markers,    // 海量点组成的数组
		    		{
		    			styles: styles
		    		});
//		});
//		    alert(markers.length);
    }

}