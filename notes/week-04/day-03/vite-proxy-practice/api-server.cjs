const http = require("http");

const PORT = 3000;

function sendJson(
    response,
    status,
    data
) {
    response.writeHead(
        status,
        {
            "Content-Type":
                "application/json; charset=utf-8"
        }
    );

    response.end(
        JSON.stringify(data)
    );
}

function readJson(request) {
    return new Promise(
        function (resolve, reject) {
            let body = "";

            request.on(
                "data",
                function (chunk) {
                    body += chunk;
                }
            );

            request.on(
                "end",
                function () {
                    try {
                        resolve(
                            body === ""
                                ? {}
                                : JSON.parse(body)
                        );
                    } catch (error) {
                        reject(error);
                    }
                }
            );

            request.on(
                "error",
                reject
            );
        }
    );
}

const server = http.createServer(
    async function (request, response) {
        console.log(
            request.method,
            request.url
        );

        if (
            request.method === "POST" &&
            request.url === "/login"
        ) {
            try {
                const body =
                    await readJson(request);

                if (
                    body.username !== "xiaoming" ||
                    body.password !== "123456"
                ) {
                    sendJson(
                        response,
                        401,
                        {
                            message:
                                "账号或密码错误"
                        }
                    );

                    return;
                }

                sendJson(
                    response,
                    200,
                    {
                        accessToken:
                            "demo-access-token"
                    }
                );
            } catch (error) {
                sendJson(
                    response,
                    400,
                    {
                        message:
                            "JSON格式错误"
                    }
                );
            }

            return;
        }

        if (
            request.method === "GET" &&
            request.url === "/profile"
        ) {
            const authorization =
                request.headers.authorization;

            if (
                authorization !==
                "Bearer demo-access-token"
            ) {
                sendJson(
                    response,
                    401,
                    {
                        message:
                            "登录状态无效"
                    }
                );

                return;
            }

            sendJson(
                response,
                200,
                {
                    id: 10,
                    name: "小明",
                    role: "student"
                }
            );

            return;
        }

        sendJson(
            response,
            404,
            {
                message: "接口不存在"
            }
        );
    }
);

server.listen(
    PORT,
    function () {
        console.log(
            `接口服务器：http://localhost:${PORT}`
        );
    }
);