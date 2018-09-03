
//聚合点  加载

<!-- 地图引入 -->
// <script type="text/javascript" src="http://webapi.amap.com/maps?v=1.4.8&key=ad21475f9a888602927cccd3b87c1d21&plugin=AMap.Geocoder"></script>
//     <!-- 地图聚合点引入 -->
//     <script src="https://webapi.amap.com/maps?v=1.4.9&key=ad21475f9a888602927cccd3b87c1d21&plugin=AMap.MarkerClusterer"></script>
//     <script src="${ctx}/resources/js/map/mapGaodeCommon.js" type="text/javascript"></script>
//     <script src="${ctx}/resources/js/map/map.js" type="text/javascript"></script>
/**
 * 根据点类型获取点显示
 * 
 * @param isClearMap true-清除覆盖物,false-不清除
 */
function loadCustomer(isClearMap) {
	if(isClearMap){
		map.clearMap();
	}
	$.ajax({
		type : "POST",
		url :  SYS_CTX + "/query/point",
		dataType : "json",
		data : {
			type:6
		},
		success : function(data) {
			var customerPoint = data.customerPoint;
			var markers = [];			
			for(var i=0;i<customerPoint.length;i+=1){
				var point = customerPoint[i];
				if(i>99999)break;
				var marker = new AMap.Marker({
		        	position:new AMap.LngLat(point.longitude,point.dimension),
		        	content: '<div style="background-color: hsla(180, 100%, 50%, 0.7); height: 24px; width: 24px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;">'+point.foreignId+'</div>',
		            offset: new AMap.Pixel(-15,-15),
					extData:point.foreignId
		        })
				AMap.event.addListener(marker,'click',markerClick);
		        marker.emit('click', {target: marker});
		        
		        markers.push(marker);
		    }
			map.createCluster(markers);
		}
	});
}

function markerClick(e){
	$.ajax({
		type : "POST",
		url :  "query/customerUuid",
		dataType : "json",
		data: {uuid:"bbeec046-09e3-4cc0-8f67-00355241ef09"},
		success : function(data) {
			var customer =data.customer;
			// 加载老人开始
			var htmls = "<li > <span class='txt1'>姓名 ：&nbsp;&nbsp;"+customer.name+"</span></li>"
						+"<li > <span class='txt1'>性别 ：&nbsp;&nbsp;" + customer.gender +"</span></li>"
						+"<li > <span class='txt1'>地址 ：&nbsp;&nbsp;" + customer.address+""+customer.committe+""+customer.address1 +"</span></li>"
						+"<li > <span class='txt1'>联系方式 ：&nbsp;&nbsp;" + customer.telphone +"</span></li>";
			var obj = {
					contentArray:[{"title":customer.name,"content":htmls}]
				};
			var infoWindow = map.createInfoWindow(obj);
			
				infoWindow.open(mapObj,  e.target.getPosition());
			
		}
	})
}