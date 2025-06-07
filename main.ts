import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 记得重命名这些类和接口！

interface MyPluginSettings {
	apiUrl: string;
	model: string;
	apiKey: string;
	voice: string;
	imageModel: string;
	imageSize: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiUrl: 'https://api.siliconflow.cn/v1/audio/speech',
	model: 'FunAudioLLM/CosyVoice2-0.5B',
	apiKey: 'Bearer <your-api-key>',
	voice: 'diana',
	imageModel: 'Kwai-Kolors/Kolors',
	imageSize: '720x1440'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	currentAudio: HTMLAudioElement | null = null;

	async fetchAndPlayAudio(text: string) {
		try {
		const response = await fetch(this.settings.apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.settings.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: this.settings.model,
				input: `${text}`,
				response_format: 'mp3',
				sample_rate: 32000,
				stream: true,
				speed: 1,
				gain: 0,
				voice: `${this.settings.model}:${this.settings.voice}`
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
		}
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		new Notice('AI朗读中...', 5000);
		this.currentAudio = new Audio(audioUrl);
		this.currentAudio.play();
	} catch (error) {
		new Notice(`语音生成失败: ${error instanceof Error ? error.message : '网络错误'}`);
	}
	}

	async onload() {
		const plugin = this;
		await this.loadSettings();

		// 创建左侧功能区图标（语音合成）
		const ttsRibbonIconEl = this.addRibbonIcon('microphone', '文本转语音', (evt: MouseEvent) => {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				const editor = markdownView.editor;
				const selectedText = editor.getSelection();
				if (selectedText) {
					this.fetchAndPlayAudio(selectedText);
				} else {
					new Notice('请先选择要转换的文本');
				}
			} else {
				new Notice('当前未打开Markdown文档');
			}
		});
		// 为图标添加自定义类
		ttsRibbonIconEl.addClass('tts-plugin-ribbon-class');
		// 为图标添加自定义类
		ttsRibbonIconEl.addClass('my-plugin-ribbon-class');

		// 添加底部状态栏项（移动端不可用）
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('状态栏文本');

		// 添加文本转语音命令（编辑器专用）
		this.addCommand({
			id: 'editor-text-to-speech',
			name: '编辑器文本转语音',
			editorCallback: (editor) => {
				const selectedText = editor.getSelection();
				if (selectedText) {
					this.fetchAndPlayAudio(selectedText);
				} else {
					new Notice('请先选择要转换的文本');
				}
			}
		});

		// 添加全局文本转语音命令（命令面板可用）
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

		this.addCommand({
			id: 'stop-audio-playback',
			name: '停止语音播放',
			callback: () => {
				if (plugin.currentAudio) {
					plugin.currentAudio.pause();
					plugin.currentAudio = null;
					new Notice('已停止播放');
				}
			}
		});

		this.addCommand({
			id: 'generate-image',
			name: '生成图片',
			editorCallback: (editor) => {
				const selectedText = editor.getSelection();
				if (selectedText) {
					const settingTab = new SampleSettingTab(this.app, this);
					settingTab.generateAndDownloadImage(selectedText);
				} else {
					new Notice('请先选择要作为提示词的文本');
				}
			}
		});



		// 添加设置选项卡，用户可配置插件的各项参数
		this.addSettingTab(new SampleSettingTab(this.app, this));

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
	async downloadImage(url: string, filename: string) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const blob = await response.blob();
			const arrayBuffer = await blob.arrayBuffer();
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				const parentPath = activeFile.parent?.path || '';
				const attachmentsDir = `${parentPath}/attachGen`;
				if (!await this.plugin.app.vault.adapter.exists(attachmentsDir)) {
					await this.plugin.app.vault.adapter.mkdir(attachmentsDir);
				}
				await this.plugin.app.vault.adapter.writeBinary(`${attachmentsDir}/${filename}`, arrayBuffer);
			}
			new Notice('图片已保存到附件目录');
		} catch (error) {
			new Notice(`图片下载失败: ${error instanceof Error ? error.message : '网络错误'}`);
		}
	}

	async generateAndDownloadImage(prompt: string) {
		try {
			const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.plugin.settings.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: this.plugin.settings.imageModel,
					prompt: prompt,
					image_size: this.plugin.settings.imageSize,
					batch_size: 1,
					num_inference_steps: 20,
					guidance_scale: 7.5
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const imageUrl = data.images[0].url;
			const timestamp = new Date().getTime();
			const filename = `generated-${timestamp}.png`;
			await this.downloadImage(imageUrl, filename);
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			const activeFile = this.app.workspace.getActiveFile();
			if (activeView && activeFile) {
				const editor = activeView.editor;
				const parentPath = activeFile.parent?.path || '';
				editor.replaceSelection(`\n\n![[${parentPath}/attachGen/${filename}]]`);
			}
		} catch (error) {
			new Notice(`图片生成失败: ${error instanceof Error ? error.message : '网络错误'}`);
		}
	}
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
					if (!value.trim()) {
						new Notice('API地址不能为空');
						return;
					}
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('模型名称')
			.addText(text => text
				.setPlaceholder('FunAudioLLM/CosyVoice2-0.5B')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					if (!value.trim()) {
						new Notice('模型名称不能为空');
						return;
					}
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('音色选择')
			.addDropdown(dropdown => dropdown
				.addOptions({
					'diana': 'Diana',
					'alex': 'Alex',
					'anna': 'Anna',
					'bella': 'Bella',
					'benjamin': 'Benjamin',
					'charles': 'Charles',
			
					'claire': 'Claire',
					'david': 'David'

				})
				.setValue(this.plugin.settings.voice)
				.onChange(async (value) => {
					this.plugin.settings.voice = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API密钥')
			.addText(text => text
				.setPlaceholder('apikey>')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					if (!value.trim()) {
						new Notice('API密钥不能为空');
						return;
					}
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('图片模型')
			.addText(text => text
				.setPlaceholder('Kwai-Kolors/Kolors')
				.setValue(this.plugin.settings.imageModel)
				.onChange(async (value) => {
					if (!value.trim()) {
						new Notice('图片模型不能为空');
						return;
					}
					this.plugin.settings.imageModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('图片尺寸')
			.addText(text => text
				.setPlaceholder('720x1440')
				.setValue(this.plugin.settings.imageSize)
				.onChange(async (value) => {
					if (!value.trim()) {
						new Notice('图片尺寸不能为空');
						return;
					}
					this.plugin.settings.imageSize = value;
					await this.plugin.saveSettings();
				}));
	}
}
