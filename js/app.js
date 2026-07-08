// ============== 主应用逻辑 ==============
const App = {
    data: null,
    role: null,           // 'provider' | 'tencent'
    isAdmin: false,       // 仅当 role==='tencent' 且登录成功时为 true
    currentPage: 'home',
    currentRuleCat: 'qualify',
    currentHomeRuleCat: 'qualify',
    currentBbxFilter: 'apparel',
    currentNoticeFilter: 'all',
    currentToolFilter: 'all',
    currentTicketFilter: 'active',
    noticeSearch: '',
    editNoticeId: null,
    editRuleId: null,
    editToolId: null,
    editTicketId: null,
    currentTicketDetailId: null,
    currentNoticeDetailId: null,
    editBbxId: null,

    // 工具方法
    escapeHtml(s) { return escapeHtml(s); },
    escapeAttr(s) { return escapeAttr(s); },
    formatTime() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    // 初始化
    init() {
        this.data = DataStore.load();
        this.loadCustomCategories();
        this.bindRoleSelect();
        this.bindLogin();
        this.bindNav();
        this.bindGlobal();
        this.bindNoticePage();
        this.bindHomeRulesTabs();
        this.bindBaibaoxiangPage();
        this.bindToolPage();
        this.bindTicketPage();
        this.bindTagChips();
        this.renderCategoryCards();
    },

    // ============== 身份选择 ==============
    bindRoleSelect() {
        document.querySelectorAll('#roleModal .role-option').forEach(el => {
            el.addEventListener('click', () => {
                const r = el.dataset.role;
                this.enterAsRole(r);
            });
        });
    },

    enterAsRole(role) {
        this.role = role;
        document.getElementById('roleModal').style.display = 'none';
        if (role === 'provider') {
            // 服务商：直接进入主页（只读）
            this.isAdmin = false;
            this.showWorkspace();
            document.getElementById('userAvatar').textContent = '服';
            document.getElementById('userName').textContent = '服务商';
            document.getElementById('brandSub').textContent = 'Service Provider · 只读模式';
            document.getElementById('ticketPageDesc').textContent = '提交需求申请，查看处理进度';
            this.toast('已以服务商身份进入（只读模式）', 'success');
        } else if (role === 'tencent') {
            // 腾讯员工：进入登录页
            document.getElementById('loginModal').style.display = 'flex';
        }
    },

    showWorkspace() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('topbar').style.display = 'flex';
        document.getElementById('main').style.display = 'block';
        this.renderCategoryCards();
        this.applyRoleUI();
        this.refreshHome();
        this.applyRoleUI();
    },

    // 根据角色显示/隐藏管理类按钮
    applyRoleUI() {
        const showAdmin = this.isAdmin;
        // .admin-only 是页面里的"管理操作按钮"（+发布/新增/添加/提交工单除外）
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = showAdmin ? 'inline-flex' : 'none';
        });
        // .admin-only-btn 是弹窗内的管理按钮（编辑/删除/标记完成等）
        document.querySelectorAll('.admin-only-btn').forEach(el => {
            el.style.display = 'none';
        });
    },

    // ============== 登录 ==============
    bindLogin() {
        const btnLogin = document.getElementById('btnLogin');
        const handleLogin = () => {
            const u = document.getElementById('loginUser').value.trim();
            const p = document.getElementById('loginPwd').value.trim();
            if (u === ADMIN_ACCOUNT.username && p === ADMIN_ACCOUNT.password) {
                this.isAdmin = true;
                this.showWorkspace();
                document.getElementById('userAvatar').textContent = 'A';
                document.getElementById('userName').textContent = '管理员';
                document.getElementById('brandSub').textContent = 'Tencent Admin Console';
                document.getElementById('ticketPageDesc').textContent = '服务商需求申请与处理';
                this.toast('登录成功，欢迎管理员', 'success');
            } else {
                const err = document.getElementById('loginError');
                err.style.display = 'block';
                setTimeout(() => err.style.display = 'none', 2500);
            }
        };
        btnLogin.addEventListener('click', handleLogin);
        document.getElementById('loginPwd').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleLogin();
        });
        document.getElementById('btnBackToRole').addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('roleModal').style.display = 'flex';
        });
        document.getElementById('btnLogout').addEventListener('click', () => {
            this.isAdmin = false;
            this.role = null;
            document.getElementById('topbar').style.display = 'none';
            document.getElementById('main').style.display = 'none';
            document.getElementById('roleModal').style.display = 'flex';
        });
    },

    // ============== 全局导航 ==============
    bindNav() {
        document.querySelectorAll('.topbar-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.goTo(item.dataset.tab);
            });
        });
        document.querySelectorAll('[data-go]').forEach(el => {
            el.addEventListener('click', e => {
                const t = el.dataset.go;
                if (!t) return;
                // 在首页内：用 data-go 作为 subnav 切换对应板块
                if (el.classList.contains('subnav-item') && el.closest('.subnav')) {
                    this.switchHomeSection(t);
                    return;
                }
                this.goTo(t, el);
            });
        });
    },

    switchHomeSection(target) {
        // 切换 subnav 高亮
        document.querySelectorAll('.subnav .subnav-item').forEach(it => {
            it.classList.toggle('active', it.dataset.go === target);
        });
        // 切换首页内的 sub-block 显隐
        const blocks = document.querySelectorAll('.page-home .home-section-block');
        blocks.forEach(b => {
            b.style.display = (b.dataset.section === target) ? '' : 'none';
        });
    },

    bindGlobal() {
        document.addEventListener('click', e => {
            if (e.target.matches('[data-close]') || e.target.classList.contains('modal-mask')) {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            }
        });
    },

    goTo(page, e) {
        // 服务商不允许访问数据看板
        if (page === 'dashboard' && !this.isAdmin) return;
        // 如果带 bbxfilter（来自首页内"全部"链接），先切换行业
        if (page === 'baibaoxiang' && e && e.dataset && e.dataset.bbxfilter) {
            this.currentBbxFilter = e.dataset.bbxfilter;
        }
        this.currentPage = page;
        document.querySelectorAll('.topbar-nav .nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.tab === page);
        });
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.dataset.page === page);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (page === 'home') this.refreshHome();
        if (page === 'notice') this.refreshNotice();
        if (page === 'baibaoxiang') this.refreshBaibaoxiang();
        if (page === 'tool') this.refreshTool();
        if (page === 'ticket') this.refreshTicket();
        if (page === 'dashboard') this.refreshDashboard();
    },

    refreshHome() {
        // 工单红点（管理员才显示）
        const pending = this.data.tickets.filter(t => t.status === 'pending').length;
        const badge = document.getElementById('ticketBadge');
        if (this.isAdmin && pending > 0) {
            badge.style.display = 'inline-flex';
            badge.textContent = pending;
        } else {
            badge.style.display = 'none';
        }
        // 最新通知列表（只显示标题，点击跳转详情）
        const list = document.getElementById('homeNoticeList');
        const items = [...this.data.notices].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 5);
        if (items.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>暂无通知</p></div>';
        } else {
            list.innerHTML = items.map(n => `
                <div class="home-notice-row" data-id="${n.id}">
                    <span class="home-notice-tag ${n.pinned ? 'tag-pinned' : ''}">${n.pinned ? '置顶' : '通知'}</span>
                    <span class="home-notice-title">${this.escapeHtml(n.title)}</span>
                    <span class="home-notice-time">${(n.createdAt || '').slice(5)}</span>
                </div>
            `).join('');
            list.querySelectorAll('.home-notice-row').forEach(el => {
                el.addEventListener('click', () => this.openNoticeDetail(el.dataset.id));
            });
        }
        // 板块1：常用工具（首页快速入口，紧凑展示）
        this.renderHomeToolQuick();
        // 第二板块：必读信息（按板块分类，带 tabs 切换）
        this.renderHomeRules();
        // 板块 2：百宝箱（按行业一个模块一个模块展示必读）
        this.renderHomeBbx();
        // 板块 3：工具中心（最常用的几个工具卡片 + 全部）
        this.renderHomeTool();
        // 板块 4：工单中心（进行中的工单窗格 + 全部）
        this.renderHomeTicket();
        // Banner 自动轮播
        this.startBannerRotate();
        this.applyRoleUI();
    },

    renderHomeBbx() {
        const wrap = document.getElementById('homeBbxWrap');
        if (!wrap) return;
        // 仅展示有必读文档的行业
        const groups = Object.keys(BBX_CATEGORIES).map(key => {
            const items = (this.data.baibaoxiang || []).filter(b => b.category === key && b.mustRead);
            return { key, name: BBX_CATEGORIES[key].name, items };
        }).filter(g => g.items.length > 0);
        if (groups.length === 0) {
            wrap.innerHTML = '<div class="empty-state" style="padding:30px;"><div class="empty-icon"></div><p>暂无必读文档</p></div>';
            return;
        }
        // 每个行业窗格只显示前 3 条必读，避免过高
        wrap.innerHTML = groups.map(g => `
            <div class="home-bbx-module">
                <div class="home-bbx-module-head">
                    <div class="home-bbx-module-title">${this.escapeHtml(g.name)}</div>
                    <a class="home-bbx-module-link" data-go="baibaoxiang" data-bbxfilter="${g.key}">全部 →</a>
                </div>
                <div class="home-bbx-module-list">
                    ${g.items.slice(0, 3).map(b => `
                        <a class="home-bbx-module-item" href="${this.escapeAttr(b.url)}" target="_blank" rel="noopener" title="${this.escapeAttr(b.name)}">
                            ${this.escapeHtml(b.name)}
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');
        // 给"全部"链接绑定点击事件
        wrap.querySelectorAll('.home-bbx-module-link').forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                const t = el.dataset.go;
                this.goTo(t, el);
            });
        });
    },

    renderHomeTool() {
        const grid = document.getElementById('homeToolGrid');
        if (!grid) return;
        // 最常用：取前 4 个工具（百宝箱/工具中心专用卡片）
        const items = (this.data.tools || []).slice(0, 8);
        if (items.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>暂无工具</p></div>';
            return;
        }
        grid.innerHTML = items.map(t => `
            <a class="home-tool-item" href="${this.escapeAttr(t.url)}" target="_blank" rel="noopener">
                <div class="home-tool-icon home-tool-icon-blue">${this.escapeHtml((t.name || '?').charAt(0))}</div>
                <div class="home-tool-name">${this.escapeHtml(t.name)}</div>
            </a>
        `).join('');
    },

    renderHomeTicket() {
        const grid = document.getElementById('homeTicketGrid');
        if (!grid) return;
        // 进行中：待处理 + 处理中，按状态和时间排序
        const items = (this.data.tickets || [])
            .filter(t => t.status === 'pending' || t.status === 'processing')
            .sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return (b.createdAt || '').localeCompare(a.createdAt || '');
            });
        if (items.length === 0) {
            grid.innerHTML = '<div class="home-ticket-cell-empty">暂无进行中的工单</div>';
            return;
        }
        grid.innerHTML = items.map(t => `
            <div class="home-ticket-cell" data-id="${t.id}">
                <div class="home-ticket-cell-head">
                    <span class="home-ticket-cell-id">${this.escapeHtml(t.id)}</span>
                    <span class="status-tag status-${t.status}">${(TICKET_STATUS[t.status] || {}).name || t.status}</span>
                </div>
                <div class="home-ticket-cell-provider">${this.escapeHtml(t.provider)}</div>
                <div class="home-ticket-cell-desc">${this.escapeHtml(t.desc || '')}</div>
            </div>
        `).join('');
        grid.querySelectorAll('.home-ticket-cell').forEach(el => {
            el.addEventListener('click', () => this.openTicketDetail(el.dataset.id));
        });
    },

    renderHomeRules() {
        // 首页内的「必读信息」按 cat 分类展示（带 tabs 切换）
        const list = document.getElementById('homeRulesList');
        if (!list) return;
        const cat = this.currentHomeRuleCat || 'qualify';
        const items = (this.data.rules || []).filter(r => r.category === cat);
        if (items.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>该板块暂无内容</p></div>';
            return;
        }
        list.innerHTML = items.map(r => this.ruleItemHtml(r)).join('');
        list.querySelectorAll('.rule-item').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.closest('.item-del-btn')) return;
                this.openRuleDetail(el.dataset.id);
            });
        });
        list.querySelectorAll('.item-del-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.confirmDeleteRule(btn.dataset.id);
            });
        });
    },

    renderHomeToolQuick() {
        // 首页常用工具快速入口（紧凑小卡片，2 行 4 列）
        const grid = document.getElementById('homeToolGridQuick');
        if (!grid) return;
        const items = (this.data.tools || []).slice(0, 8);
        if (items.length === 0) {
            grid.innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-icon"></div><p>暂无工具</p></div>';
            return;
        }
        grid.innerHTML = items.map(t => `
            <a class="home-tool-item" href="${this.escapeAttr(t.url)}" target="_blank" rel="noopener">
                <div class="home-tool-icon home-tool-icon-blue">${this.escapeHtml((t.name || '?').charAt(0))}</div>
                <div class="home-tool-name">${this.escapeHtml(t.name)}</div>
            </a>
        `).join('');
    },

    // Banner 自动轮播（带 3 个简单占位图）
    startBannerRotate() {
        const slides = document.querySelectorAll('#homeBanner .home-banner-slide');
        const dots = document.getElementById('homeBannerDots');
        if (slides.length <= 1) return;
        if (dots && !dots.children.length) {
            slides.forEach((_, i) => {
                const d = document.createElement('span');
                d.className = 'home-banner-dot' + (i === 0 ? ' active' : '');
                d.addEventListener('click', () => this.showBannerSlide(i));
                dots.appendChild(d);
            });
        }
        clearInterval(this._bannerTimer);
        let idx = 0;
        this._bannerTimer = setInterval(() => {
            idx = (idx + 1) % slides.length;
            this.showBannerSlide(idx);
        }, 5000);
    },
    showBannerSlide(idx) {
        const slides = document.querySelectorAll('#homeBanner .home-banner-slide');
        const dots = document.querySelectorAll('#homeBanner .home-banner-dot');
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    },

    // ============== 通知板块 ==============
    bindNoticePage() {
        document.getElementById('btnAddNotice').addEventListener('click', () => this.openNoticeModal());
        document.getElementById('btnSaveNotice').addEventListener('click', () => this.saveNotice());

        document.querySelectorAll('#noticeFilterTabs .filter-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('#noticeFilterTabs .filter-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.currentNoticeFilter = t.dataset.filter;
                this.refreshNotice();
            });
        });

        document.getElementById('noticeSearch').addEventListener('input', e => {
            this.noticeSearch = e.target.value.trim().toLowerCase();
            this.refreshNotice();
        });
    },

    refreshNotice() {
        let items = [...this.data.notices];
        if (this.currentNoticeFilter === 'pinned') items = items.filter(n => n.pinned);
        if (this.currentNoticeFilter === 'normal') items = items.filter(n => !n.pinned);
        if (this.noticeSearch) {
            items = items.filter(n =>
                (n.title || '').toLowerCase().includes(this.noticeSearch) ||
                (n.content || '').toLowerCase().includes(this.noticeSearch)
            );
        }
        items.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        const list = document.getElementById('noticeList');
        const empty = document.getElementById('noticeEmpty');
        if (items.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            list.innerHTML = items.map(n => this.noticeItemHtml(n)).join('');
            list.querySelectorAll('.notice-item').forEach(el => {
                el.addEventListener('click', e => {
                    if (e.target.closest('.item-del-btn')) return;
                    this.openNoticeDetail(el.dataset.id);
                });
            });
            list.querySelectorAll('.item-del-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.confirmDeleteNotice(btn.dataset.id);
                });
            });
        }
        // 同步刷新内嵌的规则板块
        this.refreshNoticeRuleSection();
        this.applyRoleUI();
    },

    noticeItemHtml(n) {
        const pinnedTag = n.pinned ? '<span class="tag tag-pinned">置顶</span>' : '';
        const catTag = `<span class="tag ${categoryTagClass(n.category)}">${categoryLabel(n.category)}</span>`;
        const iconChar = n.pinned ? '!' : '通';
        const delBtn = this.isAdmin ? '<button class="item-del-btn" data-id="' + n.id + '" title="删除通知">🗑</button>' : '';
        return `
        <div class="notice-item ${n.pinned ? 'pinned' : ''}" data-id="${n.id}">
            ${delBtn}
            <div class="notice-icon">${iconChar}</div>
            <div class="notice-body">
                <div class="notice-title">${escapeHtml(n.title)} ${pinnedTag} ${catTag}</div>
                <div class="notice-preview">${escapeHtml(n.content || '')}</div>
                <div class="notice-meta">
                    <span>${escapeHtml(n.author || '管理员')}</span>
                    <span class="meta-time">${escapeHtml(n.createdAt || '')}</span>
                    <span class="meta-views admin-only">${n.views || 0} 次查看</span>
                </div>
            </div>
        </div>`;
    },

    openNoticeModal(id) {
        if (!this.isAdmin) return;
        this.editNoticeId = id || null;
        const modal = document.getElementById('noticeModal');
        const title = document.getElementById('noticeModalTitle');
        const btn = document.getElementById('btnSaveNotice');
        if (id) {
            const n = this.data.notices.find(x => x.id === id);
            title.textContent = '编辑通知';
            btn.textContent = '保存';
            document.getElementById('noticeTitle').value = n.title;
            document.getElementById('noticeCategory').value = n.category;
            document.getElementById('noticeContent').value = n.content;
            document.getElementById('noticePinned').checked = !!n.pinned;
        } else {
            title.textContent = '发布通知';
            btn.textContent = '发布';
            document.getElementById('noticeTitle').value = '';
            document.getElementById('noticeCategory').value = 'system';
            document.getElementById('noticeContent').value = '';
            document.getElementById('noticePinned').checked = false;
        }
        modal.style.display = 'flex';
    },

    saveNotice() {
        if (!this.isAdmin) return;
        const title = document.getElementById('noticeTitle').value.trim();
        const content = document.getElementById('noticeContent').value.trim();
        if (!title) return this.toast('请输入通知标题', 'error');
        if (!content) return this.toast('请输入通知内容', 'error');
        const category = document.getElementById('noticeCategory').value;
        const pinned = document.getElementById('noticePinned').checked;
        if (this.editNoticeId) {
            const n = this.data.notices.find(x => x.id === this.editNoticeId);
            Object.assign(n, { title, content, category, pinned, updatedAt: nowStr() });
        } else {
            this.data.notices.unshift({
                id: genId('n'),
                title, content, category, pinned,
                author: '管理员',
                createdAt: nowStr(),
                updatedAt: nowStr()
            });
        }
        DataStore.save(this.data);
        this.closeModal('noticeModal');
        this.refreshNotice();
        this.refreshHome();
        this.toast(this.editNoticeId ? '通知已更新' : '通知已发布', 'success');
    },

    openNoticeDetail(id) {
        const n = this.data.notices.find(x => x.id === id);
        if (!n) return;
        this.currentNoticeDetailId = id;
        document.getElementById('noticeDetailTitle').textContent = n.title;
        const body = document.getElementById('noticeDetailBody');
        const pinnedTag = n.pinned ? '<span class="tag tag-pinned">置顶</span>' : '';
        const catTag = `<span class="tag ${categoryTagClass(n.category)}">${categoryLabel(n.category)}</span>`;
        body.innerHTML = `
            <div class="detail-meta">
                <span>${catTag}</span>
                ${pinnedTag}
                <span>发布人：${escapeHtml(n.author || '管理员')}</span>
                <span>发布时间：${escapeHtml(n.createdAt || '')}</span>
                <span class="meta-views admin-only">${n.views || 0} 次查看</span>
                ${n.updatedAt && n.updatedAt !== n.createdAt ? `<span>更新时间：${escapeHtml(n.updatedAt)}</span>` : ''}
            </div>
            <div class="detail-content">${escapeHtml(n.content || '')}</div>`;
        const btnEdit = document.getElementById('btnEditNoticeFromDetail');
        const btnDel = document.getElementById('btnDeleteNoticeFromDetail');
        if (this.isAdmin) {
            btnEdit.style.display = 'inline-flex';
            btnDel.style.display = 'inline-flex';
        } else {
            btnEdit.style.display = 'none';
            btnDel.style.display = 'none';
        }
        document.getElementById('noticeDetailModal').style.display = 'flex';
        this.recordView('notice', id);
    },

    // 记录查看次数（防刷：同一会话同一内容只+1）
    recordView(type, id) {
        const key = 'viewed_' + type + '_' + id;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        const arr = type === 'notice' ? this.data.notices : this.data.rules;
        const item = arr.find(x => x.id === id);
        if (!item) return;
        item.views = (item.views || 0) + 1;
        item.viewLogs = item.viewLogs || [];
        item.viewLogs.push({ time: nowStr(), role: this.role || 'unknown' });
        DataStore.save(this.data);
    },

    deleteNotice() {
        if (!this.isAdmin) return;
        if (!this.currentNoticeDetailId) return;
        const id = this.currentNoticeDetailId;
        const n = this.data.notices.find(x => x.id === id);
        this._pendingDelete = { type: 'notice', id };
        this.openConfirmModal({
            title: '删除通知',
            message: `确认删除通知「${n ? escapeHtml(n.title) : ''}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.notices = this.data.notices.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.closeModal('noticeDetailModal');
                this.refreshNotice();
                this.refreshHome();
                this.toast('通知已删除', 'success');
            }
        });
    },

    confirmDeleteNotice(id) {
        if (!this.isAdmin) return;
        const n = this.data.notices.find(x => x.id === id);
        if (!n) return;
        this._pendingDelete = { type: 'notice', id };
        this.openConfirmModal({
            title: '删除通知',
            message: `确认删除通知「${escapeHtml(n.title)}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.notices = this.data.notices.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.refreshNotice();
                this.refreshHome();
                this.toast('通知已删除', 'success');
            }
        });
    },

    // ============== 规则板块 ==============
    // ============== 首页「必读信息」Tabs ==============
    bindHomeRulesTabs() {
        document.querySelectorAll('#homeRulesTabs .home-rules-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('#homeRulesTabs .home-rules-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.currentHomeRuleCat = t.dataset.cat;
                this.renderHomeRules();
            });
        });
        // 通知页内嵌的规则板块
        document.querySelectorAll('#noticeRuleCategories .cat-card[data-cat]').forEach(c => {
            c.addEventListener('click', () => {
                document.querySelectorAll('#noticeRuleCategories .cat-card').forEach(x => x.classList.remove('active'));
                c.classList.add('active');
                this.currentRuleCat = c.dataset.cat;
                this.refreshNoticeRuleSection();
            });
        });
        // 新增板块/新增内容按钮（通知页内）
        const btnAddCategory = document.getElementById('btnAddCategory');
        if (btnAddCategory) btnAddCategory.addEventListener('click', () => this.openCategoryModal());
        const btnAddRule = document.getElementById('btnAddRule');
        if (btnAddRule) btnAddRule.addEventListener('click', () => this.openRuleModal());
        const btnEditRule = document.getElementById('btnEditRule');
        if (btnEditRule) btnEditRule.addEventListener('click', () => {
            if (this.editRuleId) this.openRuleModal(this.editRuleId);
        });
        const btnDeleteRule = document.getElementById('btnDeleteRule');
        if (btnDeleteRule) btnDeleteRule.addEventListener('click', () => this.deleteRule());
    },

    refreshNoticeRuleSection() {
        const cat = this.currentRuleCat;
        const catInfo = RULE_CATEGORIES[cat] || { name: cat };
        document.getElementById('noticeRulePanelTitle').textContent = catInfo.name;
        const items = this.data.rules.filter(r => r.category === cat)
            .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        const list = document.getElementById('noticeRuleList');
        const empty = document.getElementById('noticeRuleEmpty');
        if (items.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            list.innerHTML = items.map(r => this.ruleItemHtml(r)).join('');
            list.querySelectorAll('.rule-item').forEach(el => {
                el.addEventListener('click', e => {
                    if (e.target.closest('.item-del-btn')) return;
                    this.openRuleDetail(el.dataset.id);
                });
            });
            list.querySelectorAll('.item-del-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.confirmDeleteRule(btn.dataset.id);
                });
            });
        }
        this.applyRoleUI();
    },

    // ============== 百宝箱 ==============
    bindBaibaoxiangPage() {
        document.querySelectorAll('#bbxFilterTabs .filter-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('#bbxFilterTabs .filter-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.currentBbxFilter = t.dataset.bbxfilter;
                this.renderBaibaoxiang();
            });
        });
        const btnAdd = document.getElementById('btnAddBaibaoxiang');
        if (btnAdd) btnAdd.addEventListener('click', () => this.openBbxModal());
        const btnSave = document.getElementById('btnSaveBbx');
        if (btnSave) btnSave.addEventListener('click', () => this.saveBbx());
    },

    refreshBaibaoxiang() {
        this.renderBaibaoxiang();
    },

    renderBaibaoxiang() {
        const cat = this.currentBbxFilter || 'apparel';
        const catInfo = BBX_CATEGORIES[cat] || { name: cat };
        const sectionTitle = document.getElementById('bbxSectionTitle');
        if (sectionTitle) sectionTitle.textContent = catInfo.name + ' · 必读文档';
        const list = document.getElementById('bbxGrid');
        const empty = document.getElementById('bbxEmpty');
        // 只展示当前行业下"必读"的文档
        const items = (this.data.baibaoxiang || []).filter(b => b.category === cat && b.mustRead);
        if (items.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
            const txt = document.getElementById('bbxEmptyText');
            if (txt) txt.textContent = '该行业暂无「必读」文档';
        } else {
            empty.style.display = 'none';
            list.innerHTML = items.map(b => `
                <a class="bbx-card bbx-card-must" href="${this.escapeAttr(b.url)}" target="_blank" rel="noopener" data-id="${b.id}">
                    ${this.isAdmin ? '<button class="item-del-btn bbx-del" data-id="' + b.id + '" title="删除链接">🗑</button>' : ''}
                    <div class="bbx-card-icon">${this.escapeHtml((b.name || '?').charAt(0))}</div>
                    <div class="bbx-card-body">
                        <div class="bbx-card-title">
                            <span class="bbx-must-flag">必读</span>
                            ${this.escapeHtml(b.name)}
                        </div>
                        <div class="bbx-card-desc">${this.escapeHtml(b.desc || '')}</div>
                    </div>
                    <div class="bbx-card-arrow">→</div>
                </a>
            `).join('');
            // 阻止删除按钮触发跳转
            list.querySelectorAll('.bbx-del').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.confirmDeleteBbx(btn.dataset.id);
                });
            });
        }
        this.applyRoleUI();
    },

    openBbxModal(id) {
        this.editBbxId = id || null;
        document.getElementById('bbxModalTitle').textContent = id ? '编辑链接' : '新增链接';
        const item = id ? this.data.baibaoxiang.find(b => b.id === id) : null;
        document.getElementById('bbxName').value = item ? item.name : '';
        document.getElementById('bbxCategory').value = item ? item.category : (this.currentBbxFilter || 'apparel');
        document.getElementById('bbxUrl').value = item ? item.url : '';
        document.getElementById('bbxDesc').value = item ? item.desc : '';
        document.getElementById('bbxMustRead').checked = item ? !!item.mustRead : true;
        document.getElementById('bbxModal').style.display = 'flex';
    },

    saveBbx() {
        const name = document.getElementById('bbxName').value.trim();
        const category = document.getElementById('bbxCategory').value;
        const url = document.getElementById('bbxUrl').value.trim();
        const desc = document.getElementById('bbxDesc').value.trim();
        const mustRead = document.getElementById('bbxMustRead').checked;
        if (!name) return this.toast('请输入链接名称', 'error');
        if (!url) return this.toast('请输入跳转链接', 'error');
        if (!this.data.baibaoxiang) this.data.baibaoxiang = [];
        if (this.editBbxId) {
            const b = this.data.baibaoxiang.find(x => x.id === this.editBbxId);
            if (b) Object.assign(b, { name, category, url, desc, mustRead });
        } else {
            this.data.baibaoxiang.push({
                id: 'bbx_' + Date.now().toString(36),
                name, category, url, desc, mustRead,
                author: '管理员',
                createdAt: this.formatTime()
            });
        }
        DataStore.save(this.data);
        document.getElementById('bbxModal').style.display = 'none';
        this.toast(this.editBbxId ? '已更新' : '已新增', 'success');
        this.currentBbxFilter = category;
        this.renderBaibaoxiang();
    },

    confirmDeleteBbx(id) {
        this.openConfirmModal({
            title: '删除链接',
            message: '确定要删除这个链接吗？此操作不可恢复。',
            danger: true,
            onConfirm: () => {
                this.data.baibaoxiang = (this.data.baibaoxiang || []).filter(b => b.id !== id);
                DataStore.save(this.data);
                this.renderBaibaoxiang();
                this.toast('已删除', 'success');
            }
        });
    },

    // ============== 规则（保留原方法，rule 列表渲染在通知页内嵌使用） ==============
    // 动态渲染板块卡片（管理员态下展示自定义板块）
    renderCategoryCards() {
        const wrap = document.querySelector('.rule-categories');
        if (!wrap) return;
        // 保留 3 个内置 + 1 个 + 按钮；清除之前可能存在的自定义板块
        wrap.querySelectorAll('.cat-card[data-custom="1"]').forEach(el => el.remove());
        // 重新获取数据中的所有分类（除内置外）
        const customCats = Object.keys(RULE_CATEGORIES).filter(k =>
            !['qualify', 'manage', 'risk'].includes(k)
        );
        customCats.forEach((key, idx) => {
            const info = RULE_CATEGORIES[key];
            const num = String(customCats.length + 3 - (customCats.length - idx - 1)).padStart(2, '0');
            const card = document.createElement('div');
            card.className = 'cat-card';
            card.dataset.cat = key;
            card.dataset.custom = '1';
            card.innerHTML = `
                <div class="cat-num">${num}</div>
                <h4>${escapeHtml(info.name)}</h4>
                <p>${escapeHtml(info.desc || '')}</p>
                ${this.isAdmin ? '<div class="cat-card-del" title="删除板块">×</div>' : ''}
            `;
            card.addEventListener('click', e => {
                if (e.target.classList.contains('cat-card-del')) return;
                document.querySelectorAll('.cat-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                this.currentRuleCat = key;
                this.refreshRule();
            });
            const delBtn = card.querySelector('.cat-card-del');
            if (delBtn) {
                delBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.deleteCategory(key);
                });
            }
            // 插到 + 卡片之前
            const addCard = document.getElementById('btnAddCategory');
            wrap.insertBefore(card, addCard);
        });
    },

    openCategoryModal() {
        if (!this.isAdmin) return;
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDesc').value = '';
        document.getElementById('categoryKey').value = 'cat_' + Date.now().toString(36);
        document.getElementById('categoryModal').style.display = 'flex';
        setTimeout(() => document.getElementById('categoryName').focus(), 50);
    },

    saveCategory() {
        if (!this.isAdmin) return;
        const name = document.getElementById('categoryName').value.trim();
        const desc = document.getElementById('categoryDesc').value.trim();
        let key = document.getElementById('categoryKey').value.trim();
        if (!name) return this.toast('请输入板块名称', 'error');
        if (!key) key = 'cat_' + Date.now().toString(36);
        // key 合法化
        key = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        if (RULE_CATEGORIES[key]) return this.toast('板块标识已存在', 'error');
        RULE_CATEGORIES[key] = { name, desc: desc || '自定义板块' };
        // 持久化到 localStorage（覆盖默认）
        try {
            const raw = localStorage.getItem(STORAGE_KEY + '_categories');
            const custom = raw ? JSON.parse(raw) : {};
            custom[key] = { name, desc: desc || '自定义板块' };
            localStorage.setItem(STORAGE_KEY + '_categories', JSON.stringify(custom));
        } catch (e) {}
        this.renderCategoryCards();
        this.closeModal('categoryModal');
        this.toast('板块「' + name + '」已创建', 'success');
    },

    deleteCategory(key) {
        if (!this.isAdmin) return;
        const info = RULE_CATEGORIES[key];
        if (!info) return;
        // 内置不可删
        if (['qualify', 'manage', 'risk'].includes(key)) {
            return this.toast('内置板块不可删除', 'error');
        }
        const count = this.data.rules.filter(r => r.category === key).length;
        this.openConfirmModal({
            title: '删除板块',
            message: `确认删除板块「${escapeHtml(info.name)}」？${count > 0 ? `该板块下 ${count} 条内容将一起删除。` : '该操作不可恢复。'}`,
            danger: true,
            onConfirm: () => {
                delete RULE_CATEGORIES[key];
                this.data.rules = this.data.rules.filter(r => r.category !== key);
                try {
                    const raw = localStorage.getItem(STORAGE_KEY + '_categories');
                    const custom = raw ? JSON.parse(raw) : {};
                    delete custom[key];
                    localStorage.setItem(STORAGE_KEY + '_categories', JSON.stringify(custom));
                } catch (e) {}
                DataStore.save(this.data);
                this.renderCategoryCards();
                this.currentRuleCat = 'qualify';
                document.querySelectorAll('.cat-card').forEach(x => x.classList.remove('active'));
                const first = document.querySelector('.cat-card[data-cat="qualify"]');
                if (first) first.classList.add('active');
                this.refreshRule();
                this.refreshHome();
                this.toast('板块已删除', 'success');
            }
        });
    },

    loadCustomCategories() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY + '_categories');
            if (!raw) return;
            const custom = JSON.parse(raw);
            Object.keys(custom).forEach(k => {
                if (!RULE_CATEGORIES[k] && !['qualify', 'manage', 'risk'].includes(k)) {
                    RULE_CATEGORIES[k] = custom[k];
                }
            });
        } catch (e) {}
    },

    // ============== 数据看板 ==============
    refreshDashboard() {
        if (!this.isAdmin) return;
        const totalViews = this.data.notices.reduce((s, n) => s + (n.views || 0), 0)
                         + this.data.rules.reduce((s, r) => s + (r.views || 0), 0);
        const noticeCount = this.data.notices.length;
        const ruleCount = this.data.rules.length;
        const pendingCount = this.data.tickets.filter(t => t.status === 'pending').length;

        const stats = document.getElementById('dashboardStats');
        stats.innerHTML = `
            <div class="dash-card">
                <div class="dash-label">累计查看数</div>
                <div class="dash-num">${totalViews}</div>
                <div class="dash-extra">通知 + 规则合计</div>
            </div>
            <div class="dash-card">
                <div class="dash-label">通知条目</div>
                <div class="dash-num">${noticeCount}</div>
                <div class="dash-extra">已发布通知</div>
            </div>
            <div class="dash-card">
                <div class="dash-label">规则条目</div>
                <div class="dash-num">${ruleCount}</div>
                <div class="dash-extra">${Object.keys(RULE_CATEGORIES).length} 个板块</div>
            </div>
            <div class="dash-card">
                <div class="dash-label">待处理工单</div>
                <div class="dash-num" style="color:var(--warning);">${pendingCount}</div>
                <div class="dash-extra">需关注</div>
            </div>`;

        const maxN = Math.max(1, ...this.data.notices.map(n => n.views || 0));
        const maxR = Math.max(1, ...this.data.rules.map(r => r.views || 0));

        const sortedN = [...this.data.notices].sort((a, b) => (b.views || 0) - (a.views || 0));
        const sortedR = [...this.data.rules].sort((a, b) => (b.views || 0) - (a.views || 0));

        document.getElementById('dashboardNoticeList').innerHTML = sortedN.length
            ? sortedN.map((n, i) => this.viewRowHtml(n, 'notice', i, maxN)).join('')
            : '<div class="empty-state"><div class="empty-icon"></div><p>暂无通知数据</p></div>';
        document.getElementById('dashboardRuleList').innerHTML = sortedR.length
            ? sortedR.map((r, i) => this.viewRowHtml(r, 'rule', i, maxR)).join('')
            : '<div class="empty-state"><div class="empty-icon"></div><p>暂无规则数据</p></div>';

        // 绑定点击事件
        document.querySelectorAll('.view-row[data-id]').forEach(el => {
            el.addEventListener('click', () => {
                const type = el.dataset.type;
                const id = el.dataset.id;
                if (type === 'notice') this.openNoticeDetail(id);
                else this.openRuleDetail(id);
            });
        });
        this.applyRoleUI();
    },

    viewRowHtml(item, type, idx, max) {
        const views = item.views || 0;
        const percent = Math.round(views / max * 100);
        const rankClass = idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : '';
        const catInfo = type === 'rule' ? (RULE_CATEGORIES[item.category] || { name: item.category }) : null;
        const catTag = catInfo ? `<span class="tag">${escapeHtml(catInfo.name)}</span>` : '';
        return `
        <div class="view-row ${rankClass}" data-id="${item.id}" data-type="${type}" style="cursor:pointer;">
            <div class="view-rank">${idx + 1}</div>
            <div class="view-main">
                <div class="view-title">${escapeHtml(item.title)}</div>
                <div class="view-meta">
                    ${catTag}
                    <span>发布：${escapeHtml(item.createdAt || '')}</span>
                    <span>${item.author || '管理员'}</span>
                </div>
            </div>
            <div class="view-bar-wrap"><div class="view-bar" style="width:${percent}%"></div></div>
            <div class="view-count">
                <span class="view-num">${views}</span>
                <span style="font-size:11px;color:var(--text-4);">次</span>
            </div>
        </div>`;
    },

    ruleItemHtml(r) {
        const tagHtml = r.tag ? `<span class="tag ${r.tag === '必读' ? 'tag-must' : ''}">${escapeHtml(r.tag)}</span>` : '';
        const delBtn = this.isAdmin ? '<button class="item-del-btn" data-id="' + r.id + '" title="删除内容">🗑</button>' : '';
        return `
        <div class="rule-item" data-id="${r.id}">
            ${delBtn}
            <div class="rule-item-icon">规</div>
            <div class="rule-item-body">
                <div class="rule-item-title">${escapeHtml(r.title)} ${tagHtml}</div>
                <div class="rule-item-desc">${escapeHtml(r.content || '')}</div>
                <div class="rule-item-time">
                    <span>${escapeHtml(r.createdAt || '')}</span>
                    <span class="meta-views admin-only">${r.views || 0} 次查看</span>
                </div>
            </div>
        </div>`;
    },

    openRuleModal(id) {
        if (!this.isAdmin) return;
        this.editRuleId = id || null;
        const modal = document.getElementById('ruleModal');
        const title = document.getElementById('ruleModalTitle');
        const btn = document.getElementById('btnSaveRule');
        if (id) {
            const r = this.data.rules.find(x => x.id === id);
            title.textContent = '编辑内容';
            btn.textContent = '保存';
            document.getElementById('ruleTitle').value = r.title;
            document.getElementById('ruleTag').value = r.tag || '';
            document.getElementById('ruleContent').value = r.content;
        } else {
            title.textContent = '新增内容';
            btn.textContent = '保存';
            document.getElementById('ruleTitle').value = '';
            // 根据当前所在板块自动填入对应标签
            const autoTag = this.getAutoTagForCategory(this.currentRuleCat);
            document.getElementById('ruleTag').value = autoTag;
            document.getElementById('ruleContent').value = '';
        }
        this.syncTagChips();
        modal.style.display = 'flex';
    },

    // 板块 → 自动标签映射
    getAutoTagForCategory(cat) {
        const map = {
            qualify: '流程',
            manage: '管理',
            risk: '风控'
        };
        return map[cat] || '';
    },

    // 根据输入框值同步预设 chips 的高亮状态
    syncTagChips() {
        const val = document.getElementById('ruleTag').value.trim();
        const tags = val ? val.split(/[,,;;\s\/]+/).filter(Boolean) : [];
        document.querySelectorAll('#ruleTagChips .tag-chip').forEach(c => {
            c.classList.toggle('active', tags.includes(c.dataset.tag));
        });
    },

    // 绑定标签 chips 交互
    bindTagChips() {
        const chipsWrap = document.getElementById('ruleTagChips');
        const input = document.getElementById('ruleTag');
        if (!chipsWrap || !input) return;
        chipsWrap.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                let current = input.value.trim();
                let arr = current ? current.split(/[,,;;\s\/]+/).filter(Boolean) : [];
                if (arr.includes(tag)) {
                    arr = arr.filter(t => t !== tag);
                } else {
                    arr.push(tag);
                }
                input.value = arr.join(' / ');
                this.syncTagChips();
            });
        });
        // 输入时同步高亮
        input.addEventListener('input', () => this.syncTagChips());
        // 回车添加自定义 chip
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = input.value.trim();
                if (!val) return;
                // 简单分割
                const arr = val.split(/[,,;;\s\/]+/).filter(Boolean);
                // 检查是否有新标签需要加入 chips
                const existing = Array.from(chipsWrap.querySelectorAll('.tag-chip')).map(c => c.dataset.tag);
                arr.forEach(t => {
                    if (!existing.includes(t)) {
                        const c = document.createElement('span');
                        c.className = 'tag-chip active';
                        c.dataset.tag = t;
                        c.textContent = t;
                        c.addEventListener('click', () => {
                            let cur = input.value.trim();
                            let a = cur ? cur.split(/[,,;;\s\/]+/).filter(Boolean) : [];
                            if (a.includes(t)) a = a.filter(x => x !== t);
                            else a.push(t);
                            input.value = a.join(' / ');
                            this.syncTagChips();
                        });
                        chipsWrap.appendChild(c);
                    }
                });
                this.syncTagChips();
            }
        });
    },

    saveRule() {
        if (!this.isAdmin) return;
        const title = document.getElementById('ruleTitle').value.trim();
        const content = document.getElementById('ruleContent').value.trim();
        if (!title) return this.toast('请输入标题', 'error');
        if (!content) return this.toast('请输入详细内容', 'error');
        const tag = document.getElementById('ruleTag').value.trim();
        const isEdit = !!this.editRuleId;
        let category = this.currentRuleCat;
        if (isEdit) {
            const r = this.data.rules.find(x => x.id === this.editRuleId);
            Object.assign(r, { title, content, tag, updatedAt: nowStr() });
            category = r.category;
        } else {
            this.data.rules.unshift({
                id: genId('r'),
                category: this.currentRuleCat,
                title, content, tag,
                author: '管理员',
                createdAt: nowStr(),
                updatedAt: nowStr()
            });
        }
        // 自动生成系统通知
        this.createRuleUpdateNotice(category, title, isEdit);
        DataStore.save(this.data);
        this.closeModal('ruleModal');
        this.refreshRule();
        this.refreshNotice();
        this.refreshHome();
        this.toast(isEdit ? '内容已更新' : '内容已新增', 'success');
    },

    // 规则新增/修改时自动生成通知
    createRuleUpdateNotice(category, title, isEdit) {
        const catInfo = RULE_CATEGORIES[category] || { name: category || '' };
        const action = isEdit ? '更新' : '新增';
        this.data.notices.unshift({
            id: genId('n'),
            title: `【更新】${catInfo.name} - 《${title}》${action}`,
            content: `${catInfo.name}板块下的内容《${title}》已${action}，请前往规则板块查看详情。`,
            category: 'system',
            pinned: false,
            author: '管理员',
            createdAt: nowStr(),
            updatedAt: nowStr()
        });
    },

    openRuleDetail(id) {
        const r = this.data.rules.find(x => x.id === id);
        if (!r) return;
        this.editRuleId = id;
        document.getElementById('ruleDetailTitle').textContent = r.title;
        const body = document.getElementById('ruleDetailBody');
        const cat = RULE_CATEGORIES[r.category] || { name: r.category };
        const tagHtml = r.tag ? `<span class="tag ${r.tag === '必读' ? 'tag-must' : ''}">${escapeHtml(r.tag)}</span>` : '';
        body.innerHTML = `
            <div class="detail-meta">
                <span class="meta-cat">板块：${escapeHtml(cat.name)}</span>
                ${tagHtml}
                <span>${escapeHtml(r.author || '管理员')}</span>
                <span>发布：${escapeHtml(r.createdAt || '')}</span>
                <span class="meta-views admin-only">${r.views || 0} 次查看</span>
                ${r.updatedAt && r.updatedAt !== r.createdAt ? `<span>更新：${escapeHtml(r.updatedAt)}</span>` : ''}
            </div>
            <div class="detail-content">${escapeHtml(r.content || '')}</div>`;
        const btnEdit = document.getElementById('btnEditRule');
        const btnDel = document.getElementById('btnDeleteRule');
        if (this.isAdmin) {
            btnEdit.style.display = 'inline-flex';
            btnDel.style.display = 'inline-flex';
        } else {
            btnEdit.style.display = 'none';
            btnDel.style.display = 'none';
        }
        document.getElementById('ruleDetailModal').style.display = 'flex';
        this.recordView('rule', id);
    },

    deleteRule() {
        if (!this.isAdmin) return;
        if (!this.editRuleId) return;
        const id = this.editRuleId;
        const r = this.data.rules.find(x => x.id === id);
        this.openConfirmModal({
            title: '删除内容',
            message: `确认删除「${r ? escapeHtml(r.title) : ''}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.rules = this.data.rules.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.closeModal('ruleDetailModal');
                this.refreshRule();
                this.refreshHome();
                this.toast('内容已删除', 'success');
            }
        });
    },

    confirmDeleteRule(id) {
        if (!this.isAdmin) return;
        const r = this.data.rules.find(x => x.id === id);
        if (!r) return;
        this.openConfirmModal({
            title: '删除内容',
            message: `确认删除「${escapeHtml(r.title)}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.rules = this.data.rules.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.refreshRule();
                this.refreshHome();
                this.toast('内容已删除', 'success');
            }
        });
    },

    // ============== 工具入口 ==============
    bindToolPage() {
        document.getElementById('btnAddTool').addEventListener('click', () => this.openToolModal());
        document.getElementById('btnSaveTool').addEventListener('click', () => this.saveTool());
        document.querySelectorAll('#toolFilterTabs .filter-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('#toolFilterTabs .filter-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.currentToolFilter = t.dataset.tfilter;
                this.refreshTool();
            });
        });
    },

    refreshTool() {
        let items = [...this.data.tools];
        if (this.currentToolFilter !== 'all') {
            items = items.filter(t => t.type === this.currentToolFilter);
        }
        const grid = document.getElementById('toolGrid');
        const empty = document.getElementById('toolEmpty');
        if (items.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            grid.innerHTML = items.map(t => this.toolCardHtml(t)).join('');
            grid.querySelectorAll('.tool-card').forEach(el => {
                const id = el.dataset.id;
                el.querySelector('.tool-name')?.addEventListener('click', e => {
                    e.stopPropagation();
                    this.openToolExternal(id);
                });
                el.querySelector('.tool-url')?.addEventListener('click', e => {
                    e.stopPropagation();
                    this.openToolExternal(id);
                });
                el.querySelector('.tool-edit')?.addEventListener('click', e => {
                    e.stopPropagation();
                    this.openToolModal(id);
                });
                el.querySelector('.tool-del')?.addEventListener('click', e => {
                    e.stopPropagation();
                    this.deleteTool(id);
                });
            });
        }
        this.applyRoleUI();
    },

    toolCardHtml(t) {
        const type = TOOL_TYPES[t.type] || { name: t.type, icon: '?' };
        const isUrl = /^https?:\/\//i.test(t.url || '');
        const urlHtml = t.url
            ? `<div class="tool-url" title="${escapeHtml(t.url)}"><span class="tool-url-text">${escapeHtml(t.url)}</span><span>${isUrl ? '跳转 →' : '查看'}</span></div>`
            : `<div class="tool-url"><span class="tool-url-text no-link">未配置链接</span></div>`;
        const adminActions = this.isAdmin
            ? `<div class="tool-card-actions">
                <button class="tool-edit" title="编辑">✎</button>
                <button class="tool-del" title="删除">×</button>
               </div>` : '';
        return `
        <div class="tool-card" data-id="${t.id}">
            <div class="tool-card-head">
                <div class="tool-type-icon">${type.icon}</div>
                ${adminActions}
            </div>
            <div class="tool-name">${escapeHtml(t.name)}</div>
            <div class="tool-desc">${escapeHtml(t.desc || '暂无说明')}</div>
            ${urlHtml}
        </div>`;
    },

    openToolExternal(id) {
        const t = this.data.tools.find(x => x.id === id);
        if (!t || !t.url) return this.toast('未配置链接', 'warning');
        if (/^https?:\/\//i.test(t.url)) {
            window.open(t.url, '_blank', 'noopener');
        } else {
            this.toast('内容：' + t.url, 'success');
        }
    },

    openToolModal(id) {
        if (!this.isAdmin) return;
        this.editToolId = id || null;
        const modal = document.getElementById('toolModal');
        const title = document.getElementById('toolModalTitle');
        const btn = document.getElementById('btnSaveTool');
        if (id) {
            const t = this.data.tools.find(x => x.id === id);
            title.textContent = '编辑工具';
            btn.textContent = '保存';
            document.getElementById('toolName').value = t.name;
            document.getElementById('toolType').value = t.type;
            document.getElementById('toolUrl').value = t.url;
            document.getElementById('toolDesc').value = t.desc || '';
        } else {
            title.textContent = '添加工具';
            btn.textContent = '保存';
            document.getElementById('toolName').value = '';
            document.getElementById('toolType').value = 'box';
            document.getElementById('toolUrl').value = '';
            document.getElementById('toolDesc').value = '';
        }
        modal.style.display = 'flex';
    },

    saveTool() {
        if (!this.isAdmin) return;
        const name = document.getElementById('toolName').value.trim();
        const url = document.getElementById('toolUrl').value.trim();
        if (!name) return this.toast('请输入工具名称', 'error');
        if (!url) return this.toast('请输入链接/内容', 'error');
        const type = document.getElementById('toolType').value;
        const desc = document.getElementById('toolDesc').value.trim();
        if (this.editToolId) {
            const t = this.data.tools.find(x => x.id === this.editToolId);
            Object.assign(t, { name, type, url, desc });
        } else {
            this.data.tools.unshift({
                id: genId('t'),
                name, type, url, desc,
                author: '管理员',
                createdAt: nowStr()
            });
        }
        DataStore.save(this.data);
        this.closeModal('toolModal');
        this.refreshTool();
        this.refreshHome();
        this.toast(this.editToolId ? '工具已更新' : '工具已添加', 'success');
    },

    deleteTool(id) {
        if (!this.isAdmin) return;
        const t = this.data.tools.find(x => x.id === id);
        this.openConfirmModal({
            title: '删除工具',
            message: `确认删除工具「${t ? escapeHtml(t.name) : ''}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.tools = this.data.tools.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.refreshTool();
                this.refreshHome();
                this.toast('工具已删除', 'success');
            }
        });
    },

    // ============== 工单板块 ==============
    bindTicketPage() {
        document.getElementById('btnAddTicket').addEventListener('click', () => this.openTicketModal());
        document.getElementById('btnSaveTicket').addEventListener('click', () => this.saveTicket());
        document.getElementById('btnProcessTicket').addEventListener('click', () => this.updateTicketStatus('processing'));
        document.getElementById('btnCompleteTicket').addEventListener('click', () => this.updateTicketStatus('done'));
        document.querySelectorAll('#ticketFilterTabs .filter-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('#ticketFilterTabs .filter-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.currentTicketFilter = t.dataset.tkfilter;
                this.refreshTicket();
            });
        });
    },

    refreshTicket() {
        let items = [...this.data.tickets];
        if (this.currentTicketFilter === 'active') {
            // 进行中：包含待处理 + 处理中
            items = items.filter(t => t.status === 'pending' || t.status === 'processing');
        } else if (this.currentTicketFilter !== 'all') {
            items = items.filter(t => t.status === this.currentTicketFilter);
        }
        // 进行中时，待处理排在前面（更紧急），其他按时间倒序
        if (this.currentTicketFilter === 'active') {
            items.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return (b.createdAt || '').localeCompare(a.createdAt || '');
            });
        } else {
            items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }
        const list = document.getElementById('ticketList');
        const empty = document.getElementById('ticketEmpty');
        if (items.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
            list.innerHTML = items.map(t => this.ticketItemHtml(t)).join('');
            list.querySelectorAll('.ticket-item').forEach(el => {
                el.addEventListener('click', e => {
                    if (e.target.closest('.item-del-btn')) return;
                    this.openTicketDetail(el.dataset.id);
                });
            });
            list.querySelectorAll('.item-del-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.confirmDeleteTicket(btn.dataset.id);
                });
            });
        }
        this.applyRoleUI();
    },

    ticketItemHtml(t) {
        const typeInfo = TICKET_TYPES[t.type] || { name: t.type };
        const statusInfo = TICKET_STATUS[t.status] || { name: t.status, cls: '' };
        const delBtn = this.isAdmin ? '<button class="item-del-btn" data-id="' + t.id + '" title="删除工单">🗑</button>' : '';
        return `
        <div class="ticket-item" data-id="${t.id}">
            ${delBtn}
            <div class="ticket-head">
                <div class="ticket-head-left">
                    <span class="ticket-id">${escapeHtml(t.id)}</span>
                    <span class="ticket-type">${escapeHtml(typeInfo.name)}</span>
                    <strong>${escapeHtml(t.provider || '')}</strong>
                </div>
                <span class="ticket-status ${statusInfo.cls}">${statusInfo.name}</span>
            </div>
            <div class="ticket-desc">${escapeHtml(t.desc || '')}</div>
            <div class="ticket-foot">
                <span>提交时间：${escapeHtml(t.createdAt || '')}</span>
                ${t.contact ? `<span>联系方式：${escapeHtml(t.contact)}</span>` : ''}
            </div>
        </div>`;
    },

    openTicketModal(id) {
        this.editTicketId = id || null;
        const modal = document.getElementById('ticketModal');
        const title = document.getElementById('ticketModalTitle');
        const btn = document.getElementById('btnSaveTicket');
        if (id) {
            const t = this.data.tickets.find(x => x.id === id);
            title.textContent = '编辑工单';
            btn.textContent = '保存';
            document.getElementById('ticketProvider').value = t.provider;
            document.getElementById('ticketType').value = t.type;
            document.getElementById('ticketDesc').value = t.desc;
            document.getElementById('ticketContact').value = t.contact || '';
        } else {
            title.textContent = '提交工单';
            btn.textContent = '提交';
            document.getElementById('ticketProvider').value = '';
            document.getElementById('ticketType').value = 'whitelist';
            document.getElementById('ticketDesc').value = '';
            document.getElementById('ticketContact').value = '';
        }
        modal.style.display = 'flex';
    },

    saveTicket() {
        const provider = document.getElementById('ticketProvider').value.trim();
        const desc = document.getElementById('ticketDesc').value.trim();
        if (!provider) return this.toast('请输入服务商名称', 'error');
        if (!desc) return this.toast('请输入需求描述', 'error');
        const type = document.getElementById('ticketType').value;
        const contact = document.getElementById('ticketContact').value.trim();
        if (this.editTicketId) {
            const t = this.data.tickets.find(x => x.id === this.editTicketId);
            Object.assign(t, { provider, type, desc, contact });
        } else {
            this.data.tickets.unshift({
                id: genTicketId(),
                provider, type, desc, contact,
                status: 'pending',
                author: this.isAdmin ? '管理员' : '服务商',
                createdAt: nowStr(),
                timeline: [{ time: nowStr(), text: '工单创建' }]
            });
        }
        DataStore.save(this.data);
        this.closeModal('ticketModal');
        this.refreshTicket();
        this.refreshHome();
        this.toast(this.editTicketId ? '工单已更新' : '工单已提交', 'success');
    },

    openTicketDetail(id) {
        const t = this.data.tickets.find(x => x.id === id);
        if (!t) return;
        this.currentTicketDetailId = id;
        const typeInfo = TICKET_TYPES[t.type] || { name: t.type };
        const statusInfo = TICKET_STATUS[t.status] || { name: t.status, cls: '' };
        const body = document.getElementById('ticketDetailBody');
        const timeline = (t.timeline || []).map(item => `
            <div class="timeline-item">
                <div class="timeline-time">${escapeHtml(item.time)}</div>
                <div class="timeline-text">${escapeHtml(item.text)}</div>
            </div>`).join('');
        body.innerHTML = `
            <div class="detail-meta">
                <span>${escapeHtml(t.id)}</span>
                <span class="ticket-type">${escapeHtml(typeInfo.name)}</span>
                <span class="ticket-status ${statusInfo.cls}">${statusInfo.name}</span>
            </div>
            <div class="detail-section">
                <h4>服务商</h4>
                <div class="value">${escapeHtml(t.provider || '-')}</div>
            </div>
            <div class="detail-section">
                <h4>需求描述</h4>
                <div class="value" style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(t.desc || '-')}</div>
            </div>
            <div class="detail-section">
                <h4>联系方式</h4>
                <div class="value">${escapeHtml(t.contact || '未填写')}</div>
            </div>
            <div class="detail-section">
                <h4>提交时间</h4>
                <div class="value">${escapeHtml(t.createdAt || '-')}</div>
            </div>
            <div class="detail-section">
                <h4>处理时间线</h4>
                <div class="detail-timeline">${timeline || '<div class="value" style="color:#94a3b8;">暂无</div>'}</div>
            </div>`;
        const btnProcess = document.getElementById('btnProcessTicket');
        const btnComplete = document.getElementById('btnCompleteTicket');
        if (this.isAdmin) {
            btnProcess.style.display = t.status === 'pending' ? 'inline-flex' : 'none';
            btnComplete.style.display = t.status !== 'done' ? 'inline-flex' : 'none';
        } else {
            btnProcess.style.display = 'none';
            btnComplete.style.display = 'none';
        }
        document.getElementById('ticketDetailModal').style.display = 'flex';
    },

    confirmDeleteTicket(id) {
        if (!this.isAdmin) return;
        const t = this.data.tickets.find(x => x.id === id);
        if (!t) return;
        this.openConfirmModal({
            title: '删除工单',
            message: `确认删除工单「${escapeHtml(t.provider)} - ${escapeHtml((t.desc || '').slice(0, 30))}」吗？删除后无法恢复。`,
            danger: true,
            onConfirm: () => {
                this.data.tickets = this.data.tickets.filter(x => x.id !== id);
                DataStore.save(this.data);
                this.refreshTicket();
                this.refreshHome();
                this.toast('工单已删除', 'success');
            }
        });
    },

    updateTicketStatus(newStatus) {
        if (!this.isAdmin) return;
        if (!this.currentTicketDetailId) return;
        const t = this.data.tickets.find(x => x.id === this.currentTicketDetailId);
        if (!t) return;
        t.status = newStatus;
        const statusText = newStatus === 'processing' ? '已进入处理' : '已完成';
        t.timeline = t.timeline || [];
        t.timeline.push({ time: nowStr(), text: statusText });
        DataStore.save(this.data);
        this.refreshTicket();
        this.refreshHome();
        this.openTicketDetail(t.id);
        this.toast('工单状态已更新', 'success');
    },

    // ============== 通知详情按钮（管理员） ==============
    bindNoticeDetail() {
        // 启动时绑定一次即可
        document.getElementById('btnEditNoticeFromDetail').addEventListener('click', () => {
            if (!this.isAdmin || !this.currentNoticeDetailId) return;
            this.closeModal('noticeDetailModal');
            this.openNoticeModal(this.currentNoticeDetailId);
        });
        document.getElementById('btnDeleteNoticeFromDetail').addEventListener('click', () => {
            if (!this.isAdmin) return;
            this.deleteNotice();
        });
    },

    // ============== 通用 ==============
    closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },

    // 通用确认弹窗
    openConfirmModal({ title = '确认操作', message = '', danger = false, confirmText = '确认', cancelText = '取消', onConfirm = null, onCancel = null }) {
        const modal = document.getElementById('confirmModal');
        if (!modal) return;
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        const btn = document.getElementById('btnConfirmOk');
        btn.textContent = confirmText;
        btn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
        document.getElementById('btnConfirmCancel').textContent = cancelText;
        this._confirmCallback = onConfirm;
        this._cancelCallback = onCancel;
        modal.style.display = 'flex';
    },

    handleConfirmOk() {
        const cb = this._confirmCallback;
        this.closeModal('confirmModal');
        this._confirmCallback = null;
        this._cancelCallback = null;
        if (typeof cb === 'function') cb();
    },

    handleConfirmCancel() {
        const cb = this._cancelCallback;
        this.closeModal('confirmModal');
        this._confirmCallback = null;
        this._cancelCallback = null;
        if (typeof cb === 'function') cb();
    },

    bindConfirmModal() {
        const btnOk = document.getElementById('btnConfirmOk');
        const btnCancel = document.getElementById('btnConfirmCancel');
        if (btnOk) btnOk.addEventListener('click', () => this.handleConfirmOk());
        if (btnCancel) btnCancel.addEventListener('click', () => this.handleConfirmCancel());
        // 关闭 × 按钮
        document.querySelectorAll('[data-confirm-cancel]').forEach(el => {
            el.addEventListener('click', () => this.handleConfirmCancel());
        });
    },

    toast(msg, type = '') {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className = 'toast' + (type ? ' ' + type : '');
        t.style.display = 'block';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            t.style.display = 'none';
        }, 2200);
    }
};

// 启动
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.bindNoticeDetail();
    App.bindConfirmModal();
});
