const requestButton =
    document.querySelector(
        "#request-button"
    );

const result =
    document.querySelector(
        "#result"
    );

requestButton.addEventListener(
    "click",
    function () {
        result.textContent =
            "JavaScript文件已经成功执行";
    }
);

console.log(
    "app.js执行时间：",
    new Date().toLocaleTimeString()
);

// 1. node server.js是否成功启动？  是

// 2. 浏览器能否打开http://localhost:3000？  是

// 3. 页面样式是否正常显示？  可以

// 4. 点击按钮后是否显示“JavaScript文件已经成功执行”？  是

// 5. Network中是否能找到document、style.css和app.js三个请求？   可以

// 1. 主HTML第一次请求的Status是多少？  200

// 2. Response Headers中的Cache-Control是什么？  no-store

// 3. 第二次普通刷新后，主HTML是否仍然发送了请求？  是

// 4. 主HTML的Size显示实际传输大小，还是memory/disk cache？  实际传输大小

// 5. 为什么no-store下不能直接使用本地缓存？  表示不要存储该响应的缓存 浏览器没有存储缓存

// 6. style.css的Cache-Control是什么？  public, max-age=60

// 7. max-age的单位是什么？  秒

// 8. 60秒内再次请求时，Size显示什么？  0B

// 9. Request Headers中是否出现If-None-Match或  If-Modified-Since？  没有

// 10. 这次CSS请求是否向服务器进行了缓存验证？   没有

// 11. 根据以上证据，CSS命中的是强缓存还是协商缓存？   强缓存

// 12. app.js第一次响应的Status是多少？  200

// 13. 第一次响应是否包含ETag？值是什么？  是   "app-version-1"

// 14. 再次请求时，Request Headers中是否包含If-None-Match？  是

// 15. If-None-Match的值是什么？  "app-version-1"

// 16. 服务器第二次返回200还是304？  304

// 17. 304是否包含完整的app.js响应体？  没有

// 18. 浏览器最终使用哪里的JavaScript内容？   本地缓存里面的

// 19. 这属于强缓存还是协商缓存？  协商

// 20. 为什么Cache-Control: no-cache仍然能够使用本地缓存？  Cache-Control: no-cache不是不允许缓存 而是可以缓存但是需要向服务器确认

// 21. style.css是否重新从网络请求？  是

// 22. app.js是否重新返回200和完整内容？是

// 23. 是否还看到memory cache或disk cache？  美元

// 24. Disable cache的作用是什么？  禁用缓存

// 25. 实验完成后为什么应该取消勾选Disable cache？  需要使用缓存提升性能