const App = {
    allSpots: [],
    searchTimeout: null,
    selectedTags: [],
    currentSort: 'default',
    favorites: [],
    
    /**
     * 初始化应用
     * 加载景点数据、设置搜索功能和标签筛选功能
     */
    init: function() {
        this.loadScenicSpots();
        this.setupSearch();
        this.setupTagFilter();
        this.setupSort();
        this.setupModal();
        this.loadFavorites();
        this.setupFavoriteButtons();
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
        
        this.setupSort();
    },
    
    /**
     * 设置排序功能
     * 为排序下拉菜单添加变化事件监听，实现排序功能
     */
    setupSort: function() {
        const sortSelect = document.getElementById('sort-select');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.filterByTags();
            });
        }
    },
    
    setupModal: function() {
        const modal = document.getElementById('spot-detail-modal');
        const closeBtn = document.getElementById('modal-close');
        const scenicList = document.getElementById('scenic-list');
        
        if (scenicList) {
            scenicList.addEventListener('click', (e) => {
                const card = e.target.closest('.spot-card');
                if (card && card.dataset.spotId) {
                    this.showSpotDetail(card.dataset.spotId);
                }
            });
        }
        
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('show')) {
                    this.closeModal();
                }
            });
        }
    },
    
    showSpotDetail: function(spotId) {
        const spot = this.allSpots.find(s => s.id === spotId);
        if (!spot) return;
        
        const modal = document.getElementById('spot-detail-modal');
        if (!modal) return;
        
        document.getElementById('modal-spot-name').textContent = spot.name;
        document.getElementById('modal-spot-city').textContent = spot.city;
        document.getElementById('modal-spot-image').src = spot.image;
        document.getElementById('modal-spot-description').textContent = spot.description;
        document.getElementById('modal-spot-full-description').textContent = spot.full_description || '暂无详细描述';
        document.getElementById('modal-spot-history').textContent = spot.history || '暂无历史沿革信息';
        document.getElementById('modal-spot-play-time').textContent = spot.play_time || '暂无游玩时长信息';
        document.getElementById('modal-spot-tips').textContent = spot.tips || '暂无游览提示';
        document.getElementById('modal-spot-encyclopedia').href = spot.encyclopedia_url || '#';
        document.getElementById('modal-spot-rating').textContent = spot.rating ? spot.rating.toFixed(1) : '暂无';
        document.getElementById('modal-spot-price').textContent = spot.price === 0 ? '免费' : `¥${spot.price}`;
        document.getElementById('modal-spot-open-time').textContent = spot.open_time || '暂无';
        
        const tagsContainer = document.getElementById('modal-spot-tags');
        if (spot.tags && spot.tags.length > 0) {
            tagsContainer.innerHTML = spot.tags.map(tag => `<span class="spot-tag">${tag}</span>`).join('');
        } else {
            tagsContainer.innerHTML = '暂无';
        }
        
        this.updateFavoriteButton(spot.id);
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },
    
    updateFavoriteButton: function(spotId) {
        const btn = document.getElementById('modal-favorite-btn');
        if (!btn) return;
        
        const isFavorite = this.favorites.includes(spotId);
        if (isFavorite) {
            btn.classList.add('active');
            btn.querySelector('.btn-icon').textContent = '★';
            btn.querySelector('.btn-text').textContent = '已收藏';
        } else {
            btn.classList.remove('active');
            btn.querySelector('.btn-icon').textContent = '☆';
            btn.querySelector('.btn-text').textContent = '收藏';
        }
    },
    
    toggleFavorite: function(spotId) {
        const index = this.favorites.indexOf(spotId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(spotId);
        }
        
        this.saveFavorites();
        this.updateFavoriteButton(spotId);
        this.updateCardFavoriteState(spotId);
    },
    
    saveFavorites: function() {
        localStorage.setItem('spotsFavorites', JSON.stringify(this.favorites));
    },
    
    loadFavorites: function() {
        const saved = localStorage.getItem('spotsFavorites');
        if (saved) {
            this.favorites = JSON.parse(saved);
        }
    },
    
    updateCardFavoriteState: function(spotId) {
        const card = document.querySelector(`.spot-card[data-spot-id="${spotId}"]`);
        if (card) {
            const isFavorite = this.favorites.includes(spotId);
            if (isFavorite) {
                card.classList.add('favorited');
            } else {
                card.classList.remove('favorited');
            }
        }
    },
    
    setupFavoriteButtons: function() {
        const btn = document.getElementById('modal-favorite-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const spotName = document.getElementById('modal-spot-name')?.textContent;
                if (spotName) {
                    const spot = this.allSpots.find(s => s.name === spotName);
                    if (spot) {
                        this.toggleFavorite(spot.id);
                    }
                }
            });
        }
        
        const scenicList = document.getElementById('scenic-list');
        if (scenicList) {
            scenicList.addEventListener('click', (e) => {
                const card = e.target.closest('.spot-card');
                if (card && card.dataset.spotId) {
                    const spotId = card.dataset.spotId;
                    this.toggleFavorite(spotId);
                }
                
                const favoriteBtn = e.target.closest('.card-favorite-btn');
                if (favoriteBtn) {
                    const card = favoriteBtn.closest('.spot-card');
                    if (card && card.dataset.spotId) {
                        const spotId = card.dataset.spotId;
                        this.toggleFavorite(spotId);
                    }
                }
            });
        }
    },
    
    closeModal: function() {
        const modal = document.getElementById('spot-detail-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
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
     * 清空搜索框、标签选中状态和排序选项，恢复显示所有景点
     */
    resetAll: function() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.selectedTags = [];
        this.updateTagButtons();
        
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'default';
            this.currentSort = 'default';
        }
        
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
        
        this.sortSpots(filteredSpots);
    },
    
    /**
     * 对景点进行排序
     * @param {Array} spots - 景点数据数组
     * 根据当前选择的排序方式（评分/价格，升序/降序）对景点进行排序
     */
    sortSpots: function(spots) {
        if (this.currentSort === 'default') {
            this.renderScenicSpots(spots);
            return;
        }
        
        const sortedSpots = [...spots];
        
        switch (this.currentSort) {
            case 'rating-desc':
                sortedSpots.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'rating-asc':
                sortedSpots.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                break;
            case 'price-desc':
                sortedSpots.sort((a, b) => {
                    const priceA = a.price === '免费' || a.price === 0 ? 0 : a.price;
                    const priceB = b.price === '免费' || b.price === 0 ? 0 : b.price;
                    return priceB - priceA;
                });
                break;
            case 'price-asc':
                sortedSpots.sort((a, b) => {
                    const priceA = a.price === '免费' || a.price === 0 ? 0 : a.price;
                    const priceB = b.price === '免费' || b.price === 0 ? 0 : b.price;
                    return priceA - priceB;
                });
                break;
        }
        
        this.renderScenicSpots(sortedSpots);
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
        const priceText = spot.price === 0 ? '免费' : `¥${spot.price}`;
        const ratingText = spot.rating ? spot.rating.toFixed(1) : '暂无';
        const cardClass = spot.ratio === 'vertical' ? 'spot-card vertical' : 'spot-card horizontal';
        const isFavorite = this.favorites.includes(spot.id) ? 'favorited' : '';
        
        return `
            <div class="${cardClass} ${isFavorite}" data-spot-id="${spot.id}">
                <img src="${spot.image}" alt="${spot.name}" onerror="this.src='img/s1_waitap.jpg'">
                <div class="spot-card-content">
                    <h3>${spot.name}</h3>
                    <p class="spot-card-city">城市: ${spot.city}</p>
                    <div class="spot-card-tags">${tagsHtml}</div>
                    <p class="rating">评分: ${ratingText}</p>
                    <p class="price">${priceText}</p>
                    <p class="open-time">开放时间: ${spot.open_time}</p>
                    <p class="description">${spot.description}</p>
                    <button class="card-favorite-btn" title="收藏">
                        <span class="btn-icon">★</span>
                    </button>
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
