# work

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### 测试环境部署使用本地菜单构建命令
```
yarn build-dev
```
### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

sftp
```json
{
  "name": "omall",
  "context": "dist",
  "remotePath": "/opt/app/omall",
  "ignore": [".vscode", ".git", ".DS_Store"],
  "profiles": {
    "main": {
      "host": "10.255.244.20",
      "username": "root",
      "password": "dang@951AP"
    }
  },
  "defaultProfile": "main"
}
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
