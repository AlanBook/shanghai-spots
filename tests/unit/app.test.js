const App = require('../js/app');

describe('App', () => {
    describe('loadScenicSpots', () => {
        test('应该成功加载景点数据', async () => {
            const mockSpots = [
                {
                    id: 's1',
                    name: '外滩',
                    city: 'Shanghai',
                    tags: ['地标', '城市景观'],
                    rating: 4.8,
                    price: 0,
                    open_time: '全天',
                    description: '测试景点',
                    image: 'img/s1_waitan.jpg'
                }
            ];

            const result = App.renderScenicSpots(mockSpots);
            
            expect(result).toContain('外滩');
            expect(result).toContain('上海');
            expect(result).toContain('免费');
            expect(result).toContain('4.8');
        });

        test('应该处理空数据', () => {
            const result = App.renderScenicSpots([]);
            expect(result).toContain('暂无景点数据');
        });

        test('应该正确格式化价格为0的景点', () => {
            const mockSpots = [
                {
                    id: 's1',
                    name: '外滩',
                    city: 'Shanghai',
                    tags: ['地标'],
                    rating: 4.8,
                    price: 0,
                    open_time: '全天',
                    description: '测试景点',
                    image: 'img/s1_waitan.jpg'
                }
            ];

            const result = App.renderScenicSpots(mockSpots);
            expect(result).toContain('免费');
        });

        test('应该正确格式化评分保留1位小数', () => {
            const mockSpots = [
                {
                    id: 's1',
                    name: '外滩',
                    city: 'Shanghai',
                    tags: ['地标'],
                    rating: 4.85,
                    price: 100,
                    open_time: '全天',
                    description: '测试景点',
                    image: 'img/s1_waitan.jpg'
                }
            ];

            const result = App.renderScenicSpots(mockSpots);
            expect(result).toContain('4.9');
        });
    });

    describe('setupMenu', () => {
        test('应该设置菜单点击事件', () => {
            expect(App.setupMenu).toBeDefined();
        });
    });
});

describe('SpotCard', () => {
    test('应该渲染所有必需字段', () => {
        const spot = {
            id: 's1',
            name: '外滩',
            city: 'Shanghai',
            tags: ['地标', '城市景观'],
            rating: 4.8,
            price: 199,
            open_time: '09:00-21:00',
            description: '上海最具代表性的地标',
            image: 'img/s1_waitan.jpg'
        };

        const cardHtml = App.renderSpotCard(spot);
        
        expect(cardHtml).toContain('外滩');
        expect(cardHtml).toContain('上海');
        expect(cardHtml).toContain('地标');
        expect(cardHtml).toContain('城市景观');
        expect(cardHtml).toContain('4.8');
        expect(cardHtml).toContain('¥199');
        expect(cardHtml).toContain('09:00-21:00');
        expect(cardHtml).toContain('上海最具代表性的地标');
    });

    test('应该处理缺失的评分', () => {
        const spot = {
            id: 's1',
            name: '外滩',
            city: 'Shanghai',
            tags: ['地标'],
            rating: null,
            price: 0,
            open_time: '全天',
            description: '测试',
            image: 'img/s1_waitan.jpg'
        };

        const cardHtml = App.renderSpotCard(spot);
        expect(cardHtml).toContain('暂无');
    });
});
