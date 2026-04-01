/**
 * 百度地图驾车路线规划 API 调用模块
 * 基于官方文档示例实现
 * 文档地址：https://lbsyun.baidu.com/docs/webapi?title=directionv2/webservice-direction/dirve
 */

const BaiduRouteAPI = {
    /**
     * API 基础地址
     */
    host: 'https://api.map.baidu.com',
    
    /**
     * 接口地址
     */
    uri: '/direction/v2/driving',
    
    /**
     * 百度地图 AK
     */
    ak: 'S419BrfiTWEi88HtzgzMVtf8D4nR6ZR3',
    
    /**
     * 计算两点之间的距离（Haversine 公式）
     * @param {number} lat1 - 起点纬度
     * @param {number} lng1 - 起点经度
     * @param {number} lat2 - 终点纬度
     * @param {number} lng2 - 终点经度
     * @returns {number} 距离（米）
     */
    calculateDistance: function(lat1, lng1, lat2, lng2) {
        const R = 6371000; // 地球半径（米）
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },
    
    /**
     * 调用驾车路线规划 API（使用 Fetch API）
     * @param {string} origin - 起点坐标（格式：纬度，经度）
     * @param {string} destination - 终点坐标（格式：纬度，经度）
     * @param {Array} waypoints - 途经点数组（可选，格式：["纬度，经度", "纬度，经度"]）
     * @returns {Promise} 返回路线规划结果
     */
    planRoute: async function(origin, destination, waypoints = []) {
        const url = this.host + this.uri;
        
        const params = new URLSearchParams({
            origin: origin,
            destination: destination,
            ak: this.ak,
            coordination: 'wgs84' // 使用 WGS84 坐标
        });
        
        // 添加途经点
        if (waypoints && waypoints.length > 0) {
            params.append('waypoints', waypoints.join('|'));
        }
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const data = await response.json();
            
            console.log('API 返回结果:', data);
            
            if (data.status === 0) {
                console.log('路线规划成功');
                console.log('总距离:', data.result.routes[0].distance, '米');
                console.log('总时间:', data.result.routes[0].duration, '秒');
                console.log('步骤数量:', data.result.routes[0].steps.length);
                return {
                    success: true,
                    data: data
                };
            } else {
                console.error('路线规划失败:', data.message);
                return {
                    success: false,
                    message: data.message,
                    status: data.status
                };
            }
        } catch (error) {
            console.error('API 调用失败:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    /**
     * 优化路线顺序（基于最近邻算法）
     * @param {Array} spots - 景点数组（包含 location.lat 和 location.lng）
     * @returns {Array} 优化后的景点顺序
     */
    optimizeRoute: function(spots) {
        if (!spots || spots.length < 2) {
            return spots;
        }
        
        // 如果只有 2 个点，直接返回
        if (spots.length === 2) {
            return spots;
        }
        
        console.log('开始路线优化，景点数量:', spots.length);
        
        const optimized = [spots[0]]; // 起点
        const remaining = spots.slice(1); // 剩余的点
        
        while (remaining.length > 0) {
            const lastPoint = optimized[optimized.length - 1];
            let nearestIndex = 0;
            let nearestDistance = Infinity;
            
            // 找到最近的点
            for (let i = 0; i < remaining.length; i++) {
                const distance = this.calculateDistance(
                    lastPoint.location.lat,
                    lastPoint.location.lng,
                    remaining[i].location.lat,
                    remaining[i].location.lng
                );
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }
            
            // 添加最近的点到优化路线
            optimized.push(remaining[nearestIndex]);
            remaining.splice(nearestIndex, 1);
        }
        
        console.log('优化后的景点顺序:', optimized.map(s => s.name));
        return optimized;
    },
    
    /**
     * 提取路线中的关键信息
     * @param {Object} routeData - API 返回的路线数据
     * @returns {Object} 提取的关键信息
     */
    extractRouteInfo: function(routeData) {
        if (!routeData || !routeData.result || !routeData.result.routes) {
            return null;
        }
        
        const route = routeData.result.routes[0];
        
        return {
            distance: route.distance, // 总距离（米）
            duration: route.duration, // 总时间（秒）
            taxiFee: route.taxi_fee, // 出租车费用
            trafficLightCount: route.traffic_light, // 红绿灯数量
            stepsCount: route.steps.length, // 步骤数量
            steps: route.steps.map(step => ({
                roadName: step.road_name, // 道路名称
                distance: step.distance, // 步骤距离（米）
                duration: step.duration, // 步骤时间（秒）
                direction: step.direction, // 方向
                roadType: step.road_type, // 道路类型
                startLocation: step.start_location, // 起点坐标
                endLocation: step.end_location // 终点坐标
            }))
        };
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaiduRouteAPI;
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
    window.BaiduRouteAPI = BaiduRouteAPI;
}
