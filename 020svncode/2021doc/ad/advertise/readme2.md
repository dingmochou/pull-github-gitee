从一级页面进入二级页面
	跳转前，将roleId、version、areaCode、resourceId等参数拼接到跳转链接中
	跳转后：
	1、初始化播放器
	2、清除所有二级页面标识性变量缓存
	3、设置刷新时间
	4、从跳转链接中获取roleId、version、areaCode、resourceId等参数
	5、初始化心跳上报机制
	6、请求RoleTab接口，获取栏目数据（tabData）
		链接样例：http://10.9.216.14:8080/iepg/getRoleTab?roleId=1&version=32000&areaCode=0000&resourceId=10006
	7、获取homeTab、updateTab的值
	8、绘制栏目div（TabView）
	9、请求getTabCell接口，获取cell数据（cellData）
	10、绘制海报布局（ScrollHView）
	11、请求跑马灯、背景数据
	12、更新跑马灯、背景显示效果

从其他页面进入二级页面
	1、初始化播放器
	2、设置刷新时间
	3、从全局变量中获取所有缓存
	4、判断是否需要更新界面
		是：请求RoleTab接口，获取栏目数据（tabData）
				链接样例：http://10.9.216.14:8080/iepg/getRoleTab?roleId=1&version=32000&areaCode=0000&resourceId=10006
		否：从全局变量中获取栏目数据（tabData）
	5、获取homeTab、updateTab的值
	6、绘制栏目div（TabView）
	8、判断是否需要更新页面：
		是：请求getTabCell接口，获取cell数据（cellData）
			请求跑马灯、背景数据
		否：从内存中获取cell数据（cellData）
			从内存中获取跑马灯、背景、logo数据
	10、绘制海报布局（ScrollHView）
	12、更新跑马灯、背景显示效果
	
其他：
	1、二级页面按菜单键，执行刷新二级页面操作
	2、二级页面按后退键、退出键，执行返回一级页面操作
	3、需遵循从哪里进退回到哪里的原则。
		具体：3.1、从二级页面退回到一级页面时，一级页面需显示进入二级页面前的内容
			3.2、从二级页面进入其他页面，按返回键\退出键需退回到二级页面，显示进入前的内容
			3.3、从一级页面进入其他页面，按返回键\退出键需退回到一级页面，显示进入前的内容
	4、在其他页面按菜单键，返回一级页面，显示bootTab标识页内容  ##