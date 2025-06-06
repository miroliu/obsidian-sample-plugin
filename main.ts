import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 记得重命名这些类和接口！

interface MyPluginSettings {
	apiUrl: string;
	model: string;
	apiKey: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiUrl: 'https://api.siliconflow.cn/v1/audio/speech',
	model: 'FunAudioLLM/CosyVoice2-0.5B',
	apiKey: 'Bearer <your-api-key>'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async fetchAndPlayAudio(text: string) {
		const response = await fetch(this.settings.apiUrl, {
			method: 'POST',
			headers: {
				Authorization: this.settings.apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: this.settings.model,
				input: text,
				response_format: 'mp3'
			})
		});

		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		new Audio(audioUrl).play();
	}

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

		// 添加文本转语音命令
		this.addCommand({
			id: 'text-to-speech',
			name: '文本转语音',
			editorCallback: (editor) => {
				const selectedText = editor.getSelection();
				if (selectedText) {
					this.fetchAndPlayAudio(selectedText);
				} else {
					new Notice('请先选择要转换的文本');
				}
			}
		});

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
			.setName('API 配置')
			.addText(text => text
				.setPlaceholder('https://api.siliconflow.cn/v1/audio/speech')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('模型名称')
			.addText(text => text
				.setPlaceholder('FunAudioLLM/CosyVoice2-0.5B')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API密钥')
			.addText(text => text
				.setPlaceholder('Bearer <your-api-key>')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
