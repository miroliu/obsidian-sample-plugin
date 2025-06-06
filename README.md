# Obsidian 示例插件

这是 Obsidian (https://obsidian.md) 的一个示例插件。

本项目使用 TypeScript 进行类型检查和文档编写。
该仓库依赖于最新的 TypeScript 定义格式的插件 API (obsidian.d.ts)，其中包含描述其功能的 TSDoc 注释。

这个示例插件展示了插件 API 可以实现的一些基本功能。

-   添加一个功能区图标，点击时会显示一条通知。
-   添加一个命令 “打开示例模态框”，用于打开一个模态框。
-   在设置页面添加一个插件设置选项卡。
-   注册一个全局点击事件，并在控制台输出 'click'。
-   注册一个全局定时器，在控制台记录 'setInterval'。

## 首次开发插件？

新插件开发者的快速入门指南：

-   检查 [是否已有其他人开发了你想要的插件](https://obsidian.md/plugins)！可能已经有足够相似的现有插件，你可以与其合作。
-   使用 “Use this template” 按钮将此仓库复制为模板（如果看不到该按钮，请登录 GitHub）。
-   将你的仓库克隆到本地开发文件夹。为方便起见，你可以将此文件夹放在 `.obsidian/plugins/your-plugin-name` 文件夹中。
-   安装 NodeJS，然后在仓库文件夹下的命令行中运行 `npm i`。
-   运行 `npm run dev` 将你的插件从 `main.ts` 编译为 `main.js`。
-   对 `main.ts` 进行更改（或创建新的 `.ts` 文件）。这些更改应该会自动编译到 `main.js` 中。
-   重新加载 Obsidian 以加载新版本的插件。
-   在设置窗口中启用插件。
-   若要更新 Obsidian API，请在仓库文件夹下的命令行中运行 `npm update`。

## 发布新版本

-   在 `manifest.json` 中更新你的新版本号，例如 `1.0.1`，以及你最新版本所需的最低 Obsidian 版本。
-   在 `versions.json` 文件中更新 `"new-plugin-version": "minimum-obsidian-version"`，以便旧版本的 Obsidian 可以下载兼容的旧版本插件。
-   使用你的新版本号作为 “标签版本” 创建新的 GitHub 版本。请使用准确的版本号，不要包含前缀 `v`。示例请见：https://github.com/obsidianmd/obsidian-sample-plugin/releases
-   上传 `manifest.json`、`main.js`、`styles.css` 文件作为二进制附件。注意：manifest.json 文件必须位于两个位置，一是你的仓库根路径，二是版本发布中。
-   发布版本。

> 你可以在手动更新 `manifest.json` 中的 `minAppVersion` 后，通过运行 `npm version patch`、`npm version minor` 或 `npm version major` 来简化版本号更新过程。
> 该命令将更新 `manifest.json` 和 `package.json` 中的版本号，并将新版本的条目添加到 `versions.json` 中。

## 将你的插件添加到社区插件列表

-   查看 [插件指南](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)。
-   发布初始版本。
-   确保你的仓库根目录下有一个 `README.md` 文件。
-   在 https://github.com/obsidianmd/obsidian-releases 提交拉取请求以添加你的插件。

## 如何使用

-   克隆此仓库。
-   确保你的 NodeJS 版本至少为 v16 (`node --version`)。
-   运行 `npm i` 或 `yarn` 安装依赖项。
-   运行 `npm run dev` 以监视模式启动编译。

## 手动安装插件

-   将 `main.js`、`styles.css`、`manifest.json` 复制到你的保险库 `VaultFolder/.obsidian/plugins/your-plugin-id/` 中。

## 使用 ESLint 提高代码质量（可选）

-   [ESLint](https://eslint.org/) 是一个用于快速分析代码问题的工具。你可以对插件运行 ESLint 以查找常见错误并改进代码。
-   若要在本项目中使用 ESLint，请确保从终端安装 ESLint：
    -   `npm install -g eslint`
-   若要使用 ESLint 分析本项目，请使用以下命令：
    -   `eslint main.ts`
    -   然后 ESLint 将生成一份报告，按文件和行号提供代码改进建议。
-   如果你的源代码位于一个文件夹中，例如 `src`，你可以使用以下命令使用 ESLint 分析该文件夹中的所有文件：
    -   `eslint .\src\`

## 资助链接

你可以在插件中包含资助链接，让使用你的插件的人可以提供财务支持。

简单的方法是在 `manifest.json` 文件中将 `fundingUrl` 字段设置为你的链接：
