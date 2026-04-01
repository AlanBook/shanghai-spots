const App = {
    allSpots: [],
    searchTimeout: null,
    selectedTags: [],
    currentSort: 'default',
    favorites: [],
    routeDesignMode: false,
    selectedRouteSpots: [],
    smartRouteMode: false,
    selectedSmartRouteSpots: [],
    
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
        this.setupSmartRouteMode();
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
        
        if (this.routeDesignMode) {
            this.updateCardSelectionState();
        }
        if (this.smartRouteMode) {
            this.updateSmartCardSelectionState();
        }
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
        const isSmartRouteMode = this.smartRouteMode ? 'smart-route-mode' : '';
        const smartIsSelected = this.selectedSmartRouteSpots.includes(spot.id) ? 'smart-selected' : '';
        const checkboxType = this.routeDesignMode ? '序号' : (this.smartRouteMode ? '打勾' : '');
        const checkboxHtml = this.routeDesignMode 
            ? `<div class="card-checkbox" onclick="event.stopPropagation();">${this.selectedRouteSpots.indexOf(spot.id) + 1}</div>`
            : (this.smartRouteMode ? `<div class="card-checkbox smart-checkbox" onclick="event.stopPropagation();"></div>` : '');
        
        return `
            <div class="${cardClass} ${isFavorite} ${isRouteMode} ${isSelected} ${isSmartRouteMode} ${smartIsSelected}" data-spot-id="${spot.id}">
                ${checkboxHtml}
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
        const routeBtn = document.getElementById('manual-route-btn');
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
        const routeBtn = document.getElementById('manual-route-btn');
        const routeBar = document.getElementById('route-design-bar');

        if (this.routeDesignMode) {
            routeBtn.classList.add('active');
            routeBtn.innerHTML = '<span class="btn-icon">✖️</span><span>退出模式</span>';
            routeBar.classList.remove('hidden');
            this.updateSelectionLimitMessage();
        } else {
            routeBtn.classList.remove('active');
            routeBtn.innerHTML = '<span class="btn-icon">🗺️</span><span>手动线路设计模式</span>';
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
            if (this.selectedRouteSpots.length >= 7) {
                this.updateSelectionLimitMessage('已达上限');
                return;
            }
            this.selectedRouteSpots.push(spotId);
        }

        this.updateSelectedCount();
        this.updateConfirmButtonState();
        this.updateCardSelectionState();
        this.updateSelectionLimitMessage();
    },

    updateSelectedCount: function() {
        const countEl = document.getElementById('selected-count-num');
        if (countEl) {
            countEl.textContent = this.selectedRouteSpots.length;
        }
    },

    updateSelectionLimitMessage: function(message) {
        const msgEl = document.getElementById('selection-limit-message');
        if (!msgEl) return;
        
        if (message) {
            msgEl.textContent = message;
            msgEl.classList.add('show');
        } else {
            if (this.selectedRouteSpots.length === 7) {
                msgEl.textContent = '已达上限';
                msgEl.classList.add('show');
            } else if (this.selectedRouteSpots.length >= 6) {
                msgEl.textContent = '只能选择7个景点';
                msgEl.classList.add('show');
            } else {
                msgEl.classList.remove('show');
            }
        }
    },

    updateConfirmButtonState: function() {
        const confirmBtn = document.getElementById('confirm-route-btn');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedRouteSpots.length < 2;
        }
    },

    updateCardSelectionState: function() {
        this.selectedRouteSpots.forEach((id, index) => {
            const card = document.querySelector(`.spot-card[data-spot-id="${id}"]`);
            if (card) {
                const checkbox = card.querySelector('.card-checkbox');
                if (checkbox) {
                    checkbox.textContent = index + 1;
                    checkbox.classList.add('selected');
                }
                card.classList.add('selected');
            }
        });
        
        const allCards = document.querySelectorAll('.spot-card');
        allCards.forEach(card => {
            const id = card.dataset.spotId;
            if (!this.selectedRouteSpots.includes(id)) {
                const checkbox = card.querySelector('.card-checkbox');
                if (checkbox) {
                    checkbox.textContent = '';
                    checkbox.classList.remove('selected');
                }
                card.classList.remove('selected');
            }
        });
    },

    updateSmartCardSelectionState: function() {
        this.selectedSmartRouteSpots.forEach(id => {
            const card = document.querySelector(`.spot-card[data-spot-id="${id}"]`);
            if (card) {
                const checkbox = card.querySelector('.smart-checkbox');
                if (checkbox) {
                    checkbox.textContent = '✓';
                    checkbox.classList.add('selected');
                }
                card.classList.add('smart-selected');
            }
        });
        
        const allCards = document.querySelectorAll('.spot-card');
        allCards.forEach(card => {
            const id = card.dataset.spotId;
            if (!this.selectedSmartRouteSpots.includes(id)) {
                const checkbox = card.querySelector('.smart-checkbox');
                if (checkbox) {
                    checkbox.textContent = '';
                    checkbox.classList.remove('selected');
                }
                card.classList.remove('smart-selected');
            }
        });
    },

    setupSmartRouteMode: function() {
        const smartRouteBtn = document.getElementById('smart-route-btn');
        const cancelSmartBtn = document.getElementById('cancel-smart-route-btn');
        const confirmSmartBtn = document.getElementById('confirm-smart-route-btn');
        const scenicList = document.getElementById('scenic-list');

        if (smartRouteBtn) {
            smartRouteBtn.addEventListener('click', () => {
                this.toggleSmartRouteMode();
            });
        }

        if (cancelSmartBtn) {
            cancelSmartBtn.addEventListener('click', () => {
                this.toggleSmartRouteMode();
            });
        }

        if (confirmSmartBtn) {
            confirmSmartBtn.addEventListener('click', () => {
                this.confirmSmartRouteDesign();
            });
        }

        if (scenicList) {
            scenicList.addEventListener('click', (e) => {
                if (this.smartRouteMode) {
                    const checkbox = e.target.closest('.smart-checkbox');
                    const card = e.target.closest('.spot-card');
                    
                    if (card && card.dataset.spotId) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        this.toggleSmartSpotSelection(card.dataset.spotId);
                    }
                }
            }, true);
        }
    },

    toggleSmartRouteMode: function() {
        this.smartRouteMode = !this.smartRouteMode;
        const smartRouteBtn = document.getElementById('smart-route-btn');
        const smartRouteBar = document.getElementById('smart-route-bar');

        if (this.smartRouteMode) {
            smartRouteBtn.classList.add('active');
            smartRouteBtn.innerHTML = '<span class="btn-icon">✖️</span><span>退出模式</span>';
            smartRouteBar.classList.remove('hidden');
            this.updateSmartSelectedCount();
        } else {
            smartRouteBtn.classList.remove('active');
            smartRouteBtn.innerHTML = '<span class="btn-icon">🤖</span><span>智能路线规划模式</span>';
            smartRouteBar.classList.add('hidden');
            this.selectedSmartRouteSpots = [];
        }

        this.filterByTags();
    },

    toggleSmartSpotSelection: function(spotId) {
        const index = this.selectedSmartRouteSpots.indexOf(spotId);
        if (index > -1) {
            this.selectedSmartRouteSpots.splice(index, 1);
        } else {
            this.selectedSmartRouteSpots.push(spotId);
        }

        this.updateSmartSelectedCount();
        this.updateSmartConfirmButtonState();
        this.updateSmartCardSelectionState();
    },

    updateSmartSelectedCount: function() {
        const countEl = document.getElementById('smart-selected-count-num');
        if (countEl) {
            countEl.textContent = this.selectedSmartRouteSpots.length;
        }
    },

    updateSmartConfirmButtonState: function() {
        const confirmSmartBtn = document.getElementById('confirm-smart-route-btn');
        if (confirmSmartBtn) {
            confirmSmartBtn.disabled = this.selectedSmartRouteSpots.length < 2;
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

    wgs84ToBaiduMercator: function(lat, lng) {
        const x = lng * 20037508.34 / 180.0;
        const y = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0) * 20037508.34 / 180.0;
        
        console.log('WGS84经纬度:', lat, lng);
        console.log('墨卡托坐标:', x, y);
        
        return { x: x, y: y };
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

    confirmSmartRouteDesign: function() {
        if (this.selectedSmartRouteSpots.length < 2) {
            alert('请至少选择2个景点');
            return;
        }

        const selectedSpots = this.selectedSmartRouteSpots.map(id => 
            this.allSpots.find(s => s.id === id)
        ).filter(spot => spot);

        const spotInfos = [];

        selectedSpots.forEach(spot => {
            const uid = this.extractUidFromMapUrl(spot.map_url);
            let mcCoords = null;
            if (spot.location && spot.location.lat && spot.location.lng) {
                mcCoords = this.wgs84ToBaiduMercator(spot.location.lat, spot.location.lng);
            } else if (spot.map_url) {
                const match = spot.map_url.match(/@([\d.]+),([\d.]+)/);
                if (match) {
                    mcCoords = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
                }
            }
            spotInfos.push({
                name: spot.name,
                uid: uid,
                mcCoords: mcCoords,
                location: spot.location
            });
        });

        if (spotInfos.length < 2) {
            alert('无法获取足够的景点信息');
            return;
        }

        this.designSmartRoute(spotInfos);
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
        const hasWaypoints = spotInfos.length > 2;
        const modal = document.createElement('div');
        modal.id = 'route-result-modal';
        modal.className = 'modal show';
        
        const travelModes = hasWaypoints ? ['driving'] : ['transit', 'riding', 'walking', 'driving'];
        const modeNames = { transit: '🚌 公共交通', riding: '🚲 骑行', walking: '🚶 步行', driving: '🚗 驾车' };
        const defaultMode = hasWaypoints ? 'driving' : 'transit';
        
        if (hasWaypoints) {
            modeNames.transit = '🚌 公共交通 (不支持途经点)';
            modeNames.riding = '🚲 骑行 (不支持途经点)';
            modeNames.walking = '🚶 步行 (不支持途经点)';
        }
        
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
                            <span>📋</span> 选择的景点（共${spotNames.length}个）${hasWaypoints ? '<span style="font-size: 0.85rem; color: var(--shanghai-gold); font-weight: normal; background: white; padding: 0.2rem 0.5rem; border: 1px solid var(--shanghai-gold);">含途经点</span>' : ''}
                        </h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
                            ${spotNames.map((name, index) => `
                                <div style="background: white; padding: 0.5rem 1rem; border: 2px solid ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="width: 24px; height: 24px; background: ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; color: ${index === 0 ? 'white' : 'var(--shanghai-dark)'}; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%; font-size: 0.85rem;">${index === 0 ? '起' : index === spotNames.length - 1 ? '终' : index}</span>
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
                                <button class="travel-mode-btn ${mode === defaultMode ? 'active' : ''}" data-mode="${mode}" style="flex: 1; min-width: 150px; padding: 1rem; background: ${mode === defaultMode ? 'linear-gradient(135deg, var(--shanghai-gold) 0%, var(--shanghai-navy) 100%)' : 'white'}; color: ${mode === defaultMode ? 'white' : 'var(--shanghai-dark)'}; border: 3px solid ${mode === defaultMode ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    ${modeNames[mode]}
                                </button>
                            `).join('')}
                        </div>
                        ${hasWaypoints ? '<p style="color: var(--shanghai-gold); font-size: 0.9rem; margin-top: 0.8rem; padding-left: 0.5rem;"><strong>提示：</strong>只有驾车模式支持途经点</p>' : ''}
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
        
        const selectedMode = { current: defaultMode };
        
        const travelModeBtns = modal.querySelectorAll('.travel-mode-btn');
        travelModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (hasWaypoints && mode !== 'driving') {
                    alert('只有驾车模式支持途经点，请选择驾车模式！');
                    return;
                }
                
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
            });
        });
        
        const openMapBtn = document.getElementById('open-map-btn');
        openMapBtn.addEventListener('click', () => {
            if (hasWaypoints && selectedMode.current !== 'driving') {
                alert('只有驾车模式支持途经点，请先选择驾车模式！');
                return;
            }
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

    designSmartRoute: async function(spotInfos) {
        const spotNames = spotInfos.map(s => s.name);
        this.showSmartRouteLoading(spotNames);
        
        this.optimizeRouteWithBaiduAPI(spotInfos)
            .then(optimizedSpots => {
                setTimeout(() => {
                    this.showSmartRouteResult(optimizedSpots);
                }, 800);
            })
            .catch(error => {
                console.error('智能路线规划失败:', error);
                alert('智能路线规划失败，请检查百度地图API配置或稍后重试');
                this.toggleSmartRouteMode();
            });
    },

    optimizeRouteWithBaiduAPI: async function(spotInfos) {
        if (!spotInfos || spotInfos.length < 2) {
            return spotInfos;
        }

        if (spotInfos.length === 2) {
            return spotInfos;
        }

        if (typeof BMap === 'undefined' || !BMap) {
            console.warn('百度地图API未加载，使用原始顺序');
            return spotInfos;
        }

        console.log('开始路线优化，景点数量:', spotInfos.length);
        console.log('BMap对象:', BMap);

        return new Promise((resolve) => {
            try {
                const points = spotInfos.map(spot => {
                    if (spot.location && spot.location.lng && spot.location.lat) {
                        const lng = spot.location.lng;
                        const lat = spot.location.lat;
                        console.log('使用经纬度坐标:', lat, lng);
                        return new BMap.Point(lng, lat);
                    }
                    return null;
                }).filter(p => p !== null);

                console.log('转换后的坐标点数量:', points.length);

                if (points.length < 2) {
                    console.warn('坐标信息不足，使用原始顺序');
                    resolve(spotInfos);
                    return;
                }

                const waypoints = points.slice(1, -1);
                const start = points[0];
                const end = points[points.length - 1];

                console.log('起点:', start);
                console.log('终点:', end);
                console.log('途经点数量:', waypoints.length);

                const optimizedSpots = [];
                
                const drivingRoute = new BMap.DrivingRoute("上海", {
                    renderOptions: { map: null, panel: null, autoViewport: false },
                    onSearchComplete: function(results) {
                        console.log('路线规划回调被调用');
                        console.log('API状态:', drivingRoute.getStatus());
                        console.log('结果对象:', results);
                        
                        if (drivingRoute.getStatus() === BMAP_STATUS_SUCCESS) {
                            console.log('路线规划成功');
                            console.log('路线数组:', results.Wl);
                            
                            if (results.Wl && results.Wl.length > 0) {
                                console.log('路线规划成功，优化景点顺序');
                                
                                const route = results.Wl[0];
                                console.log('路线对象:', route);
                                
                                if (route.steps && route.steps.length > 0) {
                                    const optimizedOrder = [0];
                                    
                                    for (let i = 0; i < route.steps.length; i++) {
                                        const step = route.steps[i];
                                        console.log('步骤', i, ':', step);
                                        if (step.waypoints && step.waypoints.length > 0) {
                                            step.waypoints.forEach(waypoint => {
                                                const wpIndex = points.findIndex(p => 
                                                    Math.abs(p.lng - waypoint.lng) < 0.0001 && 
                                                    Math.abs(p.lat - waypoint.lat) < 0.0001
                                                );
                                                console.log('找到途经点索引:', wpIndex);
                                                if (wpIndex > 0 && wpIndex < points.length - 1 && !optimizedOrder.includes(wpIndex)) {
                                                    optimizedOrder.push(wpIndex);
                                                }
                                            });
                                        }
                                    }
                                    
                                    optimizedOrder.push(points.length - 1);
                                    
                                    optimizedSpots.length = 0;
                                    optimizedOrder.forEach(index => {
                                        if (index >= 0 && index < spotInfos.length) {
                                            optimizedSpots.push(spotInfos[index]);
                                        }
                                    });
                                    
                                    console.log('优化后的景点顺序:', optimizedSpots.map(s => s.name));
                                }
                            }
                        }
                        
                        if (optimizedSpots.length > 0 && optimizedSpots.length === spotInfos.length) {
                            console.log('路线优化成功');
                            resolve(optimizedSpots);
                        } else {
                            console.warn('路线优化失败，使用原始顺序');
                            console.warn('优化后的景点数量:', optimizedSpots.length);
                            console.warn('原始景点数量:', spotInfos.length);
                            resolve(spotInfos);
                        }
                    }
                });

                console.log('开始搜索路线...');
                
                const waypointsStr = waypoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join('|');
                console.log('途经点字符串:', waypointsStr);
                
                drivingRoute.search(start, end, { waypoints: waypoints });
            } catch (error) {
                console.error('路线优化失败:', error);
                resolve(spotInfos);
            }
        });
    },

    showSmartRouteLoading: function(spotNames) {
        const modal = document.createElement('div');
        modal.id = 'smart-route-loading-modal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 4rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">🤖</div>
                    <h2 style="color: var(--shanghai-navy); margin-bottom: 1rem;">正在智能规划最优路线...</h2>
                    <p style="color: var(--shanghai-dark); font-size: 1.1rem;">
                        已选择 ${spotNames.length} 个景点：<br>
                        ${spotNames.join(' → ')}
                    </p>
                    <p style="color: #666; font-size: 0.95rem; margin-top: 1rem;">调用百度地图API计算最优路径...</p>
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

    showSmartRouteResult: function(spotInfos) {
        const loadingModal = document.getElementById('smart-route-loading-modal');
        if (loadingModal) {
            loadingModal.remove();
        }

        const spotNames = spotInfos.map(s => s.name);
        const hasWaypoints = spotInfos.length > 2;
        const modal = document.createElement('div');
        modal.id = 'smart-route-result-modal';
        modal.className = 'modal show';
        
        const travelModes = hasWaypoints ? ['driving'] : ['transit', 'riding', 'walking', 'driving'];
        const modeNames = { transit: '🚌 公共交通', riding: '🚲 骑行', walking: '🚶 步行', driving: '🚗 驾车' };
        const defaultMode = hasWaypoints ? 'driving' : 'transit';
        
        if (hasWaypoints) {
            modeNames.transit = '🚌 公共交通 (不支持途经点)';
            modeNames.riding = '🚲 骑行 (不支持途经点)';
            modeNames.walking = '🚶 步行 (不支持途经点)';
        }
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 1000px;">
                <button class="modal-close" id="smart-route-modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-header">
                        <h2>🤖 智能路线规划结果</h2>
                    </div>
                    
                    <div style="background: var(--shanghai-cream); padding: 1.5rem; border: 1px solid var(--shanghai-light); margin-bottom: 1.5rem;">
                        <h3 style="color: var(--shanghai-navy); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>📋</span> 选择的景点（共${spotNames.length}个）${hasWaypoints ? '<span style="font-size: 0.85rem; color: var(--shanghai-gold); font-weight: normal; background: white; padding: 0.2rem 0.5rem; border: 1px solid var(--shanghai-gold);">含途经点</span>' : ''}
                        </h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
                            ${spotNames.map((name, index) => `
                                <div style="background: white; padding: 0.5rem 1rem; border: 2px solid ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="width: 24px; height: 24px; background: ${index === 0 ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; color: ${index === 0 ? 'white' : 'var(--shanghai-dark)'}; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%; font-size: 0.85rem;">${index === 0 ? '起' : index === spotNames.length - 1 ? '终' : index}</span>
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
                                <button class="travel-mode-btn ${mode === defaultMode ? 'active' : ''}" data-mode="${mode}" style="flex: 1; min-width: 150px; padding: 1rem; background: ${mode === defaultMode ? 'linear-gradient(135deg, var(--shanghai-gold) 0%, var(--shanghai-navy) 100%)' : 'white'}; color: ${mode === defaultMode ? 'white' : 'var(--shanghai-dark)'}; border: 3px solid ${mode === defaultMode ? 'var(--shanghai-gold)' : 'var(--shanghai-light)'}; border-radius: 0; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    ${modeNames[mode]}
                                </button>
                            `).join('')}
                        </div>
                        ${hasWaypoints ? '<p style="color: var(--shanghai-gold); font-size: 0.9rem; margin-top: 0.8rem; padding-left: 0.5rem;"><strong>提示：</strong>只有驾车模式支持途经点</p>' : ''}
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button id="smart-open-map-btn" class="confirm-route-btn" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
                            🗺️ 在百度地图中查看详细路线
                        </button>
                        <button id="close-smart-route-modal-btn" class="cancel-route-btn" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const selectedMode = { current: defaultMode };
        
        const travelModeBtns = modal.querySelectorAll('.travel-mode-btn');
        travelModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (hasWaypoints && mode !== 'driving') {
                    alert('只有驾车模式支持途经点，请选择驾车模式！');
                    return;
                }
                
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
            });
        });
        
        const openMapBtn = document.getElementById('smart-open-map-btn');
        openMapBtn.addEventListener('click', () => {
            if (hasWaypoints && selectedMode.current !== 'driving') {
                alert('只有驾车模式支持途经点，请先选择驾车模式！');
                return;
            }
            this.openBaiduMapWithSpots(spotInfos, selectedMode.current);
        });
        
        const closeBtn = document.getElementById('smart-route-modal-close');
        const closeModalBtn = document.getElementById('close-smart-route-modal-btn');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            this.toggleSmartRouteMode();
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    },

    openBaiduMapWithSpots: function(spotInfos, mode) {
        if (spotInfos.length >= 2) {
            const hasWaypoints = spotInfos.length > 2;
            const origin = spotInfos[0];
            const dest = spotInfos[spotInfos.length - 1];
            const waypoints = spotInfos.slice(1, spotInfos.length - 1);
            
            const pathParts = [encodeURIComponent(origin.name)];
            waypoints.forEach(wp => pathParts.push(encodeURIComponent(wp.name)));
            pathParts.push(encodeURIComponent(dest.name));
            
            let centerX = 0;
            let centerY = 0;
            
            const allMcCoords = spotInfos.filter(s => s.mcCoords).map(s => s.mcCoords);
            if (allMcCoords.length >= 2) {
                const minX = Math.min(...allMcCoords.map(c => c.x));
                const maxX = Math.max(...allMcCoords.map(c => c.x));
                const minY = Math.min(...allMcCoords.map(c => c.y));
                const maxY = Math.max(...allMcCoords.map(c => c.y));
                centerX = (minX + maxX) / 2;
                centerY = (minY + maxY) / 2;
            } else if (origin.mcCoords) {
                centerX = origin.mcCoords.x;
                centerY = origin.mcCoords.y;
            } else {
                centerX = 13523879.89;
                centerY = 3641052.94;
            }
            
            let mapUrl = `https://map.baidu.com/dir/${pathParts.join('/')}/@${centerX.toFixed(6)},${centerY.toFixed(6)},13z?`;
            
            const queryParams = [];
            
            if (hasWaypoints) {
                queryParams.push('querytype=nav');
                queryParams.push('c=289');
                
                if (origin.mcCoords) {
                    const snParam = `sn=1$$$$${origin.mcCoords.x.toFixed(2)},${origin.mcCoords.y.toFixed(2)}$$${encodeURIComponent(origin.name)}$$0$$$$`;
                    queryParams.push(snParam);
                }
                
                if (dest.uid && dest.mcCoords) {
                    let enParts = [];
                    
                    if (waypoints.length > 0) {
                        const firstWp = waypoints[0];
                        const firstWpUid = firstWp.uid || 'undefined';
                        const firstWpCoords = firstWp.mcCoords ? `${firstWp.mcCoords.x.toFixed(2)},${firstWp.mcCoords.y.toFixed(2)}` : '';
                        enParts.push(`2$$${firstWpUid}$$${firstWpCoords}$$${encodeURIComponent(firstWp.name)}$$0$$$$$$`);
                        
                        for (let i = 1; i < waypoints.length; i++) {
                            const wp = waypoints[i];
                            const uid = wp.uid || 'undefined';
                            const coords = wp.mcCoords ? `${wp.mcCoords.x.toFixed(2)},${wp.mcCoords.y.toFixed(2)}` : '';
                            enParts.push(`1$$%20to:2$$${uid}$$${coords}$$${encodeURIComponent(wp.name)}$$0$$$$$$`);
                        }
                    }
                    
                    const destUid = dest.uid || 'undefined';
                    const destCoords = dest.mcCoords ? `${dest.mcCoords.x.toFixed(2)},${dest.mcCoords.y.toFixed(2)}` : '';
                    enParts.push(`1$$%20to:0$$${destUid}$$${destCoords}$$${encodeURIComponent(dest.name)}$$$$$$`);
                    
                    const enParam = `en=${enParts.join('')}`;
                    queryParams.push(enParam);
                    
                    const ecParts = ['289'];
                    waypoints.forEach(() => ecParts.push('289'));
                    queryParams.push(`ec=${ecParts.join('+to:')}`);
                } else {
                    queryParams.push('sc=289');
                    const ecParts = ['289'];
                    waypoints.forEach(() => ecParts.push('289'));
                    queryParams.push(`ec=${ecParts.join('+to:')}`);
                }
                queryParams.push('pn=0');
                queryParams.push('rn=5');
                queryParams.push('mrs=0');
                queryParams.push('version=4');
                queryParams.push('route_traffic=1');
                queryParams.push('sy=0');
                queryParams.push('da_src=shareurl');
            } else {
                queryParams.push('querytype=bt');
                queryParams.push('bttp=0');
                queryParams.push('c=289');
                queryParams.push('sy=0');
                
                if (dest.uid && dest.mcCoords) {
                    const enParam = `en=1$$${dest.uid}$$${dest.mcCoords.x.toFixed(2)},${dest.mcCoords.y.toFixed(2)}$$${encodeURIComponent(dest.name)}$$$$$$`;
                    queryParams.push(enParam);
                }
                
                if (origin.uid && origin.mcCoords) {
                    const snParam = `sn=0$$${origin.uid}$$${origin.mcCoords.x.toFixed(6)},${origin.mcCoords.y.toFixed(6)}$$${encodeURIComponent(origin.name)}$$$$$$`;
                    queryParams.push(snParam);
                }
                
                queryParams.push(`sq=${encodeURIComponent(dest.name)}`);
                queryParams.push(`eq=${encodeURIComponent(origin.name)}`);
                queryParams.push('exptype=dep');
                queryParams.push('version=5');
                queryParams.push('da_src=shareurl');
            }
            
            mapUrl += queryParams.join('&');
            
            window.open(mapUrl, '_blank');
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
