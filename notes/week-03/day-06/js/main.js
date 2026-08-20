const menuButton =
    document.querySelector("#menu-button");

const siteNav =
    document.querySelector("#site-nav");

function closeMenu() {
    // 删除打开状态类名
    siteNav.classList.remove(
        "site-nav--open"
    );

    // 更新无障碍状态
    menuButton.setAttribute(
        "aria-expanded",
        false
    );

    // 更新按钮说明
    menuButton.setAttribute(
        "aria-label",
        "打开导航菜单"
    );
}

menuButton.addEventListener(
    "click",
    function () {
        // 切换菜单类名，并取得切换后的状态
        const isOpen =
            siteNav.classList.toggle(
                "site-nav--open"
            );

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "关闭导航菜单"
                : "打开导航菜单"
        );
    }
);

document.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    }
);

siteNav.addEventListener(
    "click",
    function (event) {
        const link =
            event.target.closest("a");

        if (link === null) {
            return;
        }

        closeMenu();
    }
);