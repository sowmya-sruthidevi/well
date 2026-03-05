const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class CodeExecutionService {
  
  async executeCode(code, language, input = "", timeout = 5000) {
    const executionId = uuidv4();
    const tempDir = path.join(__dirname, "../temp", executionId);
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      let result;
      switch (language) {
        case "javascript":
          result = await this.executeJavaScript(code, input, tempDir, timeout);
          break;
        case "python":
          result = await this.executePython(code, input, tempDir, timeout);
          break;
        case "java":
          result = await this.executeJava(code, input, tempDir, timeout);
          break;
        default:
          throw new Error("Unsupported language");
      }
      
      await this.cleanup(tempDir);
      return result;
      
    } catch (error) {
      await this.cleanup(tempDir);
      return {
        success: false,
        output: "",
        error: error.message,
        executionTime: 0
      };
    }
  }
  
  async executeJavaScript(code, input, tempDir, timeout) {
    const filePath = path.join(tempDir, "solution.js");
    const inputPath = path.join(tempDir, "input.txt");
    
    await fs.writeFile(filePath, code);
    await fs.writeFile(inputPath, input);
    
    const command = process.platform === 'win32'
      ? `cd /d "${tempDir}" && node "${filePath}" < "${inputPath}"`
      : `cd "${tempDir}" && node "${filePath}" < "${inputPath}"`;
    
    return await this.runCommand(command, timeout);
  }
  
  async executePython(code, input, tempDir, timeout) {
    const filePath = path.join(tempDir, "solution.py");
    const inputPath = path.join(tempDir, "input.txt");
    
    await fs.writeFile(filePath, code);
    await fs.writeFile(inputPath, input);
    
    const command = process.platform === 'win32'
      ? `cd /d "${tempDir}" && python "${filePath}" < "${inputPath}"`
      : `cd "${tempDir}" && python3 "${filePath}" < "${inputPath}"`;
    
    return await this.runCommand(command, timeout);
  }
  
  async executeJava(code, input, tempDir, timeout) {
    const filePath = path.join(tempDir, "Solution.java");
    const inputPath = path.join(tempDir, "input.txt");
    
    await fs.writeFile(filePath, code);
    await fs.writeFile(inputPath, input);
    
    const compileResult = await this.runCommand(`javac "${filePath}"`, timeout * 2);
    
    if (!compileResult.success) {
      return compileResult;
    }
    
    const command = process.platform === 'win32'
      ? `cd /d "${tempDir}" && java Solution < "${inputPath}"`
      : `cd "${tempDir}" && java Solution < "${inputPath}"`;
    
    return await this.runCommand(command, timeout);
  }
  
  runCommand(command, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const process = exec(command, { timeout, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            resolve({
              success: false,
              output: "",
              error: "Time Limit Exceeded",
              executionTime
            });
          } else {
            resolve({
              success: false,
              output: stdout,
              error: stderr || error.message,
              executionTime
            });
          }
        } else {
          resolve({
            success: true,
            output: stdout.trim(),
            error: "",
            executionTime
          });
        }
      });
    });
  }
  
  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

module.exports = new CodeExecutionService();
