<?php

return [
    'app' => [
        'name' => 'Chronos',
        'version' => 'Chronos v1.0',
    ],
    'navigation' => [
        'section_title' => '主导航',
        'home' => '主页',
        'journal' => '日志',
        'group' => '群组',
        'profile' => '个人资料',
        'cta' => '撰写新日志',
    ],
    'bottom_bar' => [
        'home' => '主页',
        'journal' => '日志',
        'group' => '群组',
        'profile' => '个人',
        'add' => '新增日志',
    ],
    'home' => [
        'hero' => [
            'welcome_user' => '欢迎回来，:name 👋',
            'welcome_generic' => '欢迎',
            'subtitle' => '轻松记录你的每日故事',
        ],
        'actions' => [
            'add' => '新增',
            'journal' => '日志',
            'calendar' => '日历',
        ],
        'sections' => [
            'latest' => [
                'title' => '最新日志',
                'view_all' => '查看全部',
                'empty' => [
                    'title' => '暂时没有保存的日志。',
                    'description' => '从第一篇故事开始吧！',
                ],
            ],
        ],
        'accessibility' => [
            'view_journal' => '查看日志详情 :title',
        ],
        'edit_modal' => [
            'title' => '编辑日志',
            'submit' => '更新',
        ],
        'delete_modal' => [
            'title' => '删除日志？',
            'description_with_title' => '日志“:title”将被永久删除。',
            'description' => '该日志将被永久删除。',
            'confirm' => '删除',
            'cancel' => '取消',
            'error_generic' => '无法删除日志。',
            'error_network' => '网络错误，请重试。',
        ],
        'errors' => [
            'session_expired' => '会话已过期，请重新登录。',
            'load_failed' => '加载日志失败（:status）',
            'generic_load' => '无法加载日志。',
        ],
        'defaults' => [
            'untitled_journal' => '无标题日志',
        ],
    ],
    'journal' => [
        'header' => [
            'badge' => '私人档案',
            'title' => '每日日志',
            'description' => '回顾你记录的内容，按需编辑，并追踪每日进度。',
        ],
        'stats' => [
            'total_label' => '日志总数',
        ],
        'actions' => [
            'write' => '撰写日志',
        ],
        'sidebar' => [
            'last_written_label' => '最近记录',
            'last_written_empty' => '尚无日志',
            'tips_title' => '快速提示',
            'tips_description' => '在详情弹窗内即可编辑或删除日志，无需离开此页面。',
        ],
        'empty_state' => [
            'title' => '还没有保存任何日志。',
            'description' => '点击“撰写日志”开始第一篇故事。',
            'cta' => '撰写日志',
        ],
        'accessibility' => [
            'view_journal' => '查看日志详情 :title',
        ],
        'card' => [
            'overdue_badge' => '已逾期',
        ],
        'progress' => [
            'completed' => '已完成',
            'not_started' => '未开始',
            'in_progress' => '进行中',
        ],
        'create_modal' => [
            'title' => '新增日志',
            'submit' => '保存',
        ],
        'edit_modal' => [
            'title' => '编辑日志',
            'submit' => '更新',
        ],
        'delete_modal' => [
            'title' => '删除日志？',
            'description_with_title' => '日志“:title”将被永久删除。',
            'description' => '该日志将被永久删除。',
            'confirm' => '删除',
            'cancel' => '取消',
            'error_generic' => '无法删除日志。',
            'error_network' => '网络错误，请重试。',
        ],
        'errors' => [
            'load_failed' => '加载数据失败（:status）',
            'generic_load' => '无法加载日志。',
            'user_fetch_failed' => '无法获取用户信息',
            'save_failed' => '保存日志失败。',
        ],
    ],
    'group' => [
        'header' => [
            'badge' => '协作',
            'title' => '管理群组',
            'description' => '建立高效写作团队。可以创建新群组或使用邀请码加入。',
        ],
        'stats' => [
            'total_label' => '活跃群组',
            'total_helper' => '包含你管理或加入的所有群组。',
        ],
        'forms' => [
            'create' => [
                'title' => '创建新群组',
                'description' => '与好友一起打造写作社区。',
                'name_label' => '群组名称',
                'name_placeholder' => '示例：高效写作队',
                'description_label' => '群组描述',
                'description_placeholder' => '填写群组目标或简单规则。',
                'submit' => '创建群组',
            ],
            'join' => [
                'title' => '使用邀请码加入',
                'description' => '输入你收到的邀请码。',
                'invite_label' => '邀请码',
                'invite_placeholder' => '输入邀请码',
                'submit' => '加入',
            ],
        ],
        'list' => [
            'title' => '你的群组',
            'count_label' => ':count 个活跃群组',
            'empty' => '你还没有群组。可以创建新群组或使用邀请码加入。',
        ],
        'card' => [
            'no_description' => '暂无简介。',
            'view_detail' => '查看群组详情',
        ],
    ],
    'group_detail' => [
        'status' => [
            'none' => '-',
            'done' => '已完成',
            'progress' => '进行中',
            'pending' => '待开始',
            'unselected' => '尚未选择',
        ],
    ],
    'auth' => [
        'login' => [
            'sidebar' => [
                'brand_title' => 'Chronos Travel',
                'brand_since' => '自 2022 年',
                'hero_title' => '深蓝工作区与旅程节奏保持同步。',
                'hero_subtitle' => '在同一个响应式仪表板中管理行程、心情追踪与目的地亮点。',
                'writers' => '2.3k 位旅行写作者活跃',
            ],
            'highlights' => [
                'itinerary' => '灵活调整的行程模板，适配城市游、长途自驾或慢旅行。',
                'destinations' => '保存最爱的目的地亮点，并记录每一站的心情。',
                'mood' => '每日心情日志，自动整理旅行洞察。',
            ],
            'badge' => [
                'left' => 'Chronos 登录',
                'right' => '全程防护 · 24/7',
            ],
            'hero' => [
                'pretitle' => '欢迎回来',
                'title' => '登录并继续撰写你的旅程故事。',
                'description' => '在 Chronos 仪表板中掌握行程、心情记录与目的地洞察。',
            ],
            'form' => [
                'email_label' => '电子邮件',
                'email_placeholder' => 'Chronos@gmail.com',
                'password_label' => '密码',
                'password_placeholder' => '••••••••',
                'remember' => '记住我',
                'forgot' => '忘记密码？',
                'submit' => '立即登录',
                'processing' => '处理中...',
                'social_divider' => '或使用以下方式继续',
                'social_facebook' => 'Facebook',
                'social_github' => 'GitHub',
            ],
            'toggle_password' => [
                'show' => '显示密码',
                'hide' => '隐藏密码',
            ],
            'errors' => [
                'validation' => '请完整且正确地填写所有字段。',
                'credentials' => '邮箱或密码不正确。',
                'server' => '服务器发生错误。',
            ],
            'footer' => [
                'question' => '还没有账号？',
                'cta' => '立即免费注册',
            ],
        ],
    ],
    'profile' => [
        'default_name' => 'Chronos 探索者',
        'default_email' => 'email@chronos.app',
        'email_label' => '电子邮件',
        'status_label' => '状态',
        'status_active' => '账号已启用',
        'card_cta' => '设置',
        'sidebar_subtitle' => '管理你的个人偏好',
        'cards' => [
            'account' => [
                'title' => '账号设置',
                'description' => '管理登录偏好与安全。',
            ],
            'personal' => [
                'title' => '个人信息',
                'description' => '更新姓名与详细资料。',
            ],
            'language' => [
                'title' => '切换语言',
                'description' => '让 Chronos 与你常用的语言一致。',
            ],
            'appearance' => [
                'title' => '显示偏好',
                'description' => '切换主题与常用视图。',
            ],
        ],
        'language_preference' => [
            'title' => '语言偏好',
            'description' => '选择整个平台使用的语言。',
            'select_label' => '应用语言',
            'save' => '保存语言',
            'success' => '应用语言已切换为 :language。',
            'error' => '无法更新语言，请稍后再试。',
            'options' => [
                'id' => '印度尼西亚语',
                'en' => '英语',
                'zh' => '简体中文',
            ],
        ],
        'logout' => [
            'button' => '登出',
            'processing' => '正在登出...',
        ],
    ],
    'modals' => [
        'logout' => [
            'title' => '登出确认',
            'description' => '确定要退出 Chronos 账号吗？',
            'confirm' => '登出',
            'cancel' => '取消',
        ],
    ],
    'common' => [
        'processing' => '处理中...',
    ],
];
