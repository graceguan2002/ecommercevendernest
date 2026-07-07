// ============== 数据层 + 默认数据 ==============
const STORAGE_KEY = 'sp_workbench_data_v1';

// 管理员账号（可在此修改）
const ADMIN_ACCOUNT = {
    username: 'admin',
    password: 'admin123'
};

// 三类规则板块（保留 3 大类，可通过管理员「新增板块」扩展）
const RULE_CATEGORIES = {
    qualify: { name: '引入规则', desc: '企业资质要求、报备流程' },
    manage:  { name: '管理类内容', desc: 'SAB、合伙人、外循环管理' },
    risk:    { name: '风控信息', desc: '违规 R 值、Y 值说明' }
};

// 工具类型定义
const TOOL_TYPES = {
    qrcode: { name: '二维码', icon: 'QR' },
    box:    { name: '百宝箱', icon: '百' },
    unit:   { name: '最小作战单元', icon: '单' },
    ai:     { name: 'AI 工具', icon: 'AI' }
};

// 工单类型
const TICKET_TYPES = {
    whitelist: { name: '加白申请' },
    ai:        { name: 'AI 深度辅助' },
    tool:      { name: '工具申请' },
    other:     { name: '其他需求' }
};

// 工单状态
const TICKET_STATUS = {
    pending:    { name: '待处理', cls: 'status-pending' },
    processing: { name: '处理中', cls: 'status-processing' },
    done:       { name: '已完成', cls: 'status-done' }
};

