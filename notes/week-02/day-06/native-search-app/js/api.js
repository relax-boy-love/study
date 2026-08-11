const API_BASE_URL = "https://dummyjson.com";

async function requestJson(path, options = {}) {
  // 1. 拼接基础地址和path，并发送请求
  const response = await fetch(API_BASE_URL + path, options);

  // 2. 判断HTTP状态
  if (!response.ok) {
    throw new Error(
      "请求失败，状态码：" + response.status
    );
  }

  // 3. 解析并返回JSON数据
  const data = await response.json();

  return data;
}

export async function searchUsers(keyword, signal) {
  // 删除关键词两端空格
  const normalizedKeyword = keyword.trim();

  // 安全地处理中文、空格和特殊字符
  const encodedKeyword = encodeURIComponent(normalizedKeyword);

  const path = "/users/search?q=" + encodedKeyword

  // 使用公共请求函数
  const data = await requestJson(path, {
    signal
  });

  // 接口返回对象，真正的数组在users中
  return data.users;
}


export async function getUserById(userId, signal) {
  const encodedUserId = encodeURIComponent(userId);
  /* 对userId进行URL编码 */

  const path = "/users/" + encodedUserId;

  const user = await requestJson(path, {
    signal
  });

  return user;
}


// 1. 真实API搜索最终执行几次？  2

// 2. 第一次John来自哪里？  api

// 3. 第二次John来自哪里？  state

// 4. john为什么可以命中John的缓存？    因为做了大小写和空格处理

// 5. 带空格的 JOHN 为什么可以命中？     因为做了大小写和空格处理

// 6. 缓存命中后，runSearch还会不会创建新控制器？  不会