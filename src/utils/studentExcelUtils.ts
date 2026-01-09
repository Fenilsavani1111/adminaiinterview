// adminaiinterview/src/utils/studentExcelUtils.ts
import * as XLSX from 'xlsx';

export interface ExcelStudentRow {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Student {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  jobPostId?: string;
  createdAt?: Date;
}

/**
 * Generate and download a sample Excel template for students
 */
export const downloadSampleStudentExcel = () => {
  const sampleData: ExcelStudentRow[] = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phoneNumber: "9876543210"
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phoneNumber: "9876543211"
    },
    {
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phoneNumber: "9876543212"
    },
    {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phoneNumber: "9876543213"
    },
    {
      name: "Michael Brown",
      email: "michael.b@example.com",
      phoneNumber: "9876543214"
    }
  ];

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // name
    { wch: 35 }, // email
    { wch: 15 }, // phoneNumber
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students List');

  // Add instructions sheet
  const instructions = [
    { Instruction: "HOW TO USE THIS TEMPLATE:" },
    { Instruction: "" },
    { Instruction: "1. Fill in student details in the 'Students List' sheet" },
    { Instruction: "2. NAME: Full name of the student (Required)" },
    { Instruction: "3. EMAIL: Valid email address (Required)" },
    { Instruction: "4. PHONE NUMBER: 10-digit mobile number (Required)" },
    { Instruction: "" },
    { Instruction: "IMPORTANT NOTES:" },
    { Instruction: "- Do not change the column headers" },
    { Instruction: "- All fields are mandatory" },
    { Instruction: "- Email must be in valid format (e.g., user@example.com)" },
    { Instruction: "- Phone number should be 10 digits (e.g., 9876543210)" },
    { Instruction: "- Phone number should not contain spaces or special characters" },
    { Instruction: "- Each email should be unique" },
    { Instruction: "- Delete the sample rows and add your own students" },
    { Instruction: "" },
    { Instruction: "EXAMPLE:" },
    { Instruction: "Name: John Doe" },
    { Instruction: "Email: john.doe@example.com" },
    { Instruction: "Phone Number: 9876543210" },
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Generate file
  XLSX.writeFile(wb, 'Student_List_Template.xlsx');
};

/**
 * Parse uploaded Excel file and convert to Student array
 */
export const parseStudentExcelFile = async (file: File): Promise<Student[]> => {
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
        const jsonData: ExcelStudentRow[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        // Validate and transform data
        const students: Student[] = [];
        const errors: string[] = [];
        const emailSet = new Set<string>();

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone validation regex (10 digits)
        const phoneRegex = /^[6-9]\d{9}$/;

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // +2 because Excel rows start at 1 and header is row 1

          // Validate name
          if (!row.name || row.name.trim() === '') {
            errors.push(`Row ${rowNum}: Name is required`);
            return;
          }

          // Validate email
          if (!row.email || row.email.trim() === '') {
            errors.push(`Row ${rowNum}: Email is required`);
            return;
          }

          const email = row.email.trim().toLowerCase();
          if (!emailRegex.test(email)) {
            errors.push(`Row ${rowNum}: Invalid email format`);
            return;
          }

          // Check for duplicate emails in the file
          if (emailSet.has(email)) {
            errors.push(`Row ${rowNum}: Duplicate email found - ${email}`);
            return;
          }
          emailSet.add(email);

          // Validate phone number
          if (!row.phoneNumber || row.phoneNumber.trim() === '') {
            errors.push(`Row ${rowNum}: Phone number is required`);
            return;
          }

          const phone = row.phoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
          if (!phoneRegex.test(phone)) {
            errors.push(`Row ${rowNum}: Invalid phone number. Must be 10 digits starting with 6-9`);
            return;
          }

          // Create student object
          students.push({
            id: `student_${Date.now()}_${index}`,
            name: row.name.trim(),
            email: email,
            phoneNumber: phone
          });
        });

        if (errors.length > 0) {
          reject(new Error(`Excel validation errors:\n${errors.join('\n')}`));
          return;
        }

        if (students.length === 0) {
          reject(new Error('No valid students found in the Excel file'));
          return;
        }

        resolve(students);
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
 * Validate Excel file structure for students
 */
export const validateStudentExcelStructure = (file: File): Promise<boolean> => {
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

        // Required headers (flexible matching)
        const requiredHeaders = ['name', 'email', 'phonenumber'];
        const hasRequiredHeaders = requiredHeaders.every(h => 
          headers.some(header => 
            header.replace(/\s+/g, '').replace(/_/g, '').includes(h.replace(/\s+/g, ''))
          )
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