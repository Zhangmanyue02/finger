# DuplexSdk - 主进程 IPC 双向通信模块

## 概述

`DuplexSdk` 是 Electron 主进程中的 IPC 双向通信 SDK，用于实现主进程与渲染进程之间的请求-响应、发布-订阅模式的通信。

## 核心功能

### 1. 请求-响应模式 (Request-Response)

#### `request(toId, eventName, data?, timeout?)`

向目标进程发送请求并等待响应。

**参数：**
- `toId: string` - 目标进程 ID
- `eventName: string` - 事件名称
- `data?: any` - 请求数据（可选）
- `timeout?: number` - 超时时间，默认 2000ms

**返回：** `Promise` - 响应数据

**示例：**
```typescript
// 主进程向渲染进程请求数据
const result = await ipc.request('renderer_1', 'get-user-info', { id: 123 })
```

#### `response(eventName, callback)`

注册响应处理函数，处理来自其他进程的请求。

**参数：**
- `eventName: string` - 事件名称
- `callback: (data, reply) => void` - 处理函数，`reply` 用于返回结果

**示例：**
```typescript
// 主进程注册响应服务
ipc.response('get-config', (data, reply) => {
  const config = loadConfig()
  reply(config)
})
```

#### `unresponse(eventName)`

注销响应处理函数。

---

### 2. 发布-订阅模式 (Pub-Sub)

#### `publisher(eventName, params)`

发布消息给所有订阅者。

**参数：**
- `eventName: string` - 事件名称
- `params: any` - 发布的数据

**示例：**
```typescript
// 主进程发布消息
ipc.publisher('config-changed', { theme: 'dark' })
```

#### `subscribe(toId, eventName, callback)`

订阅指定进程的事件。

**参数：**
- `toId: string` - 目标进程 ID
- `eventName: string | string[]` - 事件名称（支持数组）
- `callback: (args) => void` - 回调函数

**返回：** `() => void` - 取消订阅函数

**示例：**
```typescript
// 主进程订阅渲染进程事件
const unsubscribe = ipc.subscribe('renderer_1', 'user-action', (data) => {
  console.log('收到用户操作:', data)
})

// 取消订阅
unsubscribe()
```

#### `unsubscribe(toId, eventName, callback)`

取消订阅。

---

## 内部方法

### 进程管理

| 方法 | 说明 |
|------|------|
| `_register(name, process)` | 注册进程（BrowserWindow 或 WebContents） |
| `_unregister(name)` | 注销进程，并清理相关订阅 |

### 消息转发

| 方法 | 说明 |
|------|------|
| `_sendToRenderer(toId, params)` | 发送消息到渲染进程 |
| `_send(params)` | 内部发送方法 |
| `_requestResponseMessageForwarding(params)` | 请求响应消息转发 |

### 订阅管理

| 方法 | 说明 |
|------|------|
| `_subscribe(params)` | 内部订阅处理 |
| `_unsubscribe(params)` | 内部退订处理 |
| `_publisher(params)` | 内部发布处理 |
| `_getSubscriberTasks()` | 获取订阅任务列表 |

### 错误处理

| 方法 | 说明 |
|------|------|
| `_responseNoSerice(header)` | 服务未找到时的错误响应 |

---

## 消息类型常量

| 常量 | 说明 |
|------|------|
| `REQUEST` | 请求类型 |
| `REPONSE` | 响应类型 |
| `SUBSCRIBER` | 订阅类型 |
| `UNSUBSCRIBER` | 退订类型 |
| `PUBLISHER` | 发布类型 |

## 响应状态码

| 状态码 | 说明 |
|--------|------|
| `RESPONSE_OK` | 响应成功 |
| `RESPONSE_OVERTIME` | 请求超时 |
| `SERVICE_NOT_FOUND` | 服务未找到 |

## 使用示例

```typescript
import ipc from './duplext'

// 1. 注册服务
ipc.response('get-data', (params, reply) => {
  const data = fetchData()
  reply(data)
})

// 2. 请求渲染进程
const userInfo = await ipc.request('renderer_1', 'get-user', { id: 1 })

// 3. 发布消息
ipc.publisher('notification', { message: 'Hello' })

// 4. 订阅渲染进程事件
ipc.subscribe('renderer_1', 'user-event', (data) => {
  console.log('User event:', data)
})
```

## 注意事项

1. 进程会在首次通信时自动注册
2. 进程销毁时会自动清理订阅任务
3. 所有请求都有超时机制，默认 2 秒
4. 主进程 ID 为 `MAIN_PROCESS_NAME` 常量
