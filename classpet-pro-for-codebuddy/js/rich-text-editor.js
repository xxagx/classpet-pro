// ClassPet Pro - 富文本编辑器组件
// 支持文本格式化、列表、链接插入、代码块等编辑功能

class RichTextEditor {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = null;
        this.editor = null;
        this.toolbar = null;
        this.options = {
            placeholder: '请输入内容...',
            maxHeight: 300,
            minHeight: 100,
            ...options
        };
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
    }

    // 初始化编辑器
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error('编辑器容器不存在:', this.containerId);
            return;
        }

        this.container.innerHTML = this.createEditorHTML();
        this.setupEditor();
        this.setupToolbar();
        this.setupEventListeners();
        this.saveHistory();
    }

    // 创建编辑器HTML
    createEditorHTML() {
        return `
            <div class="rich-text-editor">
                <div class="editor-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="undo" title="撤销 (Ctrl+Z)">↶</button>
                        <button class="toolbar-btn" data-command="redo" title="重做 (Ctrl+Y)">↷</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="bold" title="粗体 (Ctrl+B)"><b>B</b></button>
                        <button class="toolbar-btn" data-command="italic" title="斜体 (Ctrl+I)"><i>I</i></button>
                        <button class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)"><u>U</u></button>
                        <button class="toolbar-btn" data-command="strikeThrough" title="删除线"><s>S</s></button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <select class="toolbar-select" data-command="fontSize" title="字体大小">
                            <option value="">字号</option>
                            <option value="1">小</option>
                            <option value="3">正常</option>
                            <option value="5">大</option>
                            <option value="7">特大</option>
                        </select>
                        
                        <select class="toolbar-select" data-command="fontName" title="字体">
                            <option value="">字体</option>
                            <option value="微软雅黑">微软雅黑</option>
                            <option value="宋体">宋体</option>
                            <option value="黑体">黑体</option>
                            <option value="Arial">Arial</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="foreColor" title="文字颜色">
                            <input type="color" class="color-picker" data-command="foreColor" value="#000000">
                            A
                        </button>
                        <button class="toolbar-btn" data-command="hiliteColor" title="背景颜色">
                            <input type="color" class="color-picker" data-command="hiliteColor" value="#ffffff">
                            <span style="background: yellow; padding: 0 2px;">A</span>
                        </button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="justifyLeft" title="左对齐">⫷</button>
                        <button class="toolbar-btn" data-command="justifyCenter" title="居中">☰</button>
                        <button class="toolbar-btn" data-command="justifyRight" title="右对齐">⫸</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="insertOrderedList" title="有序列表">1.</button>
                        <button class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">•</button>
                        <button class="toolbar-btn" data-command="indent" title="增加缩进">→</button>
                        <button class="toolbar-btn" data-command="outdent" title="减少缩进">←</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="createLink" title="插入链接">🔗</button>
                        <button class="toolbar-btn" data-command="insertImage" title="插入图片">🖼️</button>
                        <button class="toolbar-btn" data-command="insertCode" title="插入代码块">💻</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-command="removeFormat" title="清除格式">✖️</button>
                        <button class="toolbar-btn" data-command="formatBlock" data-value="blockquote" title="引用">❝</button>
                    </div>
                </div>
                
                <div class="editor-content" 
                     contenteditable="true" 
                     data-placeholder="${this.options.placeholder}"
                     style="min-height: ${this.options.minHeight}px; max-height: ${this.options.maxHeight}px;">
                </div>
                
                <div class="editor-footer">
                    <span class="char-count">字符数: <span id="charCount">0</span></span>
                    <span class="word-count">字数: <span id="wordCount">0</span></span>
                </div>
            </div>
        `;
    }

    // 设置编辑器
    setupEditor() {
        this.editor = this.container.querySelector('.editor-content');
        this.toolbar = this.container.querySelector('.editor-toolbar');
        
        // 设置默认内容
        this.editor.innerHTML = '<p><br></p>';
    }

    // 设置工具栏
    setupToolbar() {
        // 工具栏按钮已经通过HTML创建，这里只需要设置样式
    }

    // 设置事件监听器
    setupEventListeners() {
        // 工具栏按钮点击
        this.toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;
            
            const command = btn.dataset.command;
            const value = btn.dataset.value || null;
            
            this.execCommand(command, value);
        });

        // 颜色选择器
        this.toolbar.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const command = e.target.dataset.command;
                const value = e.target.value;
                this.execCommand(command, value);
            });
        });

        // 下拉选择器
        this.toolbar.querySelectorAll('.toolbar-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const command = e.target.dataset.command;
                const value = e.target.value;
                if (value) {
                    this.execCommand(command, value);
                }
            });
        });

        // 编辑器内容变化
        this.editor.addEventListener('input', () => {
            this.updateCounts();
            this.saveHistory();
        });

        // 键盘快捷键
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.execCommand('underline');
                        break;
                }
            }
        });

        // 粘贴事件处理
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }

    // 执行命令
    execCommand(command, value = null) {
        this.editor.focus();

        switch (command) {
            case 'createLink':
                const url = prompt('请输入链接地址:', 'https://');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;

            case 'insertImage':
                const imageUrl = prompt('请输入图片地址:', 'https://');
                if (imageUrl) {
                    document.execCommand(command, false, imageUrl);
                }
                break;

            case 'insertCode':
                const code = prompt('请输入代码:', '');
                if (code) {
                    const codeBlock = `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;"><code>${this.escapeHtml(code)}</code></pre>`;
                    document.execCommand('insertHTML', false, codeBlock);
                }
                break;

            case 'undo':
                this.undo();
                break;

            case 'redo':
                this.redo();
                break;

            case 'formatBlock':
                document.execCommand(command, false, value);
                break;

            default:
                document.execCommand(command, false, value);
        }

        this.saveHistory();
    }

    // 撤销
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.editor.innerHTML = this.history[this.historyIndex];
            this.updateCounts();
        }
    }

    // 重做
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.editor.innerHTML = this.history[this.historyIndex];
            this.updateCounts();
        }
    }

    // 保存历史记录
    saveHistory() {
        const content = this.editor.innerHTML;
        
        // 避免重复保存相同内容
        if (this.history[this.historyIndex] === content) {
            return;
        }

        // 删除当前位置之后的历史记录
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 添加新记录
        this.history.push(content);
        
        // 限制历史记录数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    // 更新计数
    updateCounts() {
        const text = this.editor.innerText || '';
        const charCount = text.length;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

        const charCountEl = this.container.querySelector('#charCount');
        const wordCountEl = this.container.querySelector('#wordCount');

        if (charCountEl) charCountEl.textContent = charCount;
        if (wordCountEl) wordCountEl.textContent = wordCount;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 获取内容
    getContent() {
        return this.editor.innerHTML;
    }

    // 获取纯文本
    getText() {
        return this.editor.innerText;
    }

    // 设置内容
    setContent(html) {
        this.editor.innerHTML = html;
        this.updateCounts();
        this.saveHistory();
    }

    // 清空内容
    clear() {
        this.editor.innerHTML = '<p><br></p>';
        this.updateCounts();
        this.saveHistory();
    }

    // 聚焦
    focus() {
        this.editor.focus();
    }

    // 失焦
    blur() {
        this.editor.blur();
    }
}

// 全局实例管理
window.RichTextEditor = RichTextEditor;