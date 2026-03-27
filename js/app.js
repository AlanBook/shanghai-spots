const App = {
    allSpots: [],
    searchTimeout: null,
    selectedTags: [],
    
    /**
     * 初始化应用
     * 加载景点数据、设置搜索功能和标签筛选功能
     */
    init: function() {
        this.loadScenicSpots();
        this.setupSearch();
        this.setupTagFilter();
    },
    
    /**
     * 加载景点数据
     * 从 spots.json 文件获取景点列表，渲染到页面
     */
    loadScenicSpots: function() {
        const col1 = document.getElementById('col-1');
        const col2 = document.getElementById('col-2');
        const col3 = document.getElementById('col-3');
        
        col1.innerHTML = '';
        col2.innerHTML = '';
        col3.innerHTML = '';
        
        fetch('spots.json')
            .then(response => response.json())
            .then(data => {
                this.allSpots = data.spots || [];
                this.renderTagButtons();
                this.renderScenicSpots(this.allSpots);
            })
            .catch(error => {
                console.error('加载景点数据失败:', error);
                col1.innerHTML = '<p>无法加载景点数据，请检查数据文件。</p>';
            });
    },
    
    /**
     * 设置搜索功能
     * 为搜索框添加输入事件监听，实现防抖搜索
     */
    setupSearch: function() {
        const searchInput = document.getElementById('search-input');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
        }
    },
    
    /**
     * 设置标签筛选功能
     * 为标签按钮添加点击事件监听，支持多选筛选
     */
    setupTagFilter: function() {
        const tagButtons = document.getElementById('tag-buttons');
        const clearBtn = document.getElementById('clear-tags-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (tagButtons) {
            tagButtons.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-btn')) {
                    this.toggleTag(e.target.dataset.tag);
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearTags();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAll();
            });
        }
    },
    
    /**
     * 渲染标签按钮
     * 从所有景点中提取唯一标签，生成可点击的标签按钮
     */
    renderTagButtons: function() {
        const tagButtonsContainer = document.getElementById('tag-buttons');
        if (!tagButtonsContainer) return;
        
        const allTags = new Set();
        
        this.allSpots.forEach(spot => {
            if (spot.tags && Array.isArray(spot.tags)) {
                spot.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        const sortedTags = Array.from(allTags).sort();
        
        tagButtonsContainer.innerHTML = sortedTags.map(tag => 
            `<span class="tag-btn" data-tag="${tag}">${tag}</span>`
        ).join('');
    },
    
    /**
     * 切换标签选中状态
     * @param {string} tag - 标签名称
     */
    toggleTag: function(tag) {
        const tagIndex = this.selectedTags.indexOf(tag);
        
        if (tagIndex > -1) {
            this.selectedTags.splice(tagIndex, 1);
        } else {
            this.selectedTags.push(tag);
        }
        
        this.updateTagButtons();
        this.filterByTags();
    },
    
    /**
     * 更新标签按钮的选中状态样式
     */
    updateTagButtons: function() {
        const tagButtons = document.querySelectorAll('.tag-btn');
        
        tagButtons.forEach(btn => {
            if (this.selectedTags.includes(btn.dataset.tag)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    /**
     * 清空所有选中的标签
     */
    clearTags: function() {
        this.selectedTags = [];
        this.updateTagButtons();
        this.filterByTags();
    },
    
    /**
     * 重置所有筛选条件
     * 清空搜索框和标签选中状态，恢复显示所有景点
     */
    resetAll: function() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.selectedTags = [];
        this.updateTagButtons();
        this.filterByTags();
    },
    
    /**
     * 根据选中的标签过滤景点
     * 支持多选，显示同时包含所有选中标签的景点
     */
    filterByTags: function() {
        const searchInput = document.getElementById('search-input');
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        let filteredSpots = this.allSpots;
        
        if (this.selectedTags.length > 0) {
            filteredSpots = filteredSpots.filter(spot => {
                if (!spot.tags || !Array.isArray(spot.tags)) return false;
                return this.selectedTags.every(selectedTag => 
                    spot.tags.includes(selectedTag)
                );
            });
        }
        
        if (keyword) {
            filteredSpots = filteredSpots.filter(spot => {
                const nameMatch = spot.name.toLowerCase().includes(keyword);
                const cityMatch = spot.city.toLowerCase().includes(keyword);
                return nameMatch || cityMatch;
            });
        }
        
        this.renderScenicSpots(filteredSpots);
    },
    
    /**
     * 执行搜索
     * 根据关键词搜索景点名称和城市，支持模糊匹配
     */
    performSearch: function() {
        this.filterByTags();
    },
    
    /**
     * 渲染景点列表
     * @param {Array} spots - 景点数据数组
     * 使用瀑布流布局将景点卡片分配到三列中
     */
    renderScenicSpots: function(spots) {
        const col1 = document.getElementById('col-1');
        const col2 = document.getElementById('col-2');
        const col3 = document.getElementById('col-3');
        
        col1.innerHTML = '';
        col2.innerHTML = '';
        col3.innerHTML = '';
        
        if (!spots || spots.length === 0) {
            col1.innerHTML = '<p style="color: #999; font-style: italic; text-align: center; padding: 3rem 0;">暂无匹配的景点，请更换关键词</p>';
            return;
        }
        
        const cols = [
            document.getElementById('col-1'),
            document.getElementById('col-2'),
            document.getElementById('col-3')
        ];
        
        const colHeights = [0, 0, 0];
        
        spots.forEach(spot => {
            const cardHtml = this.createCardHtml(spot);
            const shortestColIndex = this.getShortestColumnIndex(colHeights);
            
            cols[shortestColIndex].innerHTML += cardHtml;
            colHeights[shortestColIndex] += spot.ratio === 'vertical' ? 550 : 450;
        });
    },
    
    /**
     * 创建景点卡片HTML
     * @param {Object} spot - 景点对象，包含id、name、city、tags、rating、price等属性
     * @returns {string} - 景点卡片的HTML字符串
     * 根据图片比例（horizontal/vertical）应用不同的卡片样式
     */
    createCardHtml: function(spot) {
        const tagsHtml = spot.tags ? spot.tags.map(tag => `<span class="spot-tag">${tag}</span>`).join('') : '';
        const priceText = spot.price === 0 ? '免费' : spot.price;
        const ratingText = spot.rating ? spot.rating.toFixed(1) : '暂无';
        const cardClass = spot.ratio === 'vertical' ? 'spot-card vertical' : 'spot-card horizontal';
        
        return `
            <div class="${cardClass}">
                <img src="${spot.image}" alt="${spot.name}" onerror="this.src='img/s1_waitap.jpg'">
                <div class="spot-card-content">
                    <h3>${spot.name}</h3>
                    <p class="spot-card-city">城市: ${spot.city}</p>
                    <div class="spot-card-tags">${tagsHtml}</div>
                    <p class="rating">评分: ${ratingText}</p>
                    <p class="price">${priceText}</p>
                    <p class="open-time">开放时间: ${spot.open_time}</p>
                    <p class="description">${spot.description}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * 获取最短的列索引
     * @param {Array} heights - 三列的高度数组 [height1, height2, height3]
     * @returns {number} - 最短列的索引 (0, 1, 或 2)
     * 用于实现瀑布流布局，将卡片分配到当前高度最小的列
     */
    getShortestColumnIndex: function(heights) {
        let minIndex = 0;
        let minHeight = heights[0];
        
        for (let i = 1; i < heights.length; i++) {
            if (heights[i] < minHeight) {
                minHeight = heights[i];
                minIndex = i;
            }
        }
        
        return minIndex;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
