const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const publicDirectory = path.join(
    __dirname,
    "public"
);

function sendFile(
    response,
    fileName,
    contentType,
    headers = {}
) {
    const filePath = path.join(
        publicDirectory,
        fileName
    );

    fs.readFile(
        filePath,
        function (error, content) {
            if (error) {
                response.writeHead(
                    500,
                    {
                        "Content-Type":
                            "text/plain; charset=utf-8"
                    }
                );

                response.end("读取文件失败");
                return;
            }

            response.writeHead(
                200,
                {
                    "Content-Type": contentType,
                    ...headers
                }
            );

            response.end(content);
        }
    );
}

const server = http.createServer(
    function (request, response) {
        console.log(
            request.method,
            request.url
        );

        if (request.url === "/") {
            sendFile(
                response,
                "index.html",
                "text/html; charset=utf-8",
                {
                    "Cache-Control": "no-store"
                }
            );

            return;
        }

        if (request.url === "/style.css") {
            sendFile(
                response,
                "style.css",
                "text/css; charset=utf-8",
                {
                    "Cache-Control":
                        "public, max-age=60"
                }
            );

            return;
        }

        if (request.url === "/app.js") {
            const etag = '"app-version-1"';

            if (
                request.headers[
                    "if-none-match"
                ] === etag
            ) {
                response.writeHead(
                    304,
                    {
                        ETag: etag,
                        "Cache-Control": "no-cache"
                    }
                );

                response.end();
                return;
            }

            sendFile(
                response,
                "app.js",
                "text/javascript; charset=utf-8",
                {
                    ETag: etag,
                    "Cache-Control": "no-cache"
                }
            );

            return;
        }

        response.writeHead(
            404,
            {
                "Content-Type":
                    "text/plain; charset=utf-8"
            }
        );

        response.end("资源不存在");
    }
);

server.listen(
    PORT,
    function () {
        console.log(
            `服务器已启动：http://localhost:${PORT}`
        );
    }
);