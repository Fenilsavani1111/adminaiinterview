import * as XLSX from 'xlsx';
import { InterviewQuestion } from '../types'; 

export interface ExcelQuestionRow {
  question: string;
  type: 'behavioral' | 'technical' | 'general' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDuration: number;
  category: string;
  suggestedAnswers: string;
  evaluationCriteria: string;
  isRequired: 'yes' | 'no';
}

/**
 * Generate and download a sample Excel template
 */
export const downloadSampleExcel = () => {
  const sampleData: ExcelQuestionRow[] = [
    {
      question: "Tell me about yourself and your professional background.",
      type: "behavioral",
      difficulty: "easy",
      expectedDuration: 120,
      category: "Introduction",
      suggestedAnswers: "Summarize professional background | Highlight key achievements | Mention career goals",
      evaluationCriteria: "Clarity of communication | Relevance to role | Confidence",
      isRequired: "yes"
    },
    {
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      type: "behavioral",
      difficulty: "medium",
      expectedDuration: 180,
      category: "Problem Solving",
      suggestedAnswers: "Explain the challenge clearly | Detail the approach taken | Highlight the outcome",
      evaluationCriteria: "Problem-solving ability | Communication skills | Results orientation",
      isRequired: "no"
    },
    {
      question: "What are your greatest strengths and how do they apply to this role?",
      type: "general",
      difficulty: "easy",
      expectedDuration: 120,
      category: "Self-Assessment",
      suggestedAnswers: "Identify relevant strengths | Provide concrete examples | Connect to job requirements",
      evaluationCriteria: "Self-awareness | Relevance to position | Honesty",
      isRequired: "no"
    },
    {
      question: "How do you handle conflicts with team members?",
      type: "situational",
      difficulty: "medium",
      expectedDuration: 150,
      category: "Teamwork",
      suggestedAnswers: "Stay calm and professional | Listen to understand | Find common ground | Suggest solutions",
      evaluationCriteria: "Emotional intelligence | Communication | Conflict resolution",
      isRequired: "no"
    },
    {
      question: "Explain a technical concept to a non-technical person.",
      type: "technical",
      difficulty: "hard",
      expectedDuration: 180,
      category: "Communication",
      suggestedAnswers: "Use simple analogies | Avoid jargon | Check for understanding | Be patient",
      evaluationCriteria: "Clarity | Simplification skills | Patience | Adaptability",
      isRequired: "no"
    }
  ];

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  ws['!cols'] = [
    { wch: 60 }, // question
    { wch: 15 }, // type
    { wch: 12 }, // difficulty
    { wch: 18 }, // expectedDuration
    { wch: 20 }, // category
    { wch: 60 }, // suggestedAnswers
    { wch: 60 }, // evaluationCriteria
    { wch: 12 }  // isRequired
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Interview Questions');

  // Add instructions sheet
  const instructions = [
    { Instruction: "HOW TO USE THIS TEMPLATE:" },
    { Instruction: "" },
    { Instruction: "1. Fill in interview questions in the 'Interview Questions' sheet" },
    { Instruction: "2. QUESTION: Write your interview question (Required)" },
    { Instruction: "3. TYPE: Choose from: behavioral, technical, general, situational" },
    { Instruction: "4. DIFFICULTY: Choose from: easy, medium, hard" },
    { Instruction: "5. EXPECTED DURATION: Time in seconds (e.g., 120 for 2 minutes)" },
    { Instruction: "6. CATEGORY: Category or topic of the question" },
    { Instruction: "7. SUGGESTED ANSWERS: Separate multiple points with ' | ' (pipe symbol)" },
    { Instruction: "8. EVALUATION CRITERIA: Separate multiple criteria with ' | '" },
    { Instruction: "9. IS REQUIRED: Use 'yes' or 'no'" },
    { Instruction: "" },
    { Instruction: "IMPORTANT NOTES:" },
    { Instruction: "- Do not change the column headers" },
    { Instruction: "- Question field is mandatory" },
    { Instruction: "- Use the exact values for type, difficulty, and isRequired" },
    { Instruction: "- Expected duration should be a number in seconds" },
    { Instruction: "- Delete the sample rows and add your own questions" },
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Generate file
  XLSX.writeFile(wb, 'Interview_Questions_Template.xlsx');
};

/**
 * Parse uploaded Excel file and convert to InterviewQuestion array
 */
export const parseExcelFile = async (file: File): Promise<InterviewQuestion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData: ExcelQuestionRow[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        // Validate and transform data
        const questions: InterviewQuestion[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // +2 because Excel rows start at 1 and header is row 1

          // Validate required fields
          if (!row.question || row.question.trim() === '') {
            errors.push(`Row ${rowNum}: Question is required`);
            return;
          }

          // Validate type
          const validTypes = ['behavioral', 'technical', 'general', 'situational'];
          const type = row.type?.toLowerCase() as any;
          if (!validTypes.includes(type)) {
            errors.push(`Row ${rowNum}: Invalid type. Must be one of: ${validTypes.join(', ')}`);
            return;
          }

          // Validate difficulty
          const validDifficulties = ['easy', 'medium', 'hard'];
          const difficulty = row.difficulty?.toLowerCase() as any;
          if (!validDifficulties.includes(difficulty)) {
            errors.push(`Row ${rowNum}: Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
            return;
          }

          // Validate expectedDuration
          const duration = parseInt(row.expectedDuration?.toString() || '120');
          if (isNaN(duration) || duration <= 0) {
            errors.push(`Row ${rowNum}: Expected duration must be a positive number`);
            return;
          }

          // Validate isRequired
          const isRequiredStr = row.isRequired?.toLowerCase();
          const isRequired = isRequiredStr === 'yes' || isRequiredStr === 'true';

          // Parse suggested answers (split by pipe)
          const suggestedAnswers = row.suggestedAnswers
            ? row.suggestedAnswers.split('|').map(s => s.trim()).filter(s => s)
            : [];

          // Parse evaluation criteria (split by pipe)
          const evaluationCriteria = row.evaluationCriteria
            ? row.evaluationCriteria.split('|').map(s => s.trim()).filter(s => s)
            : [];

          // Create question object
          questions.push({
            id: `excel_${Date.now()}_${index}`,
            question: row.question.trim(),
            type,
            difficulty,
            expectedDuration: duration,
            category: row.category?.trim() || '',
            suggestedAnswers,
            evaluationCriteria,
            isRequired,
            order: index + 1
          });
        });

        if (errors.length > 0) {
          reject(new Error(`Excel validation errors:\n${errors.join('\n')}`));
          return;
        }

        if (questions.length === 0) {
          reject(new Error('No valid questions found in the Excel file'));
          return;
        }

        resolve(questions);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate Excel file structure
 */
export const validateExcelStructure = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get headers
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const headers: string[] = [];
        
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = worksheet[cellAddress];
          if (cell) {
            headers.push(cell.v.toString().toLowerCase());
          }
        }

        // Required headers
        const requiredHeaders = ['question', 'type', 'difficulty', 'expectedduration'];
        const hasRequiredHeaders = requiredHeaders.every(h => 
          headers.some(header => header.replace(/\s+/g, '').includes(h.replace(/\s+/g, '')))
        );

        resolve(hasRequiredHeaders);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};