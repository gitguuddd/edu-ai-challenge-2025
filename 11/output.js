import fs from 'fs';
import path from 'path';

export const writeMarkdownFile = async (filename, content) => {
    try {
        const mdFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        const filePath = path.resolve(process.cwd(), mdFilename);
        
        await fs.promises.writeFile(filePath, content, 'utf8');
        
        console.log(`Markdown file created: ${mdFilename}`);
        return filePath;
    } catch (error) {
        console.error('Error writing markdown file:', error);
        throw new Error(`Failed to write markdown file: ${error.message}`);
    }
};

export const writeJsonFile = async (filename, content, pretty = true) => {
    try {
        const jsonFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
        const filePath = path.resolve(process.cwd(), jsonFilename);
        
        const jsonContent = pretty ? JSON.stringify(content, null, 2) : JSON.stringify(content);
        
        await fs.promises.writeFile(filePath, jsonContent, 'utf8');
        
        console.log(`JSON file created: ${jsonFilename}`);
        return filePath;
    } catch (error) {
        console.error('Error writing JSON file:', error);
        throw new Error(`Failed to write JSON file: ${error.message}`);
    }
};

