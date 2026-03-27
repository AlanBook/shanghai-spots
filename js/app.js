const App = {
    allSpots: [],
    searchTimeout: null,
    selectedTags: [],
    currentSort: 'default',
    favorites: [],
    routeDesignMode: false,
    selectedRouteSpots: [],
    
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
        this.setupRouteDesignMode();
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
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
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
                if (this.routeDesignMode) {
                    return;
                }
                
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
        this.setupMapButton(spot);
        
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
        
        const mapBtn = document.getElementById('modal-map-btn');
        if (mapBtn) {
            mapBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openMap();
            });
        }
        
        const scenicList = document.getElementById('scenic-list');
        if (scenicList) {
            scenicList.addEventListener('click', (e) => {
                const favoriteBtn = e.target.closest('.card-favorite-btn');
                if (favoriteBtn) {
                    e.stopPropagation();
                    const card = favoriteBtn.closest('.spot-card');
                    if (card && card.dataset.spotId) {
                        const spotId = card.dataset.spotId;
                        this.toggleFavorite(spotId);
                        const spot = this.allSpots.find(s => s.id === spotId);
                        if (spot) {
                            this.showSpotDetail(spotId);
                        }
                    }
                }
                
                const cardMapBtn = e.target.closest('.card-map-btn');
                if (cardMapBtn) {
                    e.stopPropagation();
                    const spotId = cardMapBtn.dataset.spotId;
                    const spot = this.allSpots.find(s => s.id === spotId);
                    if (spot) {
                        if (spot.map_url) {
                            window.open(spot.map_url, '_blank');
                        } else {
                            const searchUrl = `https://map.baidu.com/poi/${encodeURIComponent(spot.name)}/@13525390.820233801,3641742.512783546,15.52z?uid=${spotId}&querytype=detailConInfo&da_src=shareurl`;
                            window.open(searchUrl, '_blank');
                        }
                    }
                }
            });
        }
    },
    
    setupMapButton: function(spot) {
        const mapBtn = document.getElementById('modal-map-btn');
        if (!mapBtn) return;
        
        mapBtn.dataset.spotName = spot.name;
        mapBtn.dataset.spotId = spot.id;
    },
    
    openMap: function() {
        const mapBtn = document.getElementById('modal-map-btn');
        if (!mapBtn) return;
        
        const spotId = mapBtn.dataset.spotId;
        const spot = this.allSpots.find(s => s.id === spotId);
        
        if (spot) {
            if (spot.map_url) {
                window.open(spot.map_url, '_blank');
            } else {
                const searchUrl = `https://map.baidu.com/poi/${encodeURIComponent(spot.name)}/@13525390.820233801,3641742.512783546,15.52z?uid=${spotId}&querytype=detailConInfo&da_src=shareurl`;
                window.open(searchUrl, '_blank');
            }
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
        const isRouteMode = this.routeDesignMode ? 'route-mode' : '';
        const isSelected = this.selectedRouteSpots.includes(spot.id) ? 'selected' : '';
        
        return `
            <div class="${cardClass} ${isFavorite} ${isRouteMode} ${isSelected}" data-spot-id="${spot.id}">
                ${this.routeDesignMode ? '<div class="card-checkbox" onclick="event.stopPropagation();"></div>' : ''}
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
                    <button class="card-map-btn" data-spot-id="${spot.id}">
                        <span class="btn-icon">🗺️</span>
                        <span>查看地图</span>
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
    },

    setupRouteDesignMode: function() {
        const routeBtn = document.getElementById('route-design-btn');
        const cancelBtn = document.getElementById('cancel-route-design-btn');
        const confirmBtn = document.getElementById('confirm-route-btn');
        const scenicList = document.getElementById('scenic-list');

        if (routeBtn) {
            routeBtn.addEventListener('click', () => {
                this.toggleRouteDesignMode();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.toggleRouteDesignMode();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmRouteDesign();
            });
        }

        if (scenicList) {
            scenicList.addEventListener('click', (e) => {
                if (this.routeDesignMode) {
                    const checkbox = e.target.closest('.card-checkbox');
                    const card = e.target.closest('.spot-card');
                    
                    if (card && card.dataset.spotId) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        this.toggleSpotSelection(card.dataset.spotId);
                    }
                }
            }, true);
        }
    },

    toggleRouteDesignMode: function() {
        this.routeDesignMode = !this.routeDesignMode;
        const routeBtn = document.getElementById('route-design-btn');
        const routeBar = document.getElementById('route-design-bar');

        if (this.routeDesignMode) {
            routeBtn.classList.add('active');
            routeBtn.innerHTML = '<span class="btn-icon">✖️</span><span>退出模式</span>';
            routeBar.classList.remove('hidden');
        } else {
            routeBtn.classList.remove('active');
            routeBtn.innerHTML = '<span class="btn-icon">🗺️</span><span>线路设计模式</span>';
            routeBar.classList.add('hidden');
            this.selectedRouteSpots = [];
        }

        this.filterByTags();
    },

    toggleSpotSelection: function(spotId) {
        const index = this.selectedRouteSpots.indexOf(spotId);
        if (index > -1) {
            this.selectedRouteSpots.splice(index, 1);
        } else {
            this.selectedRouteSpots.push(spotId);
        }

        this.updateSelectedCount();
        this.updateConfirmButtonState();
        this.updateCardSelectionState(spotId);
    },

    updateSelectedCount: function() {
        const countEl = document.getElementById('selected-count-num');
        if (countEl) {
            countEl.textContent = this.selectedRouteSpots.length;
        }
    },

    updateConfirmButtonState: function() {
        const confirmBtn = document.getElementById('confirm-route-btn');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedRouteSpots.length < 2;
        }
    },

    updateCardSelectionState: function(spotId) {
        const card = document.querySelector(`.spot-card[data-spot-id="${spotId}"]`);
        if (card) {
            if (this.selectedRouteSpots.includes(spotId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    },

    extractCoordinatesFromMapUrl: function(mapUrl) {
        if (!mapUrl) return null;
        const match = mapUrl.match(/@([\d.]+),([\d.]+)/);
        if (match) {
            const baiduX = parseFloat(match[1]);
            const baiduY = parseFloat(match[2]);
            return this.baiduMercatorToWgs84(baiduX, baiduY);
        }
        return null;
    },

    baiduMercatorToWgs84: function(x, y) {
        const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        const lng = x / 20037508.34 * 180.0;
        let lat = y / 20037508.34 * 180.0;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
        
        const dlat = lat - 31.2304;
        const dlng = lng - 121.4737;
        
        const bd_lng = lng - 0.0065;
        const bd_lat = lat - 0.006;
        const z = Math.sqrt(bd_lng * bd_lng + bd_lat * bd_lat) - 0.00002 * Math.sin(bd_lat * x_pi);
        const theta = Math.atan2(bd_lat, bd_lng) - 0.000003 * Math.cos(bd_lng * x_pi);
        const gg_lng = z * Math.cos(theta);
        const gg_lat = z * Math.sin(theta);
        
        return {
            latitude: gg_lat + (lat - gg_lat) * 0.002,
            longitude: gg_lng + (lng - gg_lng) * 0.002
        };
    },

    extractUidFromMapUrl: function(mapUrl) {
        if (!mapUrl) return null;
        const match = mapUrl.match(/[?&]uid=([^&]+)/);
        if (match) {
            return match[1];
        }
        return null;
    },

    confirmRouteDesign: function() {
        if (this.selectedRouteSpots.length < 2) {
            alert('请至少选择2个景点');
            return;
        }

        const selectedSpots = this.selectedRouteSpots.map(id => 
            this.allSpots.find(s => s.id === id)
        ).filter(spot => spot);

        const spotInfos = [];

        selectedSpots.forEach(spot => {
            const uid = this.extractUidFromMapUrl(spot.map_url);
            let mcCoords = null;
            if (spot.map_url) {
                const match = spot.map_url.match(/@([\d.]+),([\d.]+)/);
                if (match) {
                    mcCoords = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
                }
            }
            spotInfos.push({
                name: spot.name,
                uid: uid,
                mcCoords: mcCoords
            });
        });

        if (spotInfos.length < 2) {
            alert('无法获取足够的景点信息');
            return;
        }

        this.designRoute(spotInfos);
    },

    designRoute: async function(spotInfos) {
        const spotNames = spotInfos.map(s => s.name);
        this.showRouteLoading(spotNames);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showRouteResult(spotInfos);
        } catch (error) {
            console.error('路线规划失败:', error);
            alert('路线规划失败，请稍后重试');
            this.toggleRouteDesignMode();
        }
    },

    showRouteLoading: function(spotNames) {
        const modal = document.createElement('div');
        modal.id = 'route-loading-modal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 4rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">🗺️</div>
                    <h2 style="color: var(--shanghai-navy); margin-bottom: 1rem;">正在规划路线...</h2>
                    <p style="color: var(--shanghai-dark); font-size: 1.1rem;">
                        已选择 ${spotNames.length} 个景点：<br>
                        ${spotNames.join(' → ')}
                    </p>
                    <div style="margin-top: 2rem;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--shanghai-light); border-top-color: var(--shanghai-gold); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    },

    showRouteResult: function(spotInfos) {
        const loadingModal = document.getElementById('route-loading-modal');
        if (loadingModal) {
            loadingModal.remove();
        }

        const spotNames = spotInfos.map(s => s.name);
        const modal = document.createElement('div');
        modal.id = 'route-result-modal';
        modal.className = 'modal show';
        
        const travelModes = ['transit', 'riding', 'walking'];
        const modeNames = { transit: '🚌 公共交通', riding: '🚲 骑行', walking: '🚶 步行' };
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 1000px;">
                <button class="modal-close" id="route-modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-header">
                        <h2>📍 路线规划结果</h2>
                    </div>
                    
                    <div style="background: var(--shanghai-cream); padding: 1.5rem; border: 1px solid var(--shanghai-light); margin-bottom: 1.5rem;">
                        <h3 style="color: var(--shanghai-navy); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>📋</span> 选择的景点（共${spotNames.length}个）
                        </h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
                            ${spotNames.map((name, index) => `
                                <div style="background: white; padding: 0.5rem 1rem; border: 2px solid ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="width: 24px; height: 24px; background: ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; color: ${index === 0 ? 'white' : 'var(--shanghai-dark)'}; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%; font-size: 0.85rem;">${index + 1}</span>
                                    <span style="font-weight: 500;">${name}</span>
                                    ${index < spotNames.length - 1 ? '<span style="color: var(--shanghai-gold); font-weight: bold;">→</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: var(--shanghai-navy); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>🚗</span> 选择出行方式
                        </h3>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            ${travelModes.map((mode, index) => `
                                <button class="travel-mode-btn ${index === 0 ? 'active' : ''}" data-mode="${mode}" style="flex: 1; min-width: 150px; padding: 1rem; background: ${index === 0 ? 'linear-gradient(135deg, var(--shanghai-gold) 0%, var(--shanghai-navy) 100%)' : 'white'}; color: ${index === 0 ? 'white' : 'var(--shanghai-dark)'}; border: 3px solid ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    ${modeNames[mode]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div id="route-info" style="background: var(--shanghai-cream); padding: 1.5rem; border-left: 4px solid var(--shanghai-gold); margin-bottom: 1.5rem;">
                        <h4 style="color: var(--shanghai-navy); margin-bottom: 0.8rem;">📊 路线预览（公共交通）</h4>
                        <p style="color: var(--shanghai-dark); margin-bottom: 0.5rem;"><strong>总距离：</strong>约 4.2 公里</p>
                        <p style="color: var(--shanghai-dark); margin-bottom: 0.5rem;"><strong>预计用时：</strong>约 55 分钟</p>
                        <p style="color: var(--shanghai-dark); font-style: italic;">（以上为示例数据，实际以百度地图为准）</p>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button id="open-map-btn" class="confirm-route-btn" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
                            🗺️ 在百度地图中查看详细路线
                        </button>
                        <button id="close-route-modal-btn" class="cancel-route-btn" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const selectedMode = { current: 'transit' };
        
        const travelModeBtns = modal.querySelectorAll('.travel-mode-btn');
        travelModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                travelModeBtns.forEach(b => {
                    b.style.background = 'white';
                    b.style.color = 'var(--shanghai-dark)';
                    b.style.borderColor = 'var(--shanghai-light)';
                    b.classList.remove('active');
                });
                btn.style.background = 'linear-gradient(135deg, var(--shanghai-gold) 0%, var(--shanghai-navy) 100%)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--shanghai-gold)';
                btn.classList.add('active');
                selectedMode.current = btn.dataset.mode;
                
                const modeInfo = {
                    transit: { distance: '约 4.2 公里', time: '约 55 分钟', name: '公共交通' },
                    riding: { distance: '约 3.8 公里', time: '约 25 分钟', name: '骑行' },
                    walking: { distance: '约 3.5 公里', time: '约 50 分钟', name: '步行' }
                };
                const info = modeInfo[selectedMode.current];
                const routeInfoEl = document.getElementById('route-info');
                routeInfoEl.innerHTML = `
                    <h4 style="color: var(--shanghai-navy); margin-bottom: 0.8rem;">📊 路线预览（${info.name}）</h4>
                    <p style="color: var(--shanghai-dark); margin-bottom: 0.5rem;"><strong>总距离：</strong>${info.distance}</p>
                    <p style="color: var(--shanghai-dark); margin-bottom: 0.5rem;"><strong>预计用时：</strong>${info.time}</p>
                    <p style="color: var(--shanghai-dark); font-style: italic;">（以上为示例数据，实际以百度地图为准）</p>
                `;
            });
        });
        
        const openMapBtn = document.getElementById('open-map-btn');
        openMapBtn.addEventListener('click', () => {
            this.openBaiduMapWithSpots(spotInfos, selectedMode.current);
        });
        
        const closeBtn = document.getElementById('route-modal-close');
        const closeModalBtn = document.getElementById('close-route-modal-btn');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            this.toggleRouteDesignMode();
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    },

    openBaiduMapWithSpots: function(spotInfos, mode) {
        if (spotInfos.length >= 2) {
            const origin = spotInfos[0];
            const dest = spotInfos[spotInfos.length - 1];
            const originName = encodeURIComponent(origin.name);
            const destName = encodeURIComponent(dest.name);
            
            let centerX = 0;
            let centerY = 0;
            
            if (origin.mcCoords && dest.mcCoords) {
                centerX = (origin.mcCoords.x + dest.mcCoords.x) / 2;
                centerY = (origin.mcCoords.y + dest.mcCoords.y) / 2;
            } else if (origin.mcCoords) {
                centerX = origin.mcCoords.x;
                centerY = origin.mcCoords.y;
            } else if (dest.mcCoords) {
                centerX = dest.mcCoords.x;
                centerY = dest.mcCoords.y;
            } else {
                centerX = 13523879.89;
                centerY = 3641052.94;
            }
            
            let mapUrl = `https://map.baidu.com/dir/${originName}/${destName}/@${centerX.toFixed(6)},${centerY.toFixed(6)},13z/index%3D1?`;
            
            const queryParams = [];
            queryParams.push('querytype=bt');
            queryParams.push('bttp=0');
            queryParams.push('c=289');
            queryParams.push('sy=0');
            
            if (dest.uid && dest.mcCoords) {
                const enParam = `en=1$$${dest.uid}$$${dest.mcCoords.x.toFixed(2)},${dest.mcCoords.y.toFixed(2)}$$${destName}$$$$$$`;
                queryParams.push(enParam);
            }
            
            if (origin.uid && origin.mcCoords) {
                const snParam = `sn=0$$${origin.uid}$$${origin.mcCoords.x.toFixed(6)},${origin.mcCoords.y.toFixed(6)}$$${originName}$$$$$$`;
                queryParams.push(snParam);
            }
            
            queryParams.push(`sq=${destName}`);
            queryParams.push(`eq=${originName}`);
            queryParams.push('exptype=dep');
            queryParams.push('version=5');
            queryParams.push('da_src=shareurl');
            
            mapUrl += queryParams.join('&');
            
            window.open(mapUrl, '_blank');
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
