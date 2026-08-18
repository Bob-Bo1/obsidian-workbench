# Obsidian Workbench for DSH

在 DeepSeek Harness 内打开一个 Obsidian 风格的三栏工作台：

- 左侧：当前 Obsidian 仓库的目录和文件
- 中间：基于 CodeMirror 6 的 Markdown Live Preview 编辑器，内容自动保存
- 右侧：当前 DSH 会话，可围绕正在查看的笔记提问
- 右侧顶部可切换 DSH 最近对话，并按工作区新建对话
- 支持拖动三栏分隔线、滚轮滚动、模型切换和权限切换
- 编辑内容会自动保存；左侧支持搜索、新建、重命名、移动、删除和把文件或文件夹内容加入对话

当前版本面向 Windows + DSH Web profile。它读取本机 Obsidian 配置中的仓库，不会启动 Obsidian 客户端。

## 安装

先下载或克隆本仓库，然后把插件目录链接到 DSH：

```powershell
git clone https://github.com/Bob-Bo1/obsidian-workbench.git D:\Tools\obsidian-workbench
dsh plugin --profile web add link:D:\Tools\obsidian-workbench
```

随后在 Web profile 的 `cordis.patch.yml` 中加入：

```yaml
- insert:
    - id: obsidian-workbench
      name: 'obsidian-workbench'
```

重启 DSH Web profile，在左下角打开 Obsidian 工作台。

## 仓库选择

默认读取 Windows 当前 Obsidian 配置中的打开仓库；也可以通过环境变量指定仓库：

```powershell
$env:OBSIDIAN_VAULT_PATH = 'D:\你的仓库路径'
```

环境变量优先级高于 Obsidian 自动识别结果。

## 安全边界

- 只开放仓库根目录内的 Markdown、文本和图片文件。
- `.obsidian` 和其他隐藏目录不会通过接口开放。
- 会拒绝 `..` 路径、符号链接和 junction 指向仓库外部的路径。
- 单个笔记或保存内容超过 4 MB 时会被拒绝。
- 插件接口默认只供 DSH 同源页面使用，不开放通配跨域访问。

## 当前限制

- 预览支持标题、空行和 Wiki 链接的基础展示。
- 暂未复刻 Dataview、Tasks、Canvas 和其他 Obsidian 插件运行时。
- 当前支持新建 Markdown 笔记、新建文件夹，以及把笔记或文件夹移动到仓库内其他位置。
- 支持按文件名和正文搜索 Markdown、Markdown 扩展名及文本笔记。
- 编辑区使用单个 CodeMirror 文档处理整篇笔记；光标所在行显示 Markdown 标记，离开后隐藏标记，`##X##` 会显示为加粗文字。
- 空白笔记首次点击会进入加粗主题输入，按回车后进入普通正文输入；支持行内 `##X##` 加粗。
- 笔记修改使用自动保存，不再提供手动保存按钮。
- 右键菜单支持删除笔记或文件夹，内容会先移入插件回收站；删除文件夹会连同内部内容一起移动，并需要确认，删除后可立即撤销。
- 移动操作支持按住条目拖到目标文件夹，也保留长按后点击目标文件夹的方式；移动到仓库根目录可在提示条中操作。
- 右击文件或文件夹可选择“加入对话”；内容会先以文件卡片显示在输入框上方，发送时再作为上下文提交。文件夹会递归读取其中的 Markdown 和文本笔记，并在内容过多时自动截取。
- 仓库变化需要重新展开目录或重新打开工作台后查看。

## 开发检查

在插件目录执行：

```powershell
npm run check
```

该命令会重新打包 CodeMirror 客户端文件，并检查 Host、源码 Client 和生成 Client 的 JavaScript 语法。
