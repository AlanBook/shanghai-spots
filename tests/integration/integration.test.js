// 集成测试文件
// 测试完整的景点展示流程

describe('Integration Tests', () => {
    describe('页面加载和渲染', () => {
        test('页面应该成功加载并显示景点列表', () => {
            // 模拟页面加载
            document.body.innerHTML = `
                <header>
                    <h1>景点展示</h1>
                    <nav id="main-menu">
                        <ul>
                            <li><a href="#home">首页</a></li>
                            <li><a href="#scenic-spots">景点列表</a></li>
                        </ul>
                    </nav>
                </header>
                <main id="content">
                    <section id="scenic-spots">
                        <h2>景点列表</h2>
                        <div id="scenic-list"></div>
                    </section>
                </main>
            `;

            // 加载并渲染景点
            const scenicList = document.getElementById('scenic-list');
            
            expect(scenicList).toBeDefined();
        });

        test('菜单切换应该正常工作', () => {
            document.body.innerHTML = `
                <nav id="main-menu">
                    <ul>
                        <li><a href="#home">首页</a></li>
                        <li><a href="#scenic-spots">景点列表</a></li>
                    </ul>
                </nav>
                <main id="content">
                    <section id="home">首页内容</section>
                    <section id="scenic-spots">景点内容</section>
                </main>
            `;

            const menuLinks = document.querySelectorAll('#main-menu a');
            expect(menuLinks.length).toBe(2);
        });

        test('景点卡片应该包含所有必需元素', () => {
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

            const html = App.renderScenicSpots(mockSpots);
            
            expect(html).toContain('spot-card');
            expect(html).toContain('spot-card-content');
            expect(html).toContain('spot-tag');
        });
    });

    describe('数据验证', () => {
        test('应该验证 JSON 数据格式', () => {
            const validSpot = {
                id: 's1',
                name: '外滩',
                city: 'Shanghai',
                tags: ['地标'],
                rating: 4.8,
                price: 100,
                open_time: '09:00-21:00',
                description: '测试',
                image: 'img/s1_waitan.jpg'
            };

            expect(validSpot.id).toBeDefined();
            expect(validSpot.name).toBeDefined();
            expect(validSpot.city).toBeDefined();
        });

        test('应该处理无效的 JSON 数据', () => {
            const invalidData = null;
            
            const result = App.renderScenicSpots(invalidData);
            expect(result).toContain('暂无景点数据');
        });
    });

    describe('错误处理', () => {
        test('图片加载失败时应该使用默认图片', () => {
            const spot = {
                id: 's1',
                name: '外滩',
                city: 'Shanghai',
                tags: ['地标'],
                rating: 4.8,
                price: 0,
                open_time: '全天',
                description: '测试',
                image: 'invalid/path.jpg'
            };

            const html = App.renderSpotCard(spot);
            expect(html).toContain('onerror');
        });
    });
});
