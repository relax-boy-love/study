const statusPanel = document.querySelector("#status-panel");

const statusMessage = document.querySelector("#status-message");

const userList = document.querySelector("#user-list");

const userDetail = document.querySelector("#user-detail");

const cancelButton = document.querySelector("#cancel-button");

export function showStatus(status, message) {
    // 修改data-status
    statusPanel.dataset.status = status;

    // 修改提示文字
    statusMessage.textContent = message;
    console.log(message)
}


export function clearUserList() {
    // 清空ul中的旧内容
    userList.textContent = "";
}

export function renderUsers(users) {
    // 每次渲染前清空旧列表
    clearUserList();

    users.forEach(function (user) {
        // 创建li
        const userItem = document.createElement("li");

        userItem.classList.add("user-item");

        // 创建可以点击的用户卡片
        const userCard = document.createElement("button");

        userCard.classList.add("user-card");
        userCard.type = "button";

        // 把用户ID保存在data-user-id中
        userCard.dataset.userId = user.id;

        // 创建头像
        const avatar = document.createElement("img");

        avatar.classList.add("user-avatar");
        avatar.src = user.image;
        avatar.alt = user.firstName + "的头像";

        // 创建文字容器
        const userInfo = document.createElement("span");

        userInfo.classList.add("user-info");

        // 创建姓名
        const userName = document.createElement("strong");

        userName.classList.add("user-name");

        userName.textContent =
            user.firstName +
            " " +
            user.lastName;

        // 创建邮箱
        const userEmail = document.createElement("span");

        userEmail.classList.add("user-email");
        userEmail.textContent = user.email;

        // 组装文字
        userInfo.append(
            userName,
            userEmail
        );

        // 组装按钮
        userCard.append(
            avatar,
            userInfo
        );

        // 组装li
        userItem.append(userCard);

        // 把li放进ul
        userList.append(userItem);
    });
}


export function showDetailMessage(message) {
    // 清空原详情
    userDetail.innerHTML = "";

    const messageElement = document.createElement("p");

    messageElement.textContent = message;

    userDetail.append(messageElement);
}

function createDetailRow(label, value) {
    const row = document.createElement("div");

    const term = document.createElement("dt");

    term.textContent = label;

    const description = document.createElement("dd");

    description.textContent = value ? value : "-";

    row.append(term, description);

    return row;
}

export function renderUserDetail(user) {
    userDetail.innerHTML = "";

    const detailCard = document.createElement("article");

    detailCard.classList.add("detail-card");

    const avatar = document.createElement("img");

    avatar.classList.add("detail-avatar");
    avatar.src = user.image;
    avatar.alt = user.firstName + "的头像";

    const name = document.createElement("h3");

    name.classList.add("detail-name");

    name.textContent = user.firstName + user.lastName;

    const detailList = document.createElement("dl");

    detailList.classList.add("detail-list");

    detailList.append(
        createDetailRow("邮箱", user.email),
        createDetailRow("电话", user.phone),
        createDetailRow("年龄", user.age),
        createDetailRow(
            "城市",
            user.address.city
        ),
        createDetailRow(
            "公司",
            user.company.name
        )
    );

    detailCard.append(
        avatar,
        name,
        detailList
    );

    userDetail.append(detailCard);
}



export function setCancelEnabled(enabled) {
  // enabled为true时，disabled应该是什么？
  if(enabled){
    cancelButton.disabled = false;
  }else{
    cancelButton.disabled = true;
  }
  

}