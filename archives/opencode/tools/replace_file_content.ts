import { tool } from "@opencode-ai/plugin";
import * as fs from "fs";

export default tool({
  description: "Replace a single contiguous block of content in a file. The target content must exist exactly and uniquely in the specified line range (1-indexed, inclusive).",
  args: {
    targetFile: tool.schema.string().describe("Absolute path to the target file"),
    startLine: tool.schema.number().describe("The starting line number of the range (1-indexed)"),
    endLine: tool.schema.number().describe("The ending line number of the range (1-indexed)"),
    targetContent: tool.schema.string().describe("The exact text content to be replaced"),
    replacementContent: tool.schema.string().describe("The content to replace the target content with")
  },
  async execute(args) {
    const { targetFile, startLine, endLine, targetContent, replacementContent } = args;
    if (!fs.existsSync(targetFile)) {
      throw new Error(`File does not exist: ${targetFile}`);
    }
    const content = fs.readFileSync(targetFile, "utf-8");
    const lines = content.split(/\r?\n/);
    
    if (startLine < 1 || endLine > lines.length || startLine > endLine) {
      throw new Error(`Invalid line range [${startLine}, ${endLine}]. File has ${lines.length} lines.`);
    }
    
    const rangeLines = lines.slice(startLine - 1, endLine);
    const rangeText = rangeLines.join("\n");
    
    const normalizedRange = rangeText.replace(/\r\n/g, "\n");
    const normalizedTarget = targetContent.replace(/\r\n/g, "\n");
    
    const count = normalizedRange.split(normalizedTarget).length - 1;
    if (count === 0) {
      throw new Error(`Target content not found in line range [${startLine}, ${endLine}].`);
    }
    if (count > 1) {
      throw new Error(`Target content matched multiple times in line range [${startLine}, ${endLine}]. Make range narrower.`);
    }
    
    const replacedRange = normalizedRange.replace(normalizedTarget, replacementContent.replace(/\r\n/g, "\n"));
    
    const beforeLines = lines.slice(0, startLine - 1);
    const afterLines = lines.slice(endLine);
    
    const newContent = [...beforeLines, replacedRange, ...afterLines].join("\n");
    fs.writeFileSync(targetFile, newContent, "utf-8");
    return `Successfully replaced content in ${targetFile} (lines ${startLine}-${endLine})`;
  }
});