// 默认数据
const DEFAULT_DATA = {
    notices: [
        {
            id: 'n_001',
            title: '【重要】关于7月服务商报备流程优化的通知',
            category: 'policy',
            content: '各位服务商伙伴：\n\n为提升报备效率，自 2026 年 7 月 15 日起，报备流程做如下优化：\n\n1. 报备材料由 5 项精简为 3 项，移除营业执照副本、税务登记证；\n2. 报备审核时长从 3 个工作日缩短至 1 个工作日；\n3. 紧急报备可走加急通道，4 小时内反馈。\n\n请各位及时同步至内部团队。如有疑问，请通过工单板块提交咨询。',
            pinned: true,
            author: '管理员',
            views: 128,
            viewLogs: [],
            createdAt: '2026-07-05 09:30',
            updatedAt: '2026-07-05 09:30'
        },
        {
            id: 'n_002',
            title: '【系统】服务商工作台 v1.0 上线公告',
            category: 'system',
            content: '电商服务商一体化工作台正式上线！\n\n本次上线包含四大核心板块：\n- 通知板块：重要通知统一同步\n- 规则板块：日常规则集中管理\n- 工具入口：一键直达常用工具\n- 服务商工单：需求申请与处理\n\n请各位服务商伙伴收藏本平台，及时查看通知。',
            pinned: true,
            author: '管理员',
            views: 96,
            viewLogs: [],
            createdAt: '2026-07-01 10:00',
            updatedAt: '2026-07-01 10:00'
        },
        {
            id: 'n_003',
            title: '【活动】季度优秀服务商评选启动',
            category: 'activity',
            content: '2026 年 Q2 优秀服务商评选已启动！\n\n评选维度：业绩贡献、合规表现、客户满意度。\n获奖权益：年度合作伙伴优先续约、专属服务经理。\n截止时间：2026 年 7 月 31 日。',
            pinned: false,
            author: '管理员',
            views: 42,
            viewLogs: [],
            createdAt: '2026-07-03 14:20',
            updatedAt: '2026-07-03 14:20'
        }
    ],
    rules: [
        // 引入规则
        { id: 'r_001', category: 'qualify', title: '服务商企业资质要求', tag: '必读', content: '一、基础资质\n1. 持有合法有效的营业执照（注册资金 ≥ 100 万）\n2. 一般纳税人资格\n3. 成立满 1 年以上\n\n二、行业资质\n1. 电商行业相关从业经验 ≥ 2 年\n2. 拥有 ≥ 3 个成功服务案例\n3. 核心团队成员 ≥ 5 人\n\n三、合规要求\n1. 近 1 年无重大违规记录\n2. 信用记录良好\n3. 签署《服务商合规承诺书》', author: '管理员', views: 156, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        { id: 'r_002', category: 'qualify', title: '服务商报备流程说明', tag: '流程', content: '报备流程共 5 步：\n\n第 1 步：登录工作台，进入「服务商工单」板块，提交「加白申请」\n第 2 步：上传企业资质材料（营业执照、案例证明等）\n第 3 步：等待审核（1 个工作日内反馈）\n第 4 步：审核通过后，签署《服务商合作协议》\n第 5 步：完成账号开通，进入正式服务阶段\n\n加急通道：联系对应业务经理，4 小时内反馈结果。', author: '管理员', views: 88, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        // 管理类内容
        { id: 'r_003', category: 'manage', title: 'SAB 管理规范', tag: '管理', content: 'SAB（Strategic Account Business）战略客户管理规范：\n\n1. 客户分级：根据 GMV 贡献、客户规模分为 S/A/B 三级\n2. 资源倾斜：S 级客户享受专属服务经理、优先支持\n3. 月度复盘：每月 5 日前提交上月服务报告\n4. 风险预警：连续两月指标下滑 ≥ 20% 触发预警', author: '管理员', views: 67, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        { id: 'r_004', category: 'manage', title: '合伙人管理制度', tag: '管理', content: '合伙人管理要点：\n\n1. 准入门槛：年度业绩 ≥ 500 万 + 团队规模 ≥ 10 人\n2. 权益分配：享受平台返点 + 业务分成 + 股权激励资格\n3. 考核机制：季度 KPI 考核，连续两季未达标降级\n4. 退出机制：主动退出提前 30 天申请；被动退出按协议执行', author: '管理员', views: 54, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        { id: 'r_005', category: 'manage', title: '外循环管理规则', tag: '管理', content: '外循环业务管理规则：\n\n1. 业务范围：仅限平台允许的外部渠道推广\n2. 报备要求：所有外循环活动提前 5 个工作日报备\n3. 素材审核：宣传素材必须通过合规审核后方可投放\n4. 数据反馈：活动结束 3 日内提交完整数据报告\n5. 违规处理：未报备私自外循环，扣减当月返点 50%', author: '管理员', views: 39, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        // 风控信息
        { id: 'r_006', category: 'risk', title: '违规 R 值说明', tag: '风控', content: 'R 值（Risk Value）违规风险值计算规则：\n\n1. R 值 = 违规次数 × 严重系数\n2. 严重系数：轻微 1 / 一般 3 / 严重 5 / 特别严重 10\n3. R 值区间：\n   - R < 5：观察期，发送提醒\n   - 5 ≤ R < 15：限制部分权益\n   - 15 ≤ R < 30：暂停部分业务\n   - R ≥ 30：终止合作\n4. 申诉通道：对违规判定有异议的，7 日内可提交申诉', author: '管理员', views: 113, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' },
        { id: 'r_007', category: 'risk', title: '违规 Y 值说明', tag: '风控', content: 'Y 值（Yellow Alert）黄牌预警值说明：\n\n1. Y 值是 R 值的预警先行指标\n2. 触发条件：\n   - 单月违规 3 次触发 Y=1\n   - 累计 R 值 30 天内达到 8 触发 Y=2\n   - 出现重大客诉触发 Y=3\n3. Y=1：邮件提醒\n4. Y=2：限制高风险业务\n5. Y=3：暂停服务，强制复盘', author: '管理员', views: 78, viewLogs: [], createdAt: '2026-07-01 10:00', updatedAt: '2026-07-01 10:00' }
    ],
    tools: [
        { id: 't_001', name: '行业问题百宝箱', type: 'box', url: 'https://example.com/box/industry', desc: '电商行业高频问题解决方案合集', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_002', name: '服务话术百宝箱', type: 'box', url: 'https://example.com/box/scripts', desc: '标准服务话术与沟通模板', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_003', name: '客诉处理流程二维码', type: 'qrcode', url: 'https://example.com/qr/complaint', desc: '扫码查看客诉处理标准流程', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_004', name: '最小作战单元-客户接入', type: 'unit', url: 'https://example.com/unit/onboarding', desc: '新客户接入标准作业模板', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_005', name: '最小作战单元-活动执行', type: 'unit', url: 'https://example.com/unit/campaign', desc: '营销活动执行 SOP 模板', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_006', name: 'AI 智能客服', type: 'ai', url: 'https://example.com/ai/cs', desc: '7x24 小时 AI 自动应答客服', author: '管理员', createdAt: '2026-07-01 10:00' },
        { id: 't_007', name: 'AI 素材生成', type: 'ai', url: 'https://example.com/ai/material', desc: '一键生成营销文案与海报', author: '管理员', createdAt: '2026-07-01 10:00' }
    ],
    tickets: [
        { id: 'TK20260705001', provider: '上海星河电商', type: 'whitelist', desc: '申请「618 大促」活动白名单，涉及 50 个重点客户的促销加白。', contact: 'zhangsan@xinghe.com', status: 'pending', author: '管理员', createdAt: '2026-07-05 14:20', timeline: [{ time: '2026-07-05 14:20', text: '工单创建' }] },
        { id: 'TK20260703002', provider: '北京云策科技', type: 'ai', desc: '申请 AI 深度辅助，用于 Q3 大促批量素材生成，预计生成 500+ 套海报。', contact: '138****8888', status: 'processing', author: '管理员', createdAt: '2026-07-03 10:15', timeline: [{ time: '2026-07-03 10:15', text: '工单创建' }, { time: '2026-07-03 16:40', text: '已进入处理' }] },
        { id: 'TK20260701003', provider: '广州优品供应链', type: 'tool', desc: '申请开通「AI 数据分析」工具权限。', contact: 'lisi@youpin.com', status: 'done', author: '管理员', createdAt: '2026-07-01 09:00', timeline: [{ time: '2026-07-01 09:00', text: '工单创建' }, { time: '2026-07-01 14:00', text: '已进入处理' }, { time: '2026-07-02 10:00', text: '已完成' }] }
    ]
};

// ============== 数据存储 ==============
const DataStore = {
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                // 合并默认数据（兼容老数据，自动补 views 字段）
                const notices = (data.notices || DEFAULT_DATA.notices).map(n => ({
                    views: 0, viewLogs: [], ...n
                }));
                const rules = (data.rules || DEFAULT_DATA.rules).map(r => ({
                    views: 0, viewLogs: [], ...r
                }));
                return {
                    notices,
                    rules,
                    tools: data.tools || DEFAULT_DATA.tools,
                    tickets: data.tickets || DEFAULT_DATA.tickets
                };
            }
        } catch (e) {
            console.warn('数据加载失败，使用默认数据', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    },
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('数据保存失败', e);
        }
    },
    reset() {
        localStorage.removeItem(STORAGE_KEY);
    }
};

// 工具函数
function genId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function genTicketId() {
    const d = new Date();
    const ymd = d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return 'TK' + ymd + seq;
}
function nowStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function categoryTagClass(cat) {
    const map = { system: 'tag-info', policy: 'tag', activity: 'tag-success', urgent: 'tag-danger' };
    return map[cat] || 'tag';
}
function categoryLabel(cat) {
    const map = { system: '系统通知', policy: '政策通知', activity: '活动通知', urgent: '紧急通知' };
    return map[cat] || cat;
}
function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}
