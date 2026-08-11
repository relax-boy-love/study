export const appState = {
    keyword: "",
    users: [],
    selectedUser: null,
    status: "idle",
    searchController: null
};

const searchCache = new Map();

function createCacheKey(keyword) {
    return keyword
        .trim()
        .toLowerCase();
}
export function hasCachedSearch(keyword) {
    const cacheKey =
        createCacheKey(keyword);

    return searchCache.has(cacheKey);
}

export function getCachedSearch(keyword) {
    const cacheKey =
        createCacheKey(keyword);

    return searchCache.get(cacheKey);
}

export function setCachedSearch(
    keyword,
    users
) {
    const cacheKey =
        createCacheKey(keyword);

    // 保存cacheKey与users
    searchCache.set(cacheKey,users);
}

// 1. 用户输入关键词后，最先收到关键词的是哪个模块？   main

// 2. 真正执行fetch的是哪个模块？       api

// 3. API取得users后，数据先返回哪个模块？   main

// 4. 哪个模块把users变成li？       view

// 5. appState.users表示当前页面数据，还是所有历史缓存？   当前

// 6. searchCache表示当前页面数据，还是多个关键词的历史结果？    历史结果

// 7. setCachedSearch应该在请求前调用，还是请求成功取得users后调用？请求成功后

// 8. 点击用户后，userId最初从哪个HTML属性中取出？   button