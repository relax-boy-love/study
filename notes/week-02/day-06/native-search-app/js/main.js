import {
    searchUsers,
    getUserById
} from "./api.js";

import {
    showStatus,
    renderUsers,
    clearUserList,
    showDetailMessage,
    renderUserDetail,
    setCancelEnabled

} from "./view.js";

import {
    appState,
    hasCachedSearch,
    getCachedSearch,
    setCachedSearch
} from "./state.js";

const searchInput = document.querySelector("#search-input");


//防抖
function debounce(fn, delay) {
    let timerId;

    return function (...args) {
        const context = this;

        clearTimeout(timerId);

        timerId = setTimeout(function () {
            fn.apply(
                context,
                args
            );
        }, delay);
    };
}

const debouncedSearch = debounce(
    function (keyword) {
        runSearch(keyword);
    },
    500
);

searchInput.addEventListener(
    "input",
    function (event) {
        const keyword = event.target.value.trim();

        debouncedSearch(keyword);
    }
);





async function runSearch(keyword) {

    // 如果存在旧搜索请求，先取消
    if (appState.searchController !== null) {
        /* 调用旧控制器的取消方法 */
        appState.searchController.abort();
        appState.searchController = null;
        setCancelEnabled(false);
    }
    showDetailMessage("选择一名用户查看详情");

    // 1. 关键词为空
    if (keyword === "") {
        appState.keyword = "";
        appState.users = [];
        appState.selectedUser = null;
        appState.status = "idle";
        showStatus(
            "idle",
            "请输入姓名开始搜索"
        );
        showDetailMessage(
            "选择一名用户查看详情"
        );


        clearUserList();
        return;
    }



    // 检查缓存
    if (hasCachedSearch(keyword)) {
        /* 从缓存取得用户 */
        const cachedUsers = getCachedSearch(keyword);

        appState.keyword = keyword;
        appState.users = cachedUsers;

        // 根据缓存数组是否为空设置状态
        if (cachedUsers.length === 0) {
            appState.status = "empty";

            showStatus(
                "empty",
                "没有找到相关用户（来自缓存）"
            );

            clearUserList();
            return;
        }

        appState.status = "success";

        // 展示缓存数据
        renderUsers(cachedUsers);

        showStatus(
            "success",
            "找到" +
            cachedUsers.length +
            "名用户（来自缓存）"
        );

        setCancelEnabled(false);

        return;
    }


    // 为本次请求创建控制器
    const controller = new AbortController();

    // 保存为最新搜索控制器
    appState.searchController = controller;

    // 请求进行中，允许点击取消
    setCancelEnabled(true);

    appState.keyword = keyword;
    appState.users = [];
    appState.status = "loading";

    console.log("请求开始状态：", appState);

    // 2. 请求开始
    showStatus(
        "loading",
        "正在搜索“" + keyword + "”……"
    );

    clearUserList();

    try {
        // 3. 调用api.js
        const users = await searchUsers(keyword, controller.signal);
        // 如果这已经不是最新请求，不允许继续更新状态和缓存
        if (
            controller !==
            appState.searchController
        ) {
            return;
        }
        appState.users = users;
        setCachedSearch(
            keyword,
            users
        );

        // 4. 空数据状态
        if (users.length === 0) {
            showStatus(
                "empty",
                "没有找到相关用户"
            );
            appState.status = "empty";
            console.log("空数据状态：", appState);
            return;
        }

        // 5. 展示用户
        renderUsers(users);

        showStatus(
            "success",
            "找到" + users.length + "名用户"
        );
        appState.status = "success";
        console.log("成功状态：", appState);

    } catch (error) {
        if (error.name === "AbortError") {
            console.log(
                "旧搜索请求已取消：" + keyword
            );

            return;
        }

        // 如果当前函数已经不是最新请求，
        // 它产生的其他错误也不能更新页面
        if (controller !== appState.searchController) {
            return;
        }
        // 6. 错误状态
        showStatus(
            "error",
            error.message
        );
        appState.users = [];
        appState.status = "error";
        clearUserList();
    } finally {
        if (controller === appState.searchController) {
            appState.searchController = null;

            setCancelEnabled(
                false
            );
        }
    }
}



const userList = document.querySelector("#user-list");

userList.addEventListener(
    "click",
    function (event) {
        const userCard = event.target.closest(".user-card");

        if (userCard === null) {
            return;
        }

        const userId = Number(userCard.dataset.userId);

        loadUserDetail(userId);
    }
);


async function loadUserDetail(userId) {
    showDetailMessage("正在加载用户详情……");

    try {
        // 调用api.js取得详情
        const user = await getUserById(userId);

        // 保存到state.js
        appState.selectedUser = user;
        
        // 调用view.js展示
        renderUserDetail(user);

    } catch (error) {
        showDetailMessage(
            "详情加载失败：" + error.message
        );
    }
}



const cancelButton = document.querySelector("#cancel-button");

cancelButton.addEventListener(
    "click",
    function () {
        // 1. 取得当前搜索控制器
        const controller = appState.searchController;

        // 2. 如果没有正在进行的请求，结束
        if (controller === null) {
            return;
        }

        // 3. 取消当前请求
        controller.abort();

        // 4. 清空状态中的控制器
        appState.searchController = null;

        // 5. 更新应用状态
        appState.status = "idle";

        // 6. 禁用取消按钮
        setCancelEnabled(false);

        // 7. 显示取消状态
        showStatus(
            "idle",
            "搜索请求已取消"
        );
    }
);