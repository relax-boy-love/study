import "./style.css";

const directLoginButton =
    document.querySelector(
        "#direct-login"
    );

const proxyLoginButton =
    document.querySelector(
        "#proxy-login"
    );

const result =
    document.querySelector(
        "#result"
    );

let accessToken = "";

async function login(loginUrl) {
    const response = await fetch(
        loginUrl,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                username: "xiaoming",
                password: "123456"
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "登录失败：" +
            response.status
        );
    }

    return response.json();
}

async function loadProfile(profileUrl) {
    const response = await fetch(
        profileUrl,
        {
            headers: {
                Authorization:
                    "Bearer " +
                    accessToken
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "获取用户失败：" +
            response.status
        );
    }

    return response.json();
}

directLoginButton.addEventListener(
    "click",
    async function () {
        result.textContent =
            "正在直接请求……";

        try {
            await login(
                "http://localhost:3000/login"
            );

            result.textContent =
                "直接请求成功";
        } catch (error) {
            result.textContent =
                "直接请求失败：" +
                error.message;

            console.error(error);
        }
    }
);

proxyLoginButton.addEventListener(
    "click",
    async function () {
        result.textContent =
            "正在通过代理登录……";

        try {
            const loginData =
                await login("/api/login");

            accessToken =
                loginData.accessToken;

            const profile =
                await loadProfile(
                    "/api/profile"
                );

            result.textContent =
                JSON.stringify(
                    profile,
                    null,
                    2
                );
        } catch (error) {
            result.textContent =
                error.message;

            console.error(error);
        }
    }
);