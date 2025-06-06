import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 记得重命名这些类和接口！

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 创建左侧功能区图标
		const ribbonIconEl = this.addRibbonIcon('dice', '示例插件', (evt: MouseEvent) => {
			// 用户点击图标时触发
			new Notice('这是一条提示！');
		});
		// 为图标添加自定义类
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// 添加底部状态栏项（移动端不可用）
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('状态栏文本');

		// 添加一个可在任意位置触发的简单命令
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: '打开示例模态框（简单）',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// 添加一个编辑器命令，可对当前编辑器实例执行操作
		this.addCommand({
			id: 'sample-editor-command',
			name: '示例编辑器命令',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('示例编辑器命令');
			}
		});
		// 添加一个复杂命令，可检查应用当前状态是否允许执行该命令
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: '打开示例模态框（复杂）',
			checkCallback: (checking: boolean) => {
				// 检查当前是否为Markdown视图
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// 非检查模式时实际执行操作
					if (!checking) {
						new SampleModal(this.app).open();
					}
					// 返回true表示命令可用
					return true;
				}
			}
		});

		// 添加设置选项卡，用户可配置插件的各项参数
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// 注册全局DOM点击事件（插件禁用时自动移除监听器）
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('点击事件', evt);
		});

		// 注册定时任务（插件禁用时自动清除）
		this.registerInterval(window.setInterval(() => console.log('定时任务执行'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		// 模态框打开时设置内容文本
		contentEl.setText('哇哦！');
	}

	onClose() {
		const {contentEl} = this;
		// 模态框关闭时清空内容区域
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		// 清空容器内容
		containerEl.empty();

		// 添加文本输入设置项
		new Setting(containerEl)
			.setName('设置1')
			.setDesc('这是一个秘密')
			.addText(text => text
				.setPlaceholder('输入你的秘密')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
