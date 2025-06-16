import fs from 'fs/promises';

const formatArrayData = (data) => {
    if (!data || data.length === 0) {
        return "No data found during analysis";
    }
    return data.map(item => `- ${item}`).join('\n');
};

const formatStringData = (data) => {
    if (!data || data.trim() === '') {
        return "No data found during analysis";
    }
    return data;
};


export const generateReport = async (filename, analysisObject, input) => {
    const reportContent = `# Service Analysis Report

## Brief History of the Service
${formatStringData(analysisObject.briefHistory)}

## Target Audience
${formatStringData(analysisObject.targetAudience)}

## Core Features
${formatArrayData(analysisObject.coreFeatures)}

## Unique Selling Points
${formatArrayData(analysisObject.uniqueSellingPoints)}

## Business Model
${formatStringData(analysisObject.businessModel)}

## Tech Stack Insights
${formatArrayData(analysisObject.techStackInsights)}

## Perceived Strengths
${formatArrayData(analysisObject.perceivedStrengths)}

## Perceived Weaknesses
${formatArrayData(analysisObject.perceivedWeaknesses)}

---
*Generated on ${new Date().toISOString().split('T')[0]}*
*Input: ${input}*
`;

    await fs.writeFile(filename, reportContent, 'utf8');
    
    return filename;
};
