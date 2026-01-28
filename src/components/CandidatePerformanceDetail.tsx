import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Play,
  Download,
  Eye,
  Star,
  MessageSquare,
  Video,
  Mic,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  X,
  Bell,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-react';
import { Candidate } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface CandidatePerformanceDetailProps {
  candidateId: string;
  backText: string;
  onBack: () => void;
}

const camelToLabel = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // insert space before capital letters
    .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
};

// Export candidate performance report to Excel
export const exportCandidateReport = async (
  candidateData: Candidate,
  comparisonData: any,
  setIsExporting: (value: boolean) => void
) => {
  if (!candidateData) {
    alert('No candidate data available to export');
    return;
  }

  setIsExporting(true);

  // Helper functions for formatting
  const formatEducationType = (type: string) => {
    const educationMap: { [key: string]: string } = {
      tenth: '10th Grade',
      degree: "Bachelor's Degree",
      pg: 'Post Graduate',
      master: "Master's Degree",
      phd: 'Ph.D.',
    };
    return educationMap[type.toLowerCase()] || type.toUpperCase();
  };

  const formatArrayField = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return 'N/A';
    return arr.join(', ');
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? '✅' : '❌';
  };

  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add candidate overview worksheet
    const overviewSheet = workbook.addWorksheet('Candidate Overview');

    // Set column widths
    overviewSheet.columns = [
      { key: 'field', width: 25 },
      { key: 'value', width: 40 },
    ];

    // Add title
    const titleRow = overviewSheet.addRow(['CANDIDATE PERFORMANCE REPORT', '']);
    titleRow.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    titleRow.getCell(1).alignment = { horizontal: 'center' };
    titleRow.height = 25;
    overviewSheet.mergeCells('A1:B1');

    // Add empty row
    overviewSheet.addRow([]);

    // Add candidate basic information
    const infoSection = overviewSheet.addRow(['CANDIDATE INFORMATION', '']);
    infoSection.font = { bold: true, color: { argb: 'FF374151' } };
    infoSection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    infoSection.height = 20;
    overviewSheet.mergeCells(`A${infoSection.number}:B${infoSection.number}`);

    const candidateInfo = [
      ['Name', candidateData.name || 'N/A'],
      ['Email', candidateData.email || 'N/A'],
      ['Phone', candidateData.mobile || candidateData.phone || 'N/A'],
      ['Location', candidateData.location || 'N/A'],
      ['Designation', candidateData.designation || 'N/A'],
      [
        'Interview Date',
        candidateData.interviewDate ? format(new Date(candidateData.interviewDate), 'PPP') : 'N/A',
      ],
      ['Status', candidateData.status?.replace(/_/g, ' ') || 'N/A'],
    ];

    candidateInfo.forEach(([field, value]) => {
      const row = overviewSheet.addRow([field, value]);
      row.getCell(1).font = { bold: true };
      row.height = 18;
    });

    // Add additional details section
    overviewSheet.addRow([]);
    const additionalDetailsSection = overviewSheet.addRow(['ADDITIONAL DETAILS', '']);
    additionalDetailsSection.font = { bold: true, color: { argb: 'FF374151' } };
    additionalDetailsSection.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    additionalDetailsSection.height = 20;
    overviewSheet.mergeCells(
      `A${additionalDetailsSection.number}:B${additionalDetailsSection.number}`
    );

    const additionalInfo = [
      ['Region', candidateData.region || 'N/A'],
      ['Residence Location', candidateData.residenceLocation || 'N/A'],
      ['Proctoring Status', candidateData.proctoringStatus || 'N/A'],
      ['Highest Qualification', candidateData.highestQualification || 'N/A'],
      ['Resume URL', candidateData.resumeUrl || 'N/A'],
      ['LinkedIn URL', candidateData.linkedinUrl || 'N/A'],
      ['Experience Level', candidateData.experienceLevel || 'N/A'],
      ['Skills', formatArrayField(candidateData.skills)],
    ];

    additionalInfo.forEach(([field, value]) => {
      const row = overviewSheet.addRow([field, value]);
      row.getCell(1).font = { bold: true };
      row.height = 18;
    });

    // Add education details section
    if (candidateData.educations && candidateData.educations.length > 0) {
      overviewSheet.addRow([]);
      const educationSection = overviewSheet.addRow(['EDUCATION DETAILS', '']);
      educationSection.font = { bold: true, color: { argb: 'FF374151' } };
      educationSection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      educationSection.height = 20;
      overviewSheet.mergeCells(`A${educationSection.number}:B${educationSection.number}`);

      candidateData.educations.forEach((education, index) => {
        const educationTitle = overviewSheet.addRow([`Education ${index + 1}`, '']);
        educationTitle.getCell(1).font = { bold: true, color: { argb: 'FF6B7280' } };
        educationTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        educationTitle.height = 18;
        overviewSheet.mergeCells(`A${educationTitle.number}:B${educationTitle.number}`);

        const educationDetails = [
          ['Type', formatEducationType(education.type || '')],
          ['Stream', education.stream || 'N/A'],
          ['Percentage', education.percentage ? `${education.percentage}%` : 'N/A'],
          ['Year of Passing', education.yearOfPassing || 'N/A'],
        ];

        educationDetails.forEach(([field, value]) => {
          const row = overviewSheet.addRow([`  ${field}`, value]);
          row.getCell(1).font = { bold: true };
          row.height = 16;
        });
      });
    }

    // Add government proof section
    if (candidateData.governmentProof && candidateData.governmentProof.length > 0) {
      overviewSheet.addRow([]);
      const govProofSection = overviewSheet.addRow(['GOVERNMENT PROOF DOCUMENTS', '']);
      govProofSection.font = { bold: true, color: { argb: 'FF374151' } };
      govProofSection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      govProofSection.height = 20;
      overviewSheet.mergeCells(`A${govProofSection.number}:B${govProofSection.number}`);

      candidateData.governmentProof.forEach((proof, index) => {
        const proofDetails = [
          [`Document ${index + 1}`, proof.value || 'N/A'],
          [
            `Verified Status`,
            `${getVerificationIcon(proof.verified)} ${proof.verified ? 'Verified' : 'Not Verified'}`,
          ],
        ];

        proofDetails.forEach(([field, value]) => {
          const row = overviewSheet.addRow([field, value]);
          row.getCell(1).font = { bold: true };
          row.height = 18;

          // Add color coding for verification status
          if (field.includes('Verified Status')) {
            if (proof.verified) {
              row.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD1FAE5' },
              };
            } else {
              row.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFECACA' },
              };
            }
          }
        });
      });
    }

    // Add proctoring alerts if available
    if (candidateData.proctoringAlerts && candidateData.proctoringAlerts.length > 0) {
      overviewSheet.addRow([]);
      const proctoringSection = overviewSheet.addRow(['PROCTORING ALERTS', '']);
      proctoringSection.font = { bold: true, color: { argb: 'FF374151' } };
      proctoringSection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      proctoringSection.height = 20;
      overviewSheet.mergeCells(`A${proctoringSection.number}:B${proctoringSection.number}`);

      candidateData.proctoringAlerts.forEach((alert, index) => {
        const row = overviewSheet.addRow([`Alert ${index + 1}`, (alert as any).message || 'N/A']);
        row.getCell(1).font = { bold: true };
        row.height = 18;

        // Add color coding based on alert severity (info / warning / critical)
        const severity = (alert as any).severity || '';
        if (severity === 'warning') {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' },
          };
        } else if (severity === 'critical') {
          row.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFECACA' },
          };
        }
      });
    }

    // Add category percentage section
    if (candidateData.categoryPercentage) {
      overviewSheet.addRow([]);
      const categorySection = overviewSheet.addRow(['CATEGORY PERFORMANCE', '']);
      categorySection.font = { bold: true, color: { argb: 'FF374151' } };
      categorySection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      categorySection.height = 20;
      overviewSheet.mergeCells(`A${categorySection.number}:B${categorySection.number}`);

      // Add overall category metrics
      const categoryOverallInfo = [
        ['Total Score', `${candidateData.categoryPercentage.totalScore || 0}`],
        ['Overall Score', `${candidateData.categoryPercentage.overallScore || 0}`],
        ['Overall Percentage', `${candidateData.categoryPercentage.overallPercentage || 0}%`],
      ];

      categoryOverallInfo.forEach(([field, value]) => {
        const row = overviewSheet.addRow([field, value]);
        row.getCell(1).font = { bold: true };
        row.height = 18;
      });

      // Add category-wise breakdown
      if (candidateData.categoryPercentage.categoryWisePercentage) {
        overviewSheet.addRow([]);
        const categoryWiseSection = overviewSheet.addRow(['CATEGORY-WISE BREAKDOWN', '']);
        categoryWiseSection.font = { bold: true, color: { argb: 'FF6B7280' } };
        categoryWiseSection.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
        categoryWiseSection.height = 20;
        overviewSheet.mergeCells(`A${categoryWiseSection.number}:B${categoryWiseSection.number}`);

        Object.entries(candidateData.categoryPercentage.categoryWisePercentage).forEach(
          ([category, percentage]: [string, any]) => {
            const categoryRow = overviewSheet.addRow([
              camelToLabel(category),
              `${percentage || 0}%`,
            ]);
            categoryRow.getCell(1).font = { bold: true };
            categoryRow.height = 18;

            // Add color coding based on performance
            const score = percentage || 0;
            if (score >= 80) {
              categoryRow.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD1FAE5' },
              };
            } else if (score >= 60) {
              categoryRow.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFEF3C7' },
              };
            } else if (score >= 40) {
              categoryRow.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFED7AA' },
              };
            } else {
              categoryRow.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFECACA' },
              };
            }
          }
        );
      }
    }

    // Add performance breakdown section
    overviewSheet.addRow([]);
    const performanceSection = overviewSheet.addRow(['PERFORMANCE BREAKDOWN', '']);
    performanceSection.font = { bold: true, color: { argb: 'FF374151' } };
    performanceSection.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    performanceSection.height = 20;
    overviewSheet.mergeCells(`A${performanceSection.number}:B${performanceSection.number}`);

    // Add performance data
    if (candidateData.performanceBreakdown) {
      Object.entries(candidateData.performanceBreakdown).forEach(([skill, data]: [string, any]) => {
        if (!['culturalFit', 'behavior', 'body_language'].includes(skill)) {
          const skillRow = overviewSheet.addRow([
            camelToLabel(skill),
            `${data?.overallAveragePercentage || 0}%`,
          ]);
          skillRow.getCell(1).font = { bold: true };
          skillRow.height = 18;

          // Add color coding based on performance
          const score = data?.overallAveragePercentage || 0;
          const avgScore = comparisonData?.averageScores?.[skill] || 0;
          if (score > avgScore) {
            skillRow.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
          } else if (score < avgScore) {
            skillRow.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF2F2' },
            };
          }
        }
      });
    }

    // Add Category Analysis sheet (if categoryPercentage data exists)
    let categorySheet: any;
    if (
      candidateData.categoryPercentage &&
      candidateData.categoryPercentage.categoryWisePercentage
    ) {
      categorySheet = workbook.addWorksheet('Category Analysis');

      // Set column widths for category sheet
      categorySheet.columns = [
        { key: 'category', width: 25 },
        { key: 'score', width: 15 },
        { key: 'level', width: 20 },
        { key: 'status', width: 15 },
      ];

      // Add title for category sheet
      const categoryTitle = categorySheet.addRow([
        'CATEGORY-WISE PERFORMANCE ANALYSIS',
        '',
        '',
        '',
      ]);
      categoryTitle.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
      categoryTitle.getCell(1).alignment = { horizontal: 'center' };
      categoryTitle.height = 25;
      categorySheet.mergeCells('A1:D1');

      categorySheet.addRow([]);

      // Add summary info
      const summaryRow = categorySheet.addRow([
        `Overall Performance: ${candidateData.categoryPercentage.overallPercentage}% (${candidateData.categoryPercentage.overallScore}/${candidateData.categoryPercentage.totalScore})`,
        '',
        '',
        '',
      ]);
      summaryRow.getCell(1).alignment = { horizontal: 'center' };
      summaryRow.font = { bold: true, color: { argb: 'FF374151' } };
      summaryRow.height = 20;
      categorySheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`);

      categorySheet.addRow([]);

      // Add headers
      const categoryHeaders = categorySheet.addRow([
        'Category',
        'Score (%)',
        'Performance Level',
        'Status',
      ]);
      categoryHeaders.font = { bold: true };
      categoryHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      categoryHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      categoryHeaders.height = 22;

      // Add category data
      Object.entries(candidateData.categoryPercentage.categoryWisePercentage).forEach(
        ([category, score]: [string, any]) => {
          const scoreValue = score || 0;
          let level = 'Needs Improvement';
          let status = '🔴 Below Standard';

          if (scoreValue >= 90) {
            level = 'Excellent';
            status = '🟢 Outstanding';
          } else if (scoreValue >= 80) {
            level = 'Very Good';
            status = '🟢 Above Standard';
          } else if (scoreValue >= 70) {
            level = 'Good';
            status = '🟡 Meets Standard';
          } else if (scoreValue >= 60) {
            level = 'Satisfactory';
            status = '🟡 Adequate';
          } else if (scoreValue >= 40) {
            level = 'Fair';
            status = '🟠 Improvement Needed';
          }

          const row = categorySheet.addRow([
            camelToLabel(category),
            `${scoreValue}%`,
            level,
            status,
          ]);
          row.height = 18;

          // Color coding based on score
          if (scoreValue >= 80) {
            row.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
            row.getCell(3).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
          } else if (scoreValue >= 60) {
            row.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
            row.getCell(3).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
          } else if (scoreValue >= 40) {
            row.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
            row.getCell(3).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
          } else {
            row.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
            row.getCell(3).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
          }
        }
      );

      // Add category insights
      categorySheet.addRow([]);
      const insightsTitle = categorySheet.addRow(['PERFORMANCE INSIGHTS', '', '', '']);
      insightsTitle.font = { bold: true, color: { argb: 'FF374151' } };
      insightsTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      insightsTitle.height = 20;
      categorySheet.mergeCells(`A${insightsTitle.number}:D${insightsTitle.number}`);

      // Calculate insights
      const categoryScores = Object.values(
        candidateData.categoryPercentage.categoryWisePercentage
      ) as number[];
      const avgCategoryScore = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
      const strongestCategory = Object.entries(
        candidateData.categoryPercentage.categoryWisePercentage
      ).reduce((a, b) => ((a[1] as number) > (b[1] as number) ? a : b))[0];
      const weakestCategory = Object.entries(
        candidateData.categoryPercentage.categoryWisePercentage
      ).reduce((a, b) => ((a[1] as number) < (b[1] as number) ? a : b))[0];

      const insights = [
        ['Average Category Score', `${avgCategoryScore.toFixed(1)}%`, '', ''],
        [
          'Strongest Area',
          camelToLabel(strongestCategory),
          `${candidateData.categoryPercentage.categoryWisePercentage[strongestCategory]}%`,
          '🎯 Strength',
        ],
        [
          'Development Area',
          camelToLabel(weakestCategory),
          `${candidateData.categoryPercentage.categoryWisePercentage[weakestCategory]}%`,
          '📈 Focus Area',
        ],
      ];

      insights.forEach(([metric, value, score, note]) => {
        const row = categorySheet.addRow([metric, value, score, note]);
        row.getCell(1).font = { bold: true };
        row.height = 18;
      });
    }

    // Add Education Analysis sheet (if education data exists)
    let educationSheet: any;
    if (candidateData.educations && candidateData.educations.length > 0) {
      educationSheet = workbook.addWorksheet('Education Analysis');

      // Set column widths for education sheet
      educationSheet.columns = [
        { key: 'education', width: 20 },
        { key: 'type', width: 15 },
        { key: 'stream', width: 25 },
        { key: 'percentage', width: 15 },
        { key: 'year', width: 15 },
        { key: 'level', width: 20 },
      ];

      // Add title for education sheet
      const educationTitle = educationSheet.addRow(['EDUCATION ANALYSIS', '', '', '', '', '']);
      educationTitle.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
      educationTitle.getCell(1).alignment = { horizontal: 'center' };
      educationTitle.height = 25;
      educationSheet.mergeCells('A1:F1');

      educationSheet.addRow([]);

      // Add summary info
      const totalEducations = candidateData.educations.length;
      const avgPercentage =
        candidateData.educations
          .filter((edu) => edu.percentage && !isNaN(parseFloat(edu.percentage)))
          .reduce((sum, edu) => sum + parseFloat(edu.percentage || '0'), 0) /
        candidateData.educations.filter(
          (edu) => edu.percentage && !isNaN(parseFloat(edu.percentage))
        ).length;

      const summaryRow = educationSheet.addRow([
        `Total Qualifications: ${totalEducations} | Average Performance: ${isNaN(avgPercentage) ? 'N/A' : avgPercentage.toFixed(1) + '%'}`,
        '',
        '',
        '',
        '',
        '',
      ]);
      summaryRow.getCell(1).alignment = { horizontal: 'center' };
      summaryRow.font = { bold: true, color: { argb: 'FF374151' } };
      summaryRow.height = 20;
      educationSheet.mergeCells(`A${summaryRow.number}:F${summaryRow.number}`);

      educationSheet.addRow([]);

      // Add headers
      const educationHeaders = educationSheet.addRow([
        'Qualification',
        'Level',
        'Stream/Subject',
        'Score (%)',
        'Year',
        'Performance',
      ]);
      educationHeaders.font = { bold: true };
      educationHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
      educationHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      educationHeaders.height = 22;

      // Add education data
      candidateData.educations.forEach((education, index) => {
        const percentage = parseFloat(education.percentage || '0');
        let performanceLevel = 'N/A';

        if (!isNaN(percentage)) {
          if (percentage >= 90) performanceLevel = 'Outstanding';
          else if (percentage >= 80) performanceLevel = 'Excellent';
          else if (percentage >= 70) performanceLevel = 'Very Good';
          else if (percentage >= 60) performanceLevel = 'Good';
          else if (percentage >= 50) performanceLevel = 'Average';
          else performanceLevel = 'Below Average';
        }

        const row = educationSheet.addRow([
          `${formatEducationType(education.type || '')} ${index + 1}`,
          formatEducationType(education.type || ''),
          education.stream || 'N/A',
          education.percentage ? `${education.percentage}%` : 'N/A',
          education.yearOfPassing || 'N/A',
          performanceLevel,
        ]);
        row.height = 18;

        // Color coding based on performance
        if (!isNaN(percentage)) {
          if (percentage >= 80) {
            row.getCell(4).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
          } else if (percentage >= 70) {
            row.getCell(4).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
          } else if (percentage >= 60) {
            row.getCell(4).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
          } else if (percentage < 60) {
            row.getCell(4).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
            row.getCell(6).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
          }
        }
      });

      // Add education insights
      educationSheet.addRow([]);
      const eduInsightsTitle = educationSheet.addRow(['EDUCATION INSIGHTS', '', '', '', '', '']);
      eduInsightsTitle.font = { bold: true, color: { argb: 'FF374151' } };
      eduInsightsTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      eduInsightsTitle.height = 20;
      educationSheet.mergeCells(`A${eduInsightsTitle.number}:F${eduInsightsTitle.number}`);

      // Calculate education insights
      const validPercentages = candidateData.educations
        .filter((edu) => edu.percentage && !isNaN(parseFloat(edu.percentage)))
        .map((edu) => parseFloat(edu.percentage!));

      const highestEducation = candidateData.educations.reduce((highest, current) => {
        const levels = { tenth: 1, degree: 2, pg: 3, master: 4, phd: 5 };
        const currentLevel = levels[current.type as keyof typeof levels] || 0;
        const highestLevel = levels[highest.type as keyof typeof levels] || 0;
        return currentLevel > highestLevel ? current : highest;
      });

      const bestPerformance =
        validPercentages.length > 0
          ? candidateData.educations.find(
            (edu) => parseFloat(edu.percentage || '0') === Math.max(...validPercentages)
          )
          : null;

      const insights = [
        ['Total Qualifications', totalEducations.toString(), '', '', '', ''],
        [
          'Highest Education Level',
          formatEducationType(highestEducation.type || ''),
          highestEducation.stream || '',
          '',
          '',
          '',
        ],
        [
          'Best Academic Performance',
          bestPerformance
            ? `${formatEducationType(bestPerformance.type || '')} - ${bestPerformance.percentage}%`
            : 'N/A',
          bestPerformance?.stream || '',
          '',
          '',
          '🏆 Top Score',
        ],
        [
          'Average Performance',
          isNaN(avgPercentage) ? 'N/A' : `${avgPercentage.toFixed(1)}%`,
          '',
          '',
          '',
          '',
        ],
        [
          'Academic Consistency',
          validPercentages.length > 1
            ? Math.max(...validPercentages) - Math.min(...validPercentages) < 10
              ? 'High'
              : 'Moderate'
            : 'N/A',
          '',
          '',
          '',
          validPercentages.length > 1
            ? Math.max(...validPercentages) - Math.min(...validPercentages) < 10
              ? '📈 Consistent'
              : '📊 Variable'
            : '',
        ],
      ];

      insights.forEach(([metric, value, additional, empty1, empty2, note]) => {
        const row = educationSheet.addRow([metric, value, additional, empty1, empty2, note]);
        row.getCell(1).font = { bold: true };
        row.height = 18;
      });
    }

    // Add Government Proof Analysis sheet (if government proof data exists)
    let govProofSheet: any;
    if (candidateData.governmentProof && candidateData.governmentProof.length > 0) {
      govProofSheet = workbook.addWorksheet('Document Verification');

      // Set column widths for government proof sheet
      govProofSheet.columns = [
        { key: 'document', width: 25 },
        { key: 'value', width: 30 },
        { key: 'verified', width: 15 },
        { key: 'status', width: 20 },
      ];

      // Add title for government proof sheet
      const govProofTitle = govProofSheet.addRow(['DOCUMENT VERIFICATION STATUS', '', '', '']);
      govProofTitle.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
      govProofTitle.getCell(1).alignment = { horizontal: 'center' };
      govProofTitle.height = 25;
      govProofSheet.mergeCells('A1:D1');

      govProofSheet.addRow([]);

      // Add verification summary
      const totalDocs = candidateData.governmentProof.length;
      const verifiedDocs = candidateData.governmentProof.filter((proof) => proof.verified).length;
      const verificationRate = ((verifiedDocs / totalDocs) * 100).toFixed(1);

      const govSummaryRow = govProofSheet.addRow([
        `Total Documents: ${totalDocs} | Verified: ${verifiedDocs} | Verification Rate: ${verificationRate}%`,
        '',
        '',
        '',
      ]);
      govSummaryRow.getCell(1).alignment = { horizontal: 'center' };
      govSummaryRow.font = { bold: true, color: { argb: 'FF374151' } };
      govSummaryRow.height = 20;
      govProofSheet.mergeCells(`A${govSummaryRow.number}:D${govSummaryRow.number}`);

      govProofSheet.addRow([]);

      // Add headers
      const govHeaders = govProofSheet.addRow([
        'Document Type',
        'Document Value',
        'Verified',
        'Status',
      ]);
      govHeaders.font = { bold: true };
      govHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      govHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      govHeaders.height = 22;

      // Add government proof data
      candidateData.governmentProof.forEach((proof, index) => {
        const status = proof.verified ? '✅ Verified' : '⏳ Pending Verification';
        const verificationText = proof.verified ? 'Yes' : 'No';

        const row = govProofSheet.addRow([
          `Document ${index + 1}`,
          proof.value || 'N/A',
          verificationText,
          status,
        ]);
        row.height = 18;

        // Color coding based on verification status
        if (proof.verified) {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
          row.getCell(4).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
        } else {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' },
          };
          row.getCell(4).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' },
          };
        }
      });

      // // Add verification insights
      // govProofSheet.addRow([]);
      // const verificationInsightsTitle = govProofSheet.addRow(['VERIFICATION INSIGHTS', '', '', '']);
      // verificationInsightsTitle.font = { bold: true, color: { argb: 'FF374151' } };
      // verificationInsightsTitle.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: 'FFF3F4F6' },
      // };
      // verificationInsightsTitle.height = 20;
      // govProofSheet.mergeCells(
      //   `A${verificationInsightsTitle.number}:D${verificationInsightsTitle.number}`
      // );

      // const verificationInsights = [
      //   [
      //     'Verification Completion',
      //     `${verificationRate}%`,
      //     '',
      //     verifiedDocs === totalDocs ? '🎯 Complete' : '⚠️ Incomplete',
      //   ],
      //   ['Documents Submitted', totalDocs.toString(), '', '📋 Total Count'],
      //   [
      //     'Pending Verification',
      //     (totalDocs - verifiedDocs).toString(),
      //     '',
      //     totalDocs - verifiedDocs === 0 ? '✅ None' : '⏳ Action Required',
      //   ],
      // ];

      // verificationInsights.forEach(([metric, value, empty, note]) => {
      //   const row = govProofSheet.addRow([metric, value, empty, note]);
      //   row.getCell(1).font = { bold: true };
      //   row.height = 18;
      // });
    }

    // Add Behavioral Analysis sheet
    const behavioralSheet = workbook.addWorksheet('Behavioral Analysis');

    // Set column widths for behavioral sheet
    behavioralSheet.columns = [
      { key: 'aspect', width: 25 },
      { key: 'score', width: 15 },
      { key: 'level', width: 20 },
    ];

    // Add title for behavioral sheet
    const behavioralTitle = behavioralSheet.addRow(['BEHAVIORAL ANALYSIS', '', '']);
    behavioralTitle.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    behavioralTitle.getCell(1).alignment = { horizontal: 'center' };
    behavioralTitle.height = 25;
    behavioralSheet.mergeCells('A1:C1');

    behavioralSheet.addRow([]);

    // Add headers
    const headers = behavioralSheet.addRow(['Behavioral Aspect', 'Score (%)', 'Performance Level']);
    headers.font = { bold: true };
    headers.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    headers.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headers.height = 22;

    // Add behavioral data
    if (candidateData.behavioral_analysis) {
      const behavioralData = [
        ['Eye Contact', candidateData.behavioral_analysis.eye_contact],
        ['Posture', candidateData.behavioral_analysis.posture],
        ['Gestures', candidateData.behavioral_analysis.gestures],
        ['Facial Expressions', candidateData.behavioral_analysis.facial_expressions],
        ['Voice Tone', candidateData.behavioral_analysis.voice_tone],
        ['Confidence', candidateData.behavioral_analysis.confidence],
        ['Engagement', candidateData.behavioral_analysis.engagement],
      ];

      behavioralData.forEach(([aspect, score]) => {
        const scoreValue = score || 0;
        let level = 'Poor';
        if (scoreValue >= 80) level = 'Excellent';
        else if (scoreValue >= 60) level = 'Good';
        else if (scoreValue >= 40) level = 'Average';

        const row = behavioralSheet.addRow([aspect, `${scoreValue}%`, level]);
        row.height = 18;

        // Color coding based on score
        if (scoreValue >= 80) {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
        } else if (scoreValue >= 60) {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' },
          };
        } else if (scoreValue >= 40) {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFED7AA' },
          };
        } else {
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFECACA' },
          };
        }
      });
    }

    // Add Performance Comparison sheet if comparison data exists
    if (comparisonData && comparisonData.totalCandidates > 0) {
      const comparisonSheet = workbook.addWorksheet('Performance Comparison');

      comparisonSheet.columns = [
        { key: 'skill', width: 25 },
        { key: 'candidateScore', width: 18 },
        { key: 'averageScore', width: 18 },
        { key: 'difference', width: 15 },
        { key: 'ranking', width: 20 },
      ];

      // Add title
      const comparisonTitle = comparisonSheet.addRow(['PERFORMANCE COMPARISON', '', '', '', '']);
      comparisonTitle.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
      comparisonTitle.getCell(1).alignment = { horizontal: 'center' };
      comparisonTitle.height = 25;
      comparisonSheet.mergeCells('A1:E1');

      comparisonSheet.addRow([]);

      // Add info row
      const infoRow = comparisonSheet.addRow([
        `Compared with ${comparisonData.totalCandidates} other candidates`,
        '',
        '',
        '',
        '',
      ]);
      infoRow.getCell(1).alignment = { horizontal: 'center' };
      infoRow.height = 20;
      comparisonSheet.mergeCells(`A${infoRow.number}:E${infoRow.number}`);

      comparisonSheet.addRow([]);

      // Add headers
      const compHeaders = comparisonSheet.addRow([
        'Skill',
        'Your Score',
        'Average Score',
        'Difference',
        'Performance',
      ]);
      compHeaders.font = { bold: true };
      compHeaders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
      compHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      compHeaders.height = 22;

      // Add comparison data
      if (candidateData.performanceBreakdown) {
        Object.entries(candidateData.performanceBreakdown).forEach(
          ([skill, data]: [string, any]) => {
            if (!['culturalFit', 'behavior', 'body_language'].includes(skill)) {
              const candidateScore = data?.overallAveragePercentage || 0;
              const averageScore = comparisonData.averageScores?.[skill] || 0;
              const difference = candidateScore - averageScore;

              let performance = 'At Average';
              if (difference > 0) performance = 'Above Average';
              else if (difference < 0) performance = 'Below Average';

              const row = comparisonSheet.addRow([
                camelToLabel(skill),
                `${candidateScore}%`,
                `${averageScore}%`,
                `${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`,
                performance,
              ]);
              row.height = 18;

              // Color coding
              if (difference > 0) {
                row.getCell(5).fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFD1FAE5' },
                };
              } else if (difference < 0) {
                row.getCell(5).fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFECACA' },
                };
              }
            }
          }
        );
      }
    }

    // Style all sheets
    const sheetsToStyle = [overviewSheet, behavioralSheet];
    if (categorySheet) {
      sheetsToStyle.push(categorySheet);
    }
    if (educationSheet) {
      sheetsToStyle.push(educationSheet);
    }
    if (govProofSheet) {
      sheetsToStyle.push(govProofSheet);
    }

    // Add comparison sheet to styling if it exists
    if (comparisonData && comparisonData.totalCandidates > 0) {
      const comparisonSheet = workbook.getWorksheet('Performance Comparison');
      if (comparisonSheet) {
        sheetsToStyle.push(comparisonSheet);
      }
    }

    sheetsToStyle.forEach((sheet) => {
      sheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });
    });

    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `${candidateData.name?.replace(/\s+/g, '_') || 'Candidate'}_Performance_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Failed to export report. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

export function CandidatePerformanceDetail({
  candidateId,
  backText = 'Back',
  onBack,
}: CandidatePerformanceDetailProps) {
  const { getCandidateById, getPerformanceComparison } = useJobPosts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [candidateData, setCandidateData] = useState<Candidate>();
  const [photoError, setPhotoError] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  let ignore = false;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };


  const getQuestionScoreColor = (score: number, type: string) => {
    if (type === 'communication' || type === 'behavioral') {
      if (score >= 8) return 'text-green-600 bg-green-100';
      if (score >= 6) return 'text-blue-600 bg-blue-100';
      if (score >= 4) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (score >= 1) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    return 'C';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return <TrendingUp className='h-4 w-4 text-green-600' />;
      case 'good':
        return <TrendingUp className='h-4 w-4 text-blue-600' />;
      case 'average':
        return <TrendingUp className='h-4 w-4 text-yellow-600' />;
      default:
        return <TrendingUp className='h-4 w-4 text-gray-600' />;
    }
  };

  const getjobpostdata = async () => {
    try {
      setLoading(true);

      // Fetch candidate data first
      const candidateResponse = await getCandidateById(candidateId);

      // Extract job post ID for more targeted comparison
      const jobPostId =
        candidateResponse?.candidate?.JobPost?.id || candidateResponse?.candidate?.jobPostId;

      // Fetch performance comparison with job post ID if available
      const comparisonResponse = await getPerformanceComparison(jobPostId).catch((err) => {
        console.log('Performance comparison fetch failed:', err);
        return null; // Continue even if comparison fails
      });

      if (candidateResponse?.candidate) {
        setCandidateData(candidateResponse.candidate ?? {});
      } else if (candidateResponse) {
        // Handle direct candidate data (fallback)
        setCandidateData((candidateResponse as any) ?? {});
      }

      if (comparisonResponse) {
        setComparisonData(comparisonResponse);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (!ignore) {
      getjobpostdata();
    }
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setPhotoError(false);
  }, [candidateData?.photoUrl]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onBack}
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <ArrowLeft className='h-5 w-5' />
                <span>{backText}</span>
              </button>
              <div className='flex items-center space-x-3'>
                {!loading && candidateData?.photoUrl && !photoError ? (
                  <img
                    src={candidateData.photoUrl}
                    alt={candidateData?.name}
                    className='w-10 h-10 rounded-lg object-cover border-2 border-blue-100 shadow-sm'
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  !loading && (
                    <div className='bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg'>
                      <User className='h-5 w-5 text-white' />
                    </div>
                  )
                )}
                {!loading && (
                  <div>
                    <h1 className='text-xl font-bold text-gray-900'>{candidateData?.name}</h1>
                    <p className='text-sm text-gray-600'>
                      {candidateData?.designation && (
                        <>
                          {candidateData.designation}
                          {candidateData?.location && ' • '}
                        </>
                      )}
                      {candidateData?.location ?? ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              {/* <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button> */}
              <button
                onClick={() =>
                  exportCandidateReport(candidateData!, comparisonData, setIsExporting)
                }
                disabled={loading || !candidateData || isExporting}
                className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
              >
                {isExporting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className='h-4 w-4' />
                    <span>Export Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Candidate Summary Card */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <span className='ml-3 text-gray-600'>Loading data...</span>
            </div>
          ) : (
            <div className='grid lg:grid-cols-4 gap-8'>
              <div className='lg:col-span-1'>
                <div className='text-center'>
                  {/* Photo Display */}
                  <div className='relative mb-4'>
                    {candidateData?.photoUrl && !photoError ? (
                      <div
                        className='relative w-32 h-32 mx-auto cursor-pointer group'
                        onClick={() => setIsPhotoModalOpen(true)}
                      >
                        <img
                          src={candidateData.photoUrl}
                          alt={candidateData?.name}
                          className='w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105'
                          onError={() => setPhotoError(true)}
                        />
                        <div className='absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center'>
                          <Eye className='h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                        </div>
                        {/* Status Badge */}
                        {/* {(candidateData?.status === "completed" || candidateData?.status === "under_review") && (
                          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )} */}
                      </div>
                    ) : (
                      <div className='relative'>
                        <div className='bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-lg border-4 border-blue-100 hover:shadow-xl transition-shadow'>
                          <span className='text-3xl font-bold text-white'>
                            {candidateData?.name
                              ?.split(' ')
                              ?.map((n: string) => n[0])
                              ?.join('')}
                          </span>
                        </div>
                        {/* Status Badge */}
                        {/* {(candidateData?.status === "completed" || candidateData?.status === "under_review") && (
                          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )} */}
                      </div>
                    )}
                  </div>
                  <h2 className='text-xl font-bold text-gray-900 mb-2'>{candidateData?.name}</h2>
                  {candidateData?.designation && (
                    <p className='text-sm font-medium text-blue-600 mb-3'>
                      {candidateData.designation}
                    </p>
                  )}
                  <div className='space-y-2 text-sm text-gray-600'>
                    <div className='flex items-center justify-center space-x-2'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span className='truncate'>{candidateData?.email}</span>
                    </div>
                    {(candidateData?.mobile || candidateData?.phone) && (
                      <div className='flex items-center justify-center space-x-2'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <span>{candidateData?.mobile || candidateData?.phone}</span>
                      </div>
                    )}
                    {candidateData?.location && (
                      <div className='flex items-center justify-center space-x-2'>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <span>{candidateData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='lg:col-span-3'>
                <div className='grid md:grid-cols-3 gap-6'>
                  {(candidateData?.status === 'completed' ||
                    candidateData?.status === 'under_review') && (
                      <>
                        <div className='text-center'>
                          <div
                            className={`text-4xl font-bold mb-2 ${getScoreColor(
                              candidateData?.categoryPercentage?.overallPercentage ?? 0
                            ).split(' ')[0]
                              }`}
                          >
                            {candidateData?.categoryPercentage?.overallPercentage}%
                          </div>
                          <div className='text-sm text-gray-600'>Overall Score</div>
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreColor(
                              candidateData?.categoryPercentage?.overallPercentage ?? 0
                            )}`}
                          >
                            Grade:{' '}
                            {getScoreGrade(candidateData?.categoryPercentage?.overallPercentage ?? 0)}
                          </div>
                        </div>

                        <div className='text-center'>
                          <div className='text-4xl font-bold text-gray-900 mb-2'>
                            {candidateData?.duration}m
                          </div>
                          <div className='text-sm text-gray-600'>Interview Duration</div>
                        </div>

                        <div className='text-center'>
                          <div className='text-4xl font-bold text-gray-900 mb-2'>
                            {candidateData?.attemptedQuestions}
                          </div>
                          <div className='text-sm text-gray-600'>Questions Answered</div>
                        </div>
                      </>
                    )}
                </div>

                <div className='mt-6 grid md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Interview Details</h3>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4' />
                        <span>Applied: {format(candidateData?.appliedDate, 'dd/MM/yyyy')}</span>
                      </div>
                      {(candidateData?.status === 'completed' ||
                        candidateData?.status === 'under_review') && (
                          <div className='flex items-center space-x-2'>
                            <Clock className='h-4 w-4' />
                            <span>
                              Interviewed: {format(candidateData?.interviewDate, 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                      <div className='flex items-center space-x-2'>
                        <Award className='h-4 w-4' />
                        <span>
                          Status:{' '}
                          {candidateData?.status !== undefined
                            ? candidateData?.status.charAt(0).toUpperCase() +
                            candidateData?.status.slice(1)
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <h3 className='font-medium text-gray-900 mb-3 flex items-center space-x-2'>
                      <div className='bg-blue-100 p-1.5 rounded-lg'>
                        <GraduationCap className='h-4 w-4 text-blue-600' />
                      </div>
                      <span>Education</span>
                    </h3>
                    <div className='space-y-3'>
                      {candidateData?.highestQualification && (
                        <div className='bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <Award className='h-4 w-4 text-blue-600' />
                            <div className='text-sm font-bold text-gray-900'>
                              Highest Qualification
                            </div>
                          </div>
                          <div className='text-base font-semibold text-gray-800 ml-6'>
                            {candidateData.highestQualification}
                          </div>
                        </div>
                      )}
                      {candidateData?.educations && candidateData.educations.length > 0 && (
                        <div className='space-y-3'>
                          <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                            Education History
                          </div>
                          {candidateData.educations.map((edu, index) => {
                            // Map education type to display name
                            const getEducationTitle = (type: string) => {
                              const typeMap = {
                                tenth: '10th Standard / SSC',
                                twelfth: '12th Standard / HSC',
                                degree: "Bachelor's Degree",
                                pg: 'Post Graduate Degree',
                                master: "Master's Degree",
                                phd: 'PhD / Doctorate',
                              };
                              return typeMap[type as keyof typeof typeMap] || type;
                            };

                            return (
                              <div
                                key={index}
                                className='bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group'
                              >
                                <div className='flex items-start space-x-3'>
                                  <div className='bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0'>
                                    <GraduationCap className='h-4 w-4 text-blue-600' />
                                  </div>
                                  <div className='flex-1 min-w-0'>
                                    {/* Education Title and Stream */}
                                    <div className='font-semibold text-gray-900 text-sm mb-1'>
                                      {getEducationTitle(edu.type)}
                                      {edu.stream && edu.stream.trim() && (
                                        <span className='text-gray-600 font-normal'>
                                          {' '}
                                          - {edu.stream}
                                        </span>
                                      )}
                                    </div>

                                    {/* Year and Percentage */}
                                    <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                                      {edu.yearOfPassing && edu.yearOfPassing.trim() && (
                                        <div className='flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md'>
                                          <Calendar className='h-3 w-3' />
                                          <span>Year: {edu.yearOfPassing}</span>
                                        </div>
                                      )}
                                      {edu.percentage && edu.percentage.toString().trim() && (
                                        <div className='flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium'>
                                          <Star className='h-3 w-3' />
                                          <span>
                                            {parseFloat(edu.percentage) > 10
                                              ? `${edu.percentage}%`
                                              : `${edu.percentage} CGPA`}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!candidateData?.highestQualification &&
                        (!candidateData?.educations || candidateData.educations.length === 0) && (
                          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 text-center'>
                            <GraduationCap className='h-8 w-8 text-gray-300 mx-auto mb-2' />
                            <div className='text-sm text-gray-500'>
                              No education details available
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <></>
        ) : (
          (candidateData?.status === 'under_review' || candidateData?.status === 'completed') && (
            <>
              {/* Navigation Tabs */}
              <div className='bg-white rounded-xl shadow-sm mb-8'>
                <div className='border-b border-gray-200'>
                  <nav className='flex space-x-8 px-6'>
                    {[
                      { id: 'overview', label: 'Overview', icon: Award },
                      {
                        id: 'responses',
                        label: 'Response Analysis',
                        icon: MessageSquare,
                      },
                      {
                        id: 'skills',
                        label: 'Skill Breakdown',
                        icon: TrendingUp,
                      },
                      {
                        id: 'behavioral',
                        label: 'Behavioral Analysis',
                        icon: Eye,
                      },
                      {
                        id: 'proctoring',
                        label: 'Proctoring Alerts',
                        icon: Shield,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <tab.icon className='h-4 w-4' />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className='grid lg:grid-cols-3 gap-8'>
                  {/* Performance Scores */}
                  <div className='lg:col-span-2'>
                    <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
                      <h2 className='text-xl font-bold text-gray-900 mb-6'>
                        Performance Breakdown
                      </h2>
                      <div className='space-y-6'>
                        {[
                          {
                            label: 'Communication Skills',
                            score:
                              candidateData?.performanceBreakdown?.communicationSkills
                                ?.overallAveragePercentage ?? 0,
                            icon: '💬',
                          },
                          {
                            label: 'Technical Knowledge',
                            score:
                              candidateData?.performanceBreakdown?.technicalKnowledge
                                ?.overallAveragePercentage ?? 0,
                            icon: '🔧',
                          },
                          {
                            label: 'Body Language',
                            score:
                              candidateData?.performanceBreakdown?.body_language
                                ?.overallAveragePercentage ?? 0,
                            icon: '👤',
                          },
                          {
                            label: 'Confidence Level',
                            score:
                              candidateData?.performanceBreakdown?.confidenceLevel
                                ?.overallAveragePercentage ?? 0,
                            icon: '💪',
                          },
                          {
                            label: 'Professional Attire',
                            score:
                              candidateData?.performanceBreakdown?.culturalFit
                                ?.overallAveragePercentage ?? 0,
                            icon: '👔',
                          },
                        ].map((item, index) => (
                          <div key={index}>
                            <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center space-x-3'>
                                <span className='text-2xl'>{item.icon}</span>
                                <span className='font-medium text-gray-900'>{item.label}</span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <span className='font-bold text-gray-900'>{item.score}%</span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                                    item.score
                                  )}`}
                                >
                                  {getScoreGrade(item.score)}
                                </span>
                              </div>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-3'>
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ${item.score >= 90
                                  ? 'bg-green-500'
                                  : item.score >= 80
                                    ? 'bg-blue-500'
                                    : item.score >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                style={{ width: `${item.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className='bg-white rounded-xl shadow-sm p-6'>
                      <h2 className='text-xl font-bold text-gray-900 mb-6'>
                        AI Evaluation Summary
                      </h2>
                      <div className='bg-blue-50 p-6 rounded-xl mb-6'>
                        <p className='text-gray-700 leading-relaxed'>
                          {candidateData?.aiEvaluationSummary?.summary}
                        </p>
                      </div>
                      <div className='grid md:grid-cols-2 gap-6'>
                        <div>
                          <h3 className='font-semibold text-green-800 mb-3 flex items-center space-x-2'>
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span>Key Strengths</span>
                          </h3>
                          <ul className='space-y-2'>
                            {candidateData?.aiEvaluationSummary?.keyStrengths?.map(
                              (strength, index) => (
                                <li
                                  key={index}
                                  className='text-sm text-gray-700 flex items-start space-x-2'
                                >
                                  <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                                  <span>{strength}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h3 className='font-semibold text-blue-800 mb-3 flex items-center space-x-2'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            <span>Areas for Growth</span>
                          </h3>
                          <ul className='space-y-2'>
                            {candidateData?.aiEvaluationSummary?.areasOfGrowth?.map(
                              (improvement, index) => (
                                <li
                                  key={index}
                                  className='text-sm text-gray-700 flex items-start space-x-2'
                                >
                                  <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                                  <span>{improvement}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className='space-y-6'>
                    <div className='bg-white rounded-xl shadow-sm p-6'>
                      <h3 className='font-semibold text-gray-900 mb-4'>Quick Stats</h3>
                      <div className='space-y-4'>
                        {candidateData?.quickStats &&
                          Object.entries(candidateData?.quickStats ?? {}).map(
                            ([skill, data]: any) => (
                              <div className='flex justify-between items-center'>
                                <span className='text-sm text-gray-600'>{camelToLabel(skill)}</span>
                                <span className='font-semibold text-green-600'>{data}</span>
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-6'>
                      <h3 className='font-semibold text-gray-900 mb-4'>Recommendation</h3>
                      <div className='text-center'>
                        <div className='bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
                          <Award className='h-8 w-8 text-green-600' />
                        </div>
                        <div className='text-lg font-bold text-green-800 mb-2'>
                          {candidateData?.recommendations?.recommendation}
                        </div>
                        <p className='text-sm text-gray-600'>
                          {candidateData?.recommendations?.summary}
                        </p>
                      </div>
                    </div>

                    <div className='bg-white rounded-xl shadow-sm p-6'>
                      <h3 className='font-semibold text-gray-900 mb-4'>Next Steps</h3>
                      <div className='space-y-3'>
                        <button className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm'>
                          Schedule Technical Round
                        </button>
                        <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm'>
                          Send to Hiring Manager
                        </button>
                        <button className='w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm'>
                          Request References
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'responses' && (
                <div className='space-y-6'>
                  {candidateData?.StudentInterviewAnswer &&
                    candidateData?.StudentInterviewAnswer?.filter(
                      (que) => que?.answer?.length > 0
                    ).map((response, index) => (
                      <div key={response?.id} className='bg-white rounded-xl shadow-sm p-6'>
                        <div className='flex items-start justify-between mb-4'>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-3 mb-2'>
                              <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                                Question {index + 1}
                              </span>
                              <span className='text-sm text-gray-500'>
                                {response?.responseTime}s
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getQuestionScoreColor(
                                  response?.score,
                                  response?.Question.type
                                )}`}
                              >
                                {response?.Question.type === 'communication' || response?.Question.type === 'behavioral' ? `${response?.score} out of 10` : response?.score}
                              </span>
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 mb-3'>
                              {response?.Question?.question}
                            </h3>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <button className='p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100'>
                              <Video className='h-4 w-4' />
                            </button>
                            <button className='p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100'>
                              <Mic className='h-4 w-4' />
                            </button>
                            <button className='p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100'>
                              <Play className='h-4 w-4' />
                            </button>
                          </div>
                        </div>

                        <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                          <h4 className='font-medium text-gray-900 mb-2'>Candidate Response:</h4>
                          <p className='text-gray-700 leading-relaxed'>{response?.answer}</p>
                        </div>

                        <div className='bg-blue-50 p-4 rounded-lg'>
                          <h4 className='font-medium text-blue-900 mb-2'>AI Analysis:</h4>
                          <p className='text-blue-800 text-sm'>{response.aiEvaluation}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>Skill Assessment</h2>
                    <div className='space-y-6'>
                      {Object.entries(candidateData?.performanceBreakdown).map(
                        ([skill, data]: any) => {
                          if (['culturalFit', 'behavior', 'body_language'].includes(skill)) return;
                          else
                            return (
                              <div key={skill}>
                                <div className='flex items-center justify-between mb-2'>
                                  <div className='flex items-center space-x-2'>
                                    <span className='font-medium text-gray-900 capitalize'>
                                      {camelToLabel(skill)}
                                    </span>
                                    {getTrendIcon(skill)}
                                  </div>
                                  <span
                                    className={`font-bold ${getScoreColor(
                                      data.overallAveragePercentage
                                    )}`}
                                  >
                                    {data.overallAveragePercentage ?? 0}%
                                  </span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                                  <div
                                    className={`h-2 rounded-full ${data.overallAveragePercentage >= 90
                                      ? 'bg-green-500'
                                      : data.overallAveragePercentage >= 80
                                        ? 'bg-blue-500'
                                        : data.overallAveragePercentage >= 70
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                      }`}
                                    style={{
                                      width: `${data.overallAveragePercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className='text-sm text-gray-600'>{data.summary}</p>
                              </div>
                            );
                        }
                      )}
                    </div>
                  </div>

                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>Skill Comparison</h2>
                    {/* Comparison Data Info */}
                    {comparisonData && (
                      <div
                        className={`mb-4 p-3 rounded-lg border ${comparisonData.totalCandidates > 0
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-yellow-50 border-yellow-200'
                          }`}
                      >
                        <div
                          className={`flex items-center space-x-2 text-sm ${comparisonData.totalCandidates > 0 ? 'text-blue-800' : 'text-yellow-800'
                            }`}
                        >
                          <TrendingUp className='h-4 w-4' />
                          <span>
                            {comparisonData.totalCandidates > 0
                              ? `Comparison based on ${comparisonData.totalCandidates} completed interviews`
                              : 'No completed interviews found for comparison yet'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className='space-y-4'>
                      {Object.entries(candidateData?.performanceBreakdown).map(
                        ([skill, data]: any) => {
                          if (['culturalFit', 'behavior', 'body_language'].includes(skill)) return;
                          else {
                            const candidateScore = data?.overallAveragePercentage || 0;
                            const averageScore = comparisonData?.averageScores?.[skill] || 0;
                            const difference = candidateScore - averageScore;
                            const isAboveAverage = candidateScore > averageScore;

                            return (
                              <div
                                key={skill}
                                className={`border-2 rounded-xl p-5 transition-all ${isAboveAverage
                                  ? 'border-green-200 bg-green-50/50'
                                  : candidateScore === averageScore
                                    ? 'border-yellow-200 bg-yellow-50/50'
                                    : 'border-red-200 bg-red-50/50'
                                  }`}
                              >
                                <div className='flex justify-between items-start mb-3'>
                                  <div>
                                    <h4 className='font-semibold text-gray-900 text-lg'>
                                      {camelToLabel(skill)}
                                    </h4>
                                  </div>
                                  <div className='text-right'>
                                    <div className='text-2xl font-bold text-gray-900'>
                                      {candidateScore}%
                                    </div>
                                  </div>
                                </div>

                                {/* Performance Comparison Bar */}
                                <div className='space-y-3'>
                                  <div className='flex justify-between text-sm text-gray-600'>
                                    <span>
                                      Performance vs Others ({comparisonData?.totalCandidates || 0}{' '}
                                      candidates)
                                    </span>
                                    <span>Average: {averageScore}%</span>
                                  </div>

                                  <div className='relative'>
                                    {/* Background track */}
                                    <div className='w-full bg-gray-200 rounded-full h-3'>
                                      {/* Average marker */}
                                      <div
                                        className='absolute top-0 w-1 h-3 bg-gray-400 rounded'
                                        style={{ left: `${averageScore}%` }}
                                      ></div>
                                      {/* Candidate progress */}
                                      <div
                                        className={`h-3 rounded-full transition-all duration-500 ${isAboveAverage
                                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                                          : candidateScore === averageScore
                                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                            : 'bg-gradient-to-r from-red-400 to-red-600'
                                          }`}
                                        style={{ width: `${Math.min(candidateScore, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Performance message */}
                                  <div
                                    className={`text-sm p-3 rounded-lg ${isAboveAverage
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : candidateScore === averageScore
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                      }`}
                                  >
                                    {comparisonData?.totalCandidates > 0 ? (
                                      isAboveAverage ? (
                                        <>
                                          ✅ <strong>Strong performance</strong>
                                          <br />
                                          This student scored{' '}
                                          <strong>{difference.toFixed(1)}%</strong> higher than the
                                          average of{' '}
                                          <strong>{comparisonData.totalCandidates}</strong> students
                                          in <strong>{camelToLabel(skill)}</strong>.
                                        </>
                                      ) : candidateScore === averageScore ? (
                                        <>
                                          ⚖️ <strong>Average performance</strong>
                                          <br />
                                          This student’s score is on par with the average of{' '}
                                          <strong>{comparisonData.totalCandidates}</strong> students
                                          in <strong>{camelToLabel(skill)}</strong>.
                                        </>
                                      ) : (
                                        <>
                                          ⚠️ <strong>Needs improvement</strong>
                                          <br />
                                          This student scored{' '}
                                          <strong>{Math.abs(difference).toFixed(1)}%</strong> below
                                          the average of{' '}
                                          <strong>{comparisonData.totalCandidates}</strong> students
                                          in <strong>{camelToLabel(skill)}</strong>. Additional
                                          support is recommended.
                                        </>
                                      )
                                    ) : (
                                      <>
                                        ℹ️ <strong>No comparison available</strong>
                                        <br />
                                        This student scored <strong>
                                          {candidateScore}%
                                        </strong> in <strong>{camelToLabel(skill)}</strong>.
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavioral' && (
                <div className='grid lg:grid-cols-2 gap-8'>
                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>Behavioral Analysis</h2>
                    <div className='space-y-6'>
                      {renderAnalysis(
                        'Eye Contact',
                        candidateData?.behavioral_analysis?.eye_contact ?? 0
                      )}
                      {renderAnalysis('Posture', candidateData?.behavioral_analysis?.posture ?? 0)}
                      {renderAnalysis(
                        'Gestures',
                        candidateData?.behavioral_analysis?.gestures ?? 0
                      )}
                      {renderAnalysis(
                        'Face Expressions',
                        candidateData?.behavioral_analysis?.facial_expressions ?? 0
                      )}
                      {renderAnalysis(
                        'Voice Tone',
                        candidateData?.behavioral_analysis?.voice_tone ?? 0
                      )}
                      {renderAnalysis(
                        'Confidence',
                        candidateData?.behavioral_analysis?.confidence ?? 0
                      )}
                      {renderAnalysis(
                        'Engagement',
                        candidateData?.behavioral_analysis?.engagement ?? 0
                      )}
                    </div>
                  </div>

                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <h2 className='text-xl font-bold text-gray-900 mb-6'>
                      Video Analysis Insights
                    </h2>
                    <div className='space-y-4'>
                      <div className='bg-green-50 p-4 rounded-lg'>
                        <h3 className='font-medium text-green-800 mb-2'>Positive Indicators</h3>
                        <ul className='text-sm text-green-700 space-y-1'>
                          {candidateData?.video_analysis_insights?.positive_indicators
                            ?.slice(1)
                            ?.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                        </ul>
                      </div>

                      <div className='bg-blue-50 p-4 rounded-lg'>
                        <h3 className='font-medium text-blue-800 mb-2'>Areas for Improvement</h3>
                        <ul className='text-sm text-blue-700 space-y-1'>
                          {candidateData?.video_analysis_insights?.areas_for_improvement
                            ?.slice(1)
                            ?.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                        </ul>
                      </div>

                      <div className='bg-yellow-50 p-4 rounded-lg'>
                        <h3 className='font-medium text-yellow-800 mb-2'>Recommendations</h3>
                        <ul className='text-sm text-yellow-700 space-y-1'>
                          {candidateData?.video_analysis_insights?.recommendations?.map(
                            (item, i) => (
                              <li key={i}>• {item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'proctoring' && (
                <div className='space-y-6'>
                  {/* Proctoring Status Overview */}
                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <div className='flex items-center space-x-3 mb-6'>
                      <div className='bg-blue-100 p-2 rounded-lg'>
                        <Shield className='h-5 w-5 text-blue-600' />
                      </div>
                      <h2 className='text-xl font-bold text-gray-900'>Proctoring Overview</h2>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6 mb-6'>
                      {/* Proctoring Status Card */}
                      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-blue-600 font-medium'>Status</p>
                            <p className='text-lg font-bold text-blue-900 capitalize'>
                              {candidateData?.proctoringStatus || 'N/A'}
                            </p>
                          </div>
                          <div className='bg-blue-100 p-2 rounded-lg'>
                            <Eye className='h-4 w-4 text-blue-600' />
                          </div>
                        </div>
                      </div>

                      {/* Total Alerts Card */}
                      <div className='bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-amber-600 font-medium'>Total Alerts</p>
                            <p className='text-lg font-bold text-amber-900'>
                              {candidateData?.proctoringAlerts?.length || 0}
                            </p>
                          </div>
                          <div className='bg-amber-100 p-2 rounded-lg'>
                            <Bell className='h-4 w-4 text-amber-600' />
                          </div>
                        </div>
                      </div>

                      {/* Alert Severity Summary */}
                      <div className='bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-lg border border-rose-100'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-rose-600 font-medium'>Critical Alerts</p>
                            <p className='text-lg font-bold text-rose-900'>
                              {candidateData?.proctoringAlerts?.filter(
                                (alert: any) => (alert.severity || 'info') === 'critical'
                              ).length || 0}
                            </p>
                          </div>
                          <div className='bg-rose-100 p-2 rounded-lg'>
                            <XCircle className='h-4 w-4 text-rose-600' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proctoring Alerts */}
                  <div className='bg-white rounded-xl shadow-sm p-6'>
                    <div className='flex items-center space-x-3 mb-6'>
                      <div className='bg-amber-100 p-2 rounded-lg'>
                        <Bell className='h-5 w-5 text-amber-600' />
                      </div>
                      <h2 className='text-xl font-bold text-gray-900'>Proctoring Alerts</h2>
                    </div>

                    {/* Alert Summary Stats */}
                    {candidateData?.proctoringAlerts &&
                      candidateData.proctoringAlerts.length > 0 && (
                        <div className='mb-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
                          <div className='text-center p-3 bg-indigo-50 rounded-lg'>
                            <Info className='w-5 h-5 text-indigo-600 mx-auto mb-1' />
                            <p className='text-sm font-medium text-indigo-800'>
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) => (alert.severity || 'info') === 'info'
                                ).length
                              }
                            </p>
                            <p className='text-xs text-indigo-600'>Info</p>
                          </div>
                          <div className='text-center p-3 bg-amber-50 rounded-lg'>
                            <AlertTriangle className='w-5 h-5 text-amber-600 mx-auto mb-1' />
                            <p className='text-sm font-medium text-amber-800'>
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) => (alert.severity || 'info') === 'warning'
                                ).length
                              }
                            </p>
                            <p className='text-xs text-amber-600'>Warnings</p>
                          </div>
                          <div className='text-center p-3 bg-rose-50 rounded-lg'>
                            <XCircle className='w-5 h-5 text-rose-600 mx-auto mb-1' />
                            <p className='text-sm font-medium text-rose-800'>
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) => (alert.severity || 'info') === 'critical'
                                ).length
                              }
                            </p>
                            <p className='text-xs text-rose-600'>Critical</p>
                          </div>
                          <div className='text-center p-3 bg-gray-50 rounded-lg'>
                            <Bell className='w-5 h-5 text-gray-600 mx-auto mb-1' />
                            <p className='text-sm font-medium text-gray-800'>
                              {candidateData.proctoringAlerts.length}
                            </p>
                            <p className='text-xs text-gray-600'>Total</p>
                          </div>
                        </div>
                      )}

                    {/* Alerts Container with MatricsView Style */}
                    <div className='rounded-xl border border-slate-200/80 bg-gradient-to-br from-amber-50/40 to-rose-50/20 overflow-hidden'>
                      <div className='flex flex-col gap-2 border-b border-amber-200/50 bg-white/60 px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <Bell className='w-4 h-4 text-amber-500' />
                          <span className='text-sm font-semibold text-slate-700'>Recent Alerts</span>
                          {candidateData?.proctoringAlerts &&
                            candidateData.proctoringAlerts.length > 0 && (
                              <span className='ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full'>
                                {candidateData.proctoringAlerts.length} alert
                                {candidateData.proctoringAlerts.length !== 1 ? 's' : ''}
                              </span>
                            )}
                        </div>

                        {/* Modern filter chips */}
                        <div className='flex flex-wrap items-center gap-2'>
                          {/* Severity filter */}
                          <div className='flex items-center gap-2'>
                            {/* <span className='text-xs font-medium text-slate-500'>Severity:</span> */}
                            {[
                              { id: 'all', label: 'All' },
                              { id: 'info', label: 'Info' },
                              { id: 'warning', label: 'Warning' },
                              { id: 'critical', label: 'Critical' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                onClick={() =>
                                  setAlertSeverityFilter(option.id as 'all' | 'info' | 'warning' | 'critical')
                                }
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${alertSeverityFilter === option.id
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          {/* Type filter */}
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-medium text-slate-500'>Type:</span>
                            <select
                              value={alertTypeFilter}
                              onChange={(e) => setAlertTypeFilter(e.target.value)}
                              className='text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400'
                            >
                              <option value='all'>All types</option>
                              <option value='looking_away'>Looking away</option>
                              <option value='multiple_faces_detected'>Multiple faces</option>
                              <option value='low_engagement'>Low engagement</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className='max-h-80 overflow-y-auto p-2'>
                        {!candidateData?.proctoringAlerts ||
                          candidateData.proctoringAlerts.length === 0 ? (
                          <div className='flex flex-col items-center justify-center py-12 text-slate-400'>
                            <Shield className='w-12 h-12 mb-3 text-slate-300' />
                            <p className='text-sm font-medium'>No proctoring alerts</p>
                            <p className='text-xs mt-1'>
                              This candidate maintained proper conduct during the interview
                            </p>
                          </div>
                        ) : (
                          <ul className='space-y-1.5'>
                            {candidateData.proctoringAlerts
                              .filter((alert: any) => {
                                const sev = alert.severity || 'info';
                                const type = alert.type || 'unknown';

                                const matchesSeverity =
                                  alertSeverityFilter === 'all' || sev === alertSeverityFilter;
                                const matchesType =
                                  alertTypeFilter === 'all' || type === alertTypeFilter;

                                return matchesSeverity && matchesType;
                              })
                              .slice(0, 20)
                              .map((alert, index) => {
                                const alertObj =
                                  typeof alert === 'object' && alert && !Array.isArray(alert)
                                    ? alert
                                    : { message: String(alert) };
                                const severity = (alertObj as any).severity || 'info';
                                const isWarning = severity === 'warning';
                                const isError = severity === 'critical';

                                const Icon = isError ? XCircle : isWarning ? AlertTriangle : Info;
                                const borderColor = isError
                                  ? 'border-l-rose-400'
                                  : isWarning
                                    ? 'border-l-amber-400'
                                    : 'border-l-indigo-400';
                                const bgColor = isError
                                  ? 'bg-rose-50/60'
                                  : isWarning
                                    ? 'bg-amber-50/60'
                                    : 'bg-indigo-50/40';
                                const message =
                                  (alertObj as { message?: string }).message ??
                                  (typeof alert === 'string' ? alert : JSON.stringify(alert));

                                return (
                                  <li
                                    key={index}
                                    className={`flex items-start gap-2 px-2.5 py-1.5 rounded-r-lg border-l-2 ${borderColor} ${bgColor} hover:bg-opacity-80 transition-colors`}
                                  >
                                    <Icon className='w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500' />
                                    <div className='flex-1'>
                                      <div className='flex items-center justify-between'>
                                        <span className='text-[11px] font-medium uppercase tracking-wide text-slate-500'>
                                          {(alertObj as any).type || 'unknown'}
                                        </span>
                                        <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/5 text-slate-500'>
                                          {severity}
                                        </span>
                                      </div>
                                      <span className='text-xs text-slate-700 block mt-0.5'>
                                        {typeof message === 'string'
                                          ? message
                                          : JSON.stringify(message)}
                                      </span>
                                      {typeof alertObj.timestamp === 'string' ||
                                        typeof alertObj.timestamp === 'number' ||
                                        alertObj.timestamp instanceof Date ? (
                                        <span className='text-[10px] text-slate-400 mt-0.5 block'>
                                          {new Date(alertObj.timestamp).toLocaleString()}
                                        </span>
                                      ) : null}
                                    </div>
                                    {(isError || isWarning) && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isError
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-amber-100 text-amber-700'
                                          }`}
                                      >
                                        {isError ? 'Critical' : 'Warning'}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Photo Modal */}
      {isPhotoModalOpen && candidateData?.photoUrl && !photoError && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className='relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600'>
              <div className='flex items-center space-x-3'>
                <div className='bg-white bg-opacity-20 p-2 rounded-lg'>
                  <User className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-white'>{candidateData?.name}</h3>
                  {candidateData?.designation && (
                    <p className='text-sm text-blue-100'>{candidateData.designation}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className='p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
                aria-label='Close modal'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            {/* Image Container */}
            <div className='relative bg-gray-900 flex items-center justify-center p-8'>
              <img
                src={candidateData.photoUrl}
                alt={candidateData?.name}
                className='max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl'
              />
            </div>

            {/* Footer */}
            <div className='p-4 bg-gray-50 border-t border-gray-200'>
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <div className='flex items-center space-x-4'>
                  {candidateData?.email && (
                    <div className='flex items-center space-x-2'>
                      <Mail className='h-4 w-4' />
                      <span>{candidateData.email}</span>
                    </div>
                  )}
                  {(candidateData?.mobile || candidateData?.phone) && (
                    <div className='flex items-center space-x-2'>
                      <Phone className='h-4 w-4' />
                      <span>{candidateData?.mobile || candidateData?.phone}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 80) return 'text-blue-600 bg-blue-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const renderAnalysis = (title: string, score: number) => {
  return (
    <div key={title}>
      <div className='flex items-center justify-between mb-2'>
        <span className='font-medium text-gray-900 capitalize'>{title}</span>
        <span className={`font-bold ${getScoreColor(score).split(' ')[0]}`}>{score}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className={`h-2 rounded-full ${score >= 90
            ? 'bg-green-500'
            : score >= 80
              ? 'bg-blue-500'
              : score >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          style={{
            width: `${score}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
