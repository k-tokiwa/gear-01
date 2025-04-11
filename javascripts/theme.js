/**
 * テーマgear-01のカスタムJavaScript
 */

// デバッグログ用の関数
const isDebug = window.location.hostname === 'localhost' 
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname.includes('.local');

const debugLog = (message) => {
    if (isDebug) {
        console.log(`[Theme gear-01 Debug] ${message}`);
    }
};

// テーマ識別子
const THEME_ID = 'gear-01';

/**
 * ユーザーIDから色を生成
 * @param {string} userId ユーザーID
 * @returns {string} 色コード
 */
function generateColorFromUserId(userId) {
    const id = parseInt(userId, 10);
    const colors = [
        '#4CAF50', // グリーン
        '#2196F3', // ブルー
        '#9C27B0', // パープル
        '#F44336', // レッド
        '#FF9800', // オレンジ
        '#795548', // ブラウン
        '#009688', // ティール
        '#673AB7', // ディープパープル
        '#3F51B5', // インディゴ
        '#E91E63', // ピンク
        '#FFC107', // アンバー
        '#8BC34A'  // ライトグリーン
    ];
    return colors[id % colors.length];
}

/**
 * ユーザー情報をトップメニューに移動
 * @param {HTMLElement} userLink ユーザーリンク要素
 * @param {string} userName ユーザー名
 * @param {string} userId ユーザーID
 */
function moveUserToTopMenu(userLink, userName, userId) {
    const topMenu = document.getElementById('top-menu');
    if (!topMenu) {
        debugLog('トップメニューが見つかりません');
        return;
    }
    
    // 既存のアカウントセクションを取得
    const existingAccountSection = topMenu.querySelector('#account');
    const pluginLinks = [];
    
    if (existingAccountSection) {
        const nonStandardLinks = existingAccountSection.querySelectorAll('a:not(.my-account):not(.logout):not(.user)');
        nonStandardLinks.forEach(link => {
            const parentLi = link.closest('li');
            if (parentLi) {
                pluginLinks.push(parentLi.cloneNode(true));
            } else {
                const liElement = document.createElement('li');
                liElement.appendChild(link.cloneNode(true));
                pluginLinks.push(liElement);
            }
        });
    }
    
    // アカウントセクションを作成/更新
    let accountSection = existingAccountSection;
    if (!accountSection) {
        accountSection = document.createElement('div');
        accountSection.id = 'account';
        topMenu.appendChild(accountSection);
    }
    accountSection.innerHTML = '';
    
    // アバターの作成と表示
    const accountList = document.createElement('ul');
    accountList.className = 'account-menu';
    
    const userItem = document.createElement('li');
    const clonedUserLink = userLink.cloneNode(true);
    clonedUserLink.classList.add('user-avatar-link');
    clonedUserLink.setAttribute('data-user-id', userId);
    
    const avatarColor = generateColorFromUserId(userId);
    const originalText = clonedUserLink.textContent.trim();
    
    clonedUserLink.innerHTML = `
        <img src="/account/get_avatar/${userId}" 
             class="avatar-icon" 
             onerror="this.onerror=null; this.innerHTML='${userName.charAt(0).toUpperCase()}'; this.style.backgroundColor='${avatarColor}'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center';">
        <span class="avatar-name">${originalText}</span>
    `;
    
    userItem.appendChild(clonedUserLink);
    accountList.appendChild(userItem);
    
    // プラグインリンクの追加
        pluginLinks.forEach(link => {
            accountList.appendChild(link);
        });
    
    // 標準メニューの追加（data-method="post"属性を追加）
    accountList.innerHTML += `
        <li><a href="/my/account" class="my-account">マイアカウント</a></li>
        <li><a href="/logout" class="logout" data-method="post" rel="nofollow">ログアウト</a></li>
    `;
    
    accountSection.appendChild(accountList);
    
    // 元のログイン情報を非表示
    const loggedAs = document.getElementById('loggedas');
    if (loggedAs) {
        loggedAs.style.display = 'none';
    }
}

/**
 * ユーザーアバターの初期化
 */
function initUserAvatar() {
    debugLog('ユーザーアバターの初期化を開始します');
    
    const loggedAs = document.getElementById('loggedas');
    if (!loggedAs) {
        debugLog('ログイン情報が見つかりません。アバター初期化をスキップします');
        return;
    }
    
    const userLink = loggedAs.querySelector('a.user');
    if (!userLink) {
        debugLog('ユーザーリンクが見つかりません。アバター初期化をスキップします');
        return;
    }
    
    const userName = userLink.textContent.trim();
    const userHref = userLink.getAttribute('href');
    const userIdMatch = userHref.match(/\/users\/(\d+)/);
    
    if (userIdMatch && userIdMatch[1]) {
        const userId = userIdMatch[1];
        debugLog('ユーザー情報:', { name: userName, id: userId });
        moveUserToTopMenu(userLink, userName, userId);
    }
}

