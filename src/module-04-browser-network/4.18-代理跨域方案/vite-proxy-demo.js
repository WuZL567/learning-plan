/**
 * 4.18 代理跨域方案 - Vite proxy 配置示例
 *
 * 验收标准：
 * 1. 能写出完整的 Vite proxy 配置（vite.config.ts 格式）
 * 2. 能写出完整的 Nginx proxy 配置（nginx.conf 格式）
 * 3. 配置能处理路径重写（rewrite）
 * 4. 理解 changeOrigin 的作用
 *
 * 要求：
 * - 场景：前端 http://localhost:5173 请求后端 http://api.example.com/v1/users
 * - Vite 配置：将 /api 开头的请求代理到后端，并重写路径去掉 /api
 * - Nginx 配置：生产环境同样的代理逻辑
 */

// ========== Vite proxy 配置 ==========
// 在 vite.config.ts 中：

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 场景：前端请求 /api/users，实际转发到 http://api.example.com/v1/users
      '/api': {
        target: 'http://api.example.com',  // 目标服务器地址
        changeOrigin: true,                 // 修改请求头的 Origin 字段，让后端以为请求来自同源
        rewrite: (path) => path.replace(/^\/api/, '/v1')  // 路径重写：去掉 /api 前缀，加上 /v1
      }
    }
  }
})

/**
 * 工作流程：
 * 1. 前端代码：fetch('http://localhost:5173/api/users')
 * 2. Vite Dev Server 拦截到 /api 开头的请求
 * 3. 修改请求头 Origin 为 http://api.example.com（changeOrigin: true）
 * 4. 路径重写：/api/users → /v1/users
 * 5. 转发到 http://api.example.com/v1/users
 * 6. 后端返回数据，Vite 转发回前端
 *
 * 为什么 changeOrigin 重要？
 * 有些后端会校验请求头的 Origin 字段，如果是 localhost:5173 会拒绝。
 * changeOrigin: true 会把 Origin 改成目标服务器的地址，让后端以为是同源请求。
 */


// ========== Nginx 代理配置 ==========
// 在 nginx.conf 中：

/**
server {
    listen 80;
    server_name www.mysite.com;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;  # Vue/React 的 History 模式路由支持
    }

    # API 代理
    location /api/ {
        proxy_pass http://api.example.com/v1/;  # 注意末尾的斜杠，表示替换 /api/
        proxy_set_header Host $host;            # 保留原始请求的 Host 头
        proxy_set_header X-Real-IP $remote_addr;           # 传递真实客户端 IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 代理链路中的所有 IP
        proxy_set_header X-Forwarded-Proto $scheme;        # 传递协议（http/https）
    }
}

工作流程：
1. 浏览器请求：http://www.mysite.com/api/users
2. Nginx 匹配到 location /api/
3. 转发到 http://api.example.com/v1/users（/api/ 被替换为 /v1/）
4. 设置必要的请求头，让后端知道真实客户端信息
5. 后端返回数据，Nginx 转发回浏览器

关键配置说明：
- proxy_pass 末尾的斜杠：有斜杠表示替换路径前缀，无斜杠表示拼接
  - proxy_pass http://api.example.com/v1/; → 请求 /api/users 变成 /v1/users
  - proxy_pass http://api.example.com/v1  → 请求 /api/users 变成 /v1/api/users
- proxy_set_header 传递客户端真实信息，否则后端只能看到 Nginx 的 IP
*/
