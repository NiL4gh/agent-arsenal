import { tool } from "@opencode-ai/plugin";
import * as fs from "fs";

export default tool({
  description: "Apply multiple non-contiguous edits to a file. Chunks are applied one by one.",
  args: {
    targetFile: tool.schema.string().describe("Absolute path to the target file"),
    replacementChunks: tool.schema.array(
      tool.schema.object({
        startLine: tool.schema.number().describe("The starting line number of the range (1-indexed)"),
        endLine: tool.schema.number().describe("The ending line number of the range (1-indexed)"),
        targetContent: tool.schema.string().describe("The exact text to be replaced"),
        replacementContent: tool.schema.string().describe("The content to replace it with")
      })
    ).describe("List of replacement chunks to apply")
  },
  async execute(args) {
    const { targetFile, replacementChunks } = args;
    if (!fs.existsSync(targetFile)) {
      throw new Error(`File does not exist: ${targetFile}`);
    }
    
    const sortedChunks = [...replacementChunks].sort((a, b) => b.startLine - a.startLine);
    let content = fs.readFileSync(targetFile, "utf-8");
    
    for (const chunk of sortedChunks) {
      const lines = content.split(/\r?\n/);
      const { startLine, endLine, targetContent, replacementContent } = chunk;
      
      if (startLine < 1 || endLine > lines.length || startLine > endLine) {
        throw new Error(`Invalid line range [${startLine}, ${endLine}].`);
      }
      
      const rangeLines = lines.slice(startLine - 1, endLine);
      const rangeText = rangeLines.join("\n");
      
      const normalizedRange = rangeText.replace(/\r\n/g, "\n");
      const normalizedTarget = targetContent.replace(/\r\n/g, "\n");
      
      const count = normalizedRange.split(normalizedTarget).length - 1;
      if (count === 0) {
        throw new Error(`Target content not found in line range [${startLine}, ${endLine}] for a chunk.`);
      }
      if (count > 1) {
        throw new Error(`Target content matched multiple times in line range [${startLine}, ${endLine}] for a chunk.`);
      }
      
      const replacedRange = normalizedRange.replace(normalizedTarget, replacementContent.replace(/\r\n/g, "\n"));
      const beforeLines = lines.slice(0, startLine - 1);
      const afterLines = lines.slice(endLine);
      
      content = [...beforeLines, replacedRange, ...afterLines].join("\n");
    }
    
    fs.writeFileSync(targetFile, content, "utf-8");
    return `Successfully applied ${replacementChunks.length} replacements to ${targetFile}`;
  }
});
