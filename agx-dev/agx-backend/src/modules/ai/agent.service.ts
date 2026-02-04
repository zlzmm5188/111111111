import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 工具定义
interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

// 工具调用结果
interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

// Agent 任务
export interface AgentTask {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface AgentStep {
  thought: string;
  action?: string;
  actionInput?: any;
  observation?: string;
  timestamp: Date;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly workDir: string;
  
  // 任务存储
  private tasks: Map<string, AgentTask> = new Map();

  // 可用工具
  private readonly tools: Tool[] = [
    {
      name: 'read_file',
      description: '读取文件内容。用于查看代码、配置文件等。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '文件的相对或绝对路径' },
          startLine: { type: 'number', description: '开始行号（可选）' },
          endLine: { type: 'number', description: '结束行号（可选）' },
        },
        required: ['path'],
      },
    },
    {
      name: 'write_file',
      description: '写入或创建文件。用于生成代码、修改配置等。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '文件路径' },
          content: { type: 'string', description: '要写入的内容' },
        },
        required: ['path', 'content'],
      },
    },
    {
      name: 'edit_file',
      description: '编辑文件的指定部分。用于修改代码片段。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '文件路径' },
          oldContent: { type: 'string', description: '要替换的原内容' },
          newContent: { type: 'string', description: '新内容' },
        },
        required: ['path', 'oldContent', 'newContent'],
      },
    },
    {
      name: 'list_files',
      description: '列出目录中的文件和子目录。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '目录路径' },
          recursive: { type: 'boolean', description: '是否递归列出子目录' },
          pattern: { type: 'string', description: '文件名匹配模式（如 *.ts）' },
        },
        required: ['path'],
      },
    },
    {
      name: 'search_code',
      description: '在代码中搜索关键词或正则表达式。',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: '搜索模式（支持正则）' },
          path: { type: 'string', description: '搜索目录' },
          filePattern: { type: 'string', description: '文件类型过滤（如 *.ts）' },
        },
        required: ['pattern'],
      },
    },
    {
      name: 'run_command',
      description: '执行 shell 命令。用于运行构建、测试、安装依赖等。',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: '要执行的命令' },
          cwd: { type: 'string', description: '工作目录（可选）' },
          timeout: { type: 'number', description: '超时时间（毫秒，默认30000）' },
        },
        required: ['command'],
      },
    },
    {
      name: 'task_complete',
      description: '标记任务完成，提供最终结果。',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: '任务完成总结' },
          filesModified: { type: 'string', description: '修改的文件列表' },
        },
        required: ['summary'],
      },
    },
  ];

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.baseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
    this.model = this.configService.get<string>('DEEPSEEK_AGENT_MODEL', 'deepseek-reasoner');
    this.workDir = this.configService.get<string>('AGENT_WORK_DIR', '/root/agx-dev');
  }

  /**
   * 创建新任务
   */
  createTask(taskDescription: string): AgentTask {
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      task: taskDescription,
      status: 'pending',
      steps: [],
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * 执行任务
   */
  async executeTask(taskId: string): Promise<AgentTask> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'running';
    
    try {
      await this.runAgentLoop(task);
      task.status = 'completed';
      task.completedAt = new Date();
    } catch (error) {
      task.status = 'failed';
      task.result = `执行失败: ${error.message}`;
      this.logger.error(`Task ${taskId} failed:`, error);
    }

    return task;
  }

  /**
   * Agent 主循环
   */
  private async runAgentLoop(task: AgentTask, maxIterations = 20): Promise<void> {
    const systemPrompt = this.buildSystemPrompt();
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `任务: ${task.task}\n\n请开始执行任务。` },
    ];

    for (let i = 0; i < maxIterations; i++) {
      this.logger.log(`Task ${task.id} - Iteration ${i + 1}`);

      // 调用 LLM
      const response = await this.callLLM(messages);
      
      // 解析响应
      const { thought, action, actionInput } = this.parseResponse(response);
      
      const step: AgentStep = {
        thought,
        action,
        actionInput,
        timestamp: new Date(),
      };

      // 如果是完成任务
      if (action === 'task_complete') {
        step.observation = '任务完成';
        task.steps.push(step);
        task.result = actionInput?.summary || thought;
        return;
      }

      // 执行工具
      if (action) {
        const result = await this.executeTool(action, actionInput);
        step.observation = result.success ? result.output : `错误: ${result.error}`;
        
        // 添加到消息历史
        messages.push({ role: 'assistant', content: response });
        messages.push({ 
          role: 'user', 
          content: `工具执行结果:\n${step.observation}\n\n请继续执行任务。` 
        });
      } else {
        // 没有动作，可能是在思考
        messages.push({ role: 'assistant', content: response });
        messages.push({ role: 'user', content: '请选择一个工具来执行下一步操作。' });
      }

      task.steps.push(step);
    }

    task.result = '达到最大迭代次数，任务未完成';
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    const toolsDesc = this.tools.map(t => {
      const params = Object.entries(t.parameters.properties)
        .map(([k, v]) => `  - ${k}: ${v.description}`)
        .join('\n');
      return `### ${t.name}\n${t.description}\n参数:\n${params}`;
    }).join('\n\n');

    return `你是一个强大的开发助手 Agent，可以通过工具来完成各种开发任务。

## 工作目录
${this.workDir}

## 可用工具
${toolsDesc}

## 响应格式
你必须按照以下 JSON 格式响应：
\`\`\`json
{
  "thought": "你的思考过程",
  "action": "要使用的工具名称",
  "action_input": {
    // 工具参数
  }
}
\`\`\`

## 注意事项
1. 每次只能调用一个工具
2. 先思考，再行动
3. 仔细阅读工具执行结果
4. 任务完成后使用 task_complete 工具
5. 路径使用相对于工作目录的路径，或绝对路径
6. 修改文件前先读取确认内容
7. 危险操作（如删除文件）需谨慎

开始执行任务吧！`;
  }

  /**
   * 调用 LLM
   */
  private async callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 解析 LLM 响应
   */
  private parseResponse(response: string): { thought: string; action?: string; actionInput?: any } {
    // 尝试提取 JSON
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          thought: parsed.thought || '',
          action: parsed.action,
          actionInput: parsed.action_input,
        };
      } catch (e) {
        this.logger.warn('Failed to parse JSON response:', e);
      }
    }

    // 尝试直接解析
    try {
      const parsed = JSON.parse(response);
      return {
        thought: parsed.thought || '',
        action: parsed.action,
        actionInput: parsed.action_input,
      };
    } catch (e) {
      // 返回原始内容作为思考
      return { thought: response };
    }
  }

  /**
   * 执行工具
   */
  private async executeTool(toolName: string, input: any): Promise<ToolResult> {
    this.logger.log(`Executing tool: ${toolName}`, input);

    try {
      switch (toolName) {
        case 'read_file':
          return await this.toolReadFile(input);
        case 'write_file':
          return await this.toolWriteFile(input);
        case 'edit_file':
          return await this.toolEditFile(input);
        case 'list_files':
          return await this.toolListFiles(input);
        case 'search_code':
          return await this.toolSearchCode(input);
        case 'run_command':
          return await this.toolRunCommand(input);
        case 'task_complete':
          return { success: true, output: input?.summary || 'Task completed' };
        default:
          return { success: false, output: '', error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      return { success: false, output: '', error: error.message };
    }
  }

  /**
   * 工具: 读取文件
   */
  private async toolReadFile(input: { path: string; startLine?: number; endLine?: number }): Promise<ToolResult> {
    const filePath = this.resolvePath(input.path);
    
    if (!fs.existsSync(filePath)) {
      return { success: false, output: '', error: `File not found: ${filePath}` };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (input.startLine !== undefined || input.endLine !== undefined) {
      const start = (input.startLine || 1) - 1;
      const end = input.endLine || lines.length;
      const selectedLines = lines.slice(start, end);
      return {
        success: true,
        output: selectedLines.map((l, i) => `${start + i + 1}: ${l}`).join('\n'),
      };
    }

    // 如果文件太大，只返回前 500 行
    if (lines.length > 500) {
      return {
        success: true,
        output: `[文件共 ${lines.length} 行，显示前 500 行]\n\n` +
          lines.slice(0, 500).map((l, i) => `${i + 1}: ${l}`).join('\n'),
      };
    }

    return {
      success: true,
      output: lines.map((l, i) => `${i + 1}: ${l}`).join('\n'),
    };
  }

  /**
   * 工具: 写入文件
   */
  private async toolWriteFile(input: { path: string; content: string }): Promise<ToolResult> {
    const filePath = this.resolvePath(input.path);
    const dir = path.dirname(filePath);

    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, input.content, 'utf-8');
    return { success: true, output: `File written: ${filePath}` };
  }

  /**
   * 工具: 编辑文件
   */
  private async toolEditFile(input: { path: string; oldContent: string; newContent: string }): Promise<ToolResult> {
    const filePath = this.resolvePath(input.path);

    if (!fs.existsSync(filePath)) {
      return { success: false, output: '', error: `File not found: ${filePath}` };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes(input.oldContent)) {
      return { success: false, output: '', error: 'Old content not found in file' };
    }

    const newContent = content.replace(input.oldContent, input.newContent);
    fs.writeFileSync(filePath, newContent, 'utf-8');

    return { success: true, output: `File edited: ${filePath}` };
  }

  /**
   * 工具: 列出文件
   */
  private async toolListFiles(input: { path: string; recursive?: boolean; pattern?: string }): Promise<ToolResult> {
    const dirPath = this.resolvePath(input.path);

    if (!fs.existsSync(dirPath)) {
      return { success: false, output: '', error: `Directory not found: ${dirPath}` };
    }

    const files: string[] = [];
    const listDir = (dir: string, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        // 跳过 node_modules 和 .git
        if (entry.name === 'node_modules' || entry.name === '.git') continue;

        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          files.push(`${relativePath}/`);
          if (input.recursive) {
            listDir(path.join(dir, entry.name), relativePath);
          }
        } else {
          if (!input.pattern || this.matchPattern(entry.name, input.pattern)) {
            files.push(relativePath);
          }
        }
      }
    };

    listDir(dirPath);
    return { success: true, output: files.slice(0, 200).join('\n') };
  }

  /**
   * 工具: 搜索代码
   */
  private async toolSearchCode(input: { pattern: string; path?: string; filePattern?: string }): Promise<ToolResult> {
    const searchPath = this.resolvePath(input.path || '.');
    
    try {
      let cmd = `grep -rn "${input.pattern}" "${searchPath}"`;
      if (input.filePattern) {
        cmd += ` --include="${input.filePattern}"`;
      }
      cmd += ' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist';
      cmd += ' 2>/dev/null | head -50';

      const { stdout } = await execAsync(cmd, { timeout: 30000 });
      return { success: true, output: stdout || 'No matches found' };
    } catch (error) {
      if (error.code === 1) {
        return { success: true, output: 'No matches found' };
      }
      return { success: false, output: '', error: error.message };
    }
  }

  /**
   * 工具: 执行命令
   */
  private async toolRunCommand(input: { command: string; cwd?: string; timeout?: number }): Promise<ToolResult> {
    const cwd = input.cwd ? this.resolvePath(input.cwd) : this.workDir;
    const timeout = input.timeout || 60000;

    // 安全检查 - 禁止危险命令
    const dangerousPatterns = [
      /rm\s+-rf\s+\/(?!root\/agx)/,  // 禁止删除根目录
      /mkfs/,
      /dd\s+if=/,
      />\s*\/dev\/sd/,
      /chmod\s+777\s+\//,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input.command)) {
        return { success: false, output: '', error: 'Dangerous command blocked' };
      }
    }

    try {
      const { stdout, stderr } = await execAsync(input.command, { cwd, timeout });
      const output = stdout + (stderr ? `\n[stderr]: ${stderr}` : '');
      return { success: true, output: output.slice(0, 10000) };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || '', 
        error: error.message + (error.stderr ? `\n${error.stderr}` : '')
      };
    }
  }

  /**
   * 解析路径
   */
  private resolvePath(inputPath: string): string {
    if (path.isAbsolute(inputPath)) {
      return inputPath;
    }
    return path.join(this.workDir, inputPath);
  }

  /**
   * 简单的文件名匹配
   */
  private matchPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(filename);
  }
}