/**
 * 現在のページに対応するメニュー項目にactiveクラスを追加
 */
function addActiveClassToMenu() {
    const currentUrl = window.location.pathname;
    document.querySelectorAll('#top-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentUrl === href || (href !== '/' && currentUrl.startsWith(href)))) {
            link.classList.add('active');
            const parentLi = link.closest('li');
            if (parentLi) {
                parentLi.classList.add('active');
            }
        }
    });
}

/**
 * レスポンシブメニューの設定
 */
function setupResponsiveMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', handleMobileMenuToggle);
    }
}

/**
 * モバイルメニューのトグル処理
 */
function handleMobileMenuToggle() {
    const topMenu = document.getElementById('top-menu');
    if (topMenu) {
        topMenu.classList.toggle('visible');
    }
}

/**
 * トップメニューのカスタマイズ
 */
function initTopMenu() {
    debugLog('トップメニューのカスタマイズを開始します');
    addActiveClassToMenu();
    setupResponsiveMenu();
}

/**
 * サイドバーの状態を切り替え
 */
function toggleSidebar() {
    const main = document.getElementById('main');
    if (main) {
        main.classList.toggle('visible-sidebar');
        const currentState = main.classList.contains('visible-sidebar') ? 'visible' : 'hidden';
        localStorage.setItem('sidebar_state', currentState);
    }
}

/**
 * サイドバーの状態を読み込み
 */
function loadSidebarState() {
    const main = document.getElementById('main');
    if (main) {
        const sidebarState = localStorage.getItem('sidebar_state') || 'visible';
        main.classList.toggle('visible-sidebar', sidebarState === 'visible');
    }
}

/**
 * サイドバー制御の初期化
 */
function initializeSidebarToggle() {
    if (!document.getElementById('login-form') && !document.getElementById('main')?.classList.contains('nosidebar')) {
        const content = document.getElementById('content');
        if (content && !document.getElementById('sidebar-switch-panel')) {
            const switchPanel = document.createElement('div');
            switchPanel.id = 'sidebar-switch-panel';
            switchPanel.innerHTML = '<a id="sidebar-switch-button" href="#"></a>';
            content.prepend(switchPanel);

            document.getElementById('sidebar-switch-button')?.addEventListener('click', (e) => {
                e.preventDefault();
                toggleSidebar();
            });
        }
        loadSidebarState();
    }
}

/**
 * タブボタンの表示制御
 */
function checkTabsOverflow() {
    const tabs = document.querySelector('#content .tabs ul');
    if (tabs) {
        const tabsContainer = tabs.parentElement;
        const tabsButtons = tabsContainer?.querySelector('.tabs-buttons');
        if (tabsButtons) {
            tabsButtons.style.display = tabs.scrollWidth > tabs.clientWidth ? 'flex' : 'none';
        }
    }
}

/**
 * タブボタンの初期化
 */
function initializeTabButtons() {
    checkTabsOverflow();
    window.addEventListener('resize', checkTabsOverflow);
}

/**
 * ダークモード検出と設定
 */
function detectDarkMode() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const setDarkMode = (e) => {
        document.body.classList.toggle('dark-mode', e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', setDarkMode);
    setDarkMode(darkModeMediaQuery);
}

/**
 * ログインページの初期化
 */
function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const topMenu = document.getElementById('top-menu');
        if (topMenu) {
            topMenu.style.display = 'block';
        }
        
        // 背景イラストの追加
        const illustration = document.createElement('div');
        illustration.className = 'background-illustration';
        document.body.prepend(illustration);
        
        // ヘッダーの中央配置
        const header = document.getElementById('header');
        if (header) {
            header.style.margin = '0 auto';
        }
    }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', function initTheme() {
    // ページのパスをbody要素に設定
    document.body.setAttribute('data-path', window.location.pathname);
    
    debugLog('==== Theme gear-01 初期化開始 ====');
    
    initUserAvatar();
    initTopMenu();
    initializeSidebarToggle();
    initializeTabButtons();
    initializeLoginPage();
    detectDarkMode();
    
    debugLog('==== Theme gear-01 初期化完了 ====');
});
