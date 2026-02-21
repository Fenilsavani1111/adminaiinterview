import { Candidate } from '../types';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const camelToLabel = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // insert space before capital letters
    .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
};

export const exportCandidateReport = async (
  candidateData: Candidate,
  comparisonData: any,
  setIsExporting: (value: boolean) => void,
) => {
  if (!candidateData) {
    alert('No candidate data available to export');
    return;
  }

  setIsExporting(true);

  // Helper functions for formatting
  const formatEducationType = (type: string) => {
    const educationMap: { [key: string]: string } = {
      tenth: '10th Standard / SSC',
      twelfth: '12th Standard / HSC',
      plusTwo: '12th Standard / HSC',
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
    infoSection.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
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
        candidateData.interviewDate
          ? format(new Date(candidateData.interviewDate), 'PPP')
          : 'N/A',
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
    const additionalDetailsSection = overviewSheet.addRow([
      'ADDITIONAL DETAILS',
      '',
    ]);
    additionalDetailsSection.font = { bold: true, color: { argb: 'FF374151' } };
    additionalDetailsSection.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    additionalDetailsSection.height = 20;
    overviewSheet.mergeCells(
      `A${additionalDetailsSection.number}:B${additionalDetailsSection.number}`,
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
      educationSection.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      educationSection.height = 20;
      overviewSheet.mergeCells(
        `A${educationSection.number}:B${educationSection.number}`,
      );

      candidateData.educations.forEach((education, index) => {
        const educationTitle = overviewSheet.addRow([
          `Education ${index + 1}`,
          '',
        ]);
        educationTitle.getCell(1).font = {
          bold: true,
          color: { argb: 'FF6B7280' },
        };
        educationTitle.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
        educationTitle.height = 18;
        overviewSheet.mergeCells(
          `A${educationTitle.number}:B${educationTitle.number}`,
        );

        const institution =
          education.schoolName || education.collegeName || null;
        const educationDetails: [string, string][] = [
          ['Type', formatEducationType(education.type || '')],
          ['Stream', education.stream || 'N/A'],
          ...(institution
            ? [['Institution', institution] as [string, string]]
            : []),
          [
            'Percentage',
            education.percentage ? `${education.percentage}%` : 'N/A',
          ],
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
    if (
      candidateData.governmentProof &&
      candidateData.governmentProof.length > 0
    ) {
      overviewSheet.addRow([]);
      const govProofSection = overviewSheet.addRow([
        'GOVERNMENT PROOF DOCUMENTS',
        '',
      ]);
      govProofSection.font = { bold: true, color: { argb: 'FF374151' } };
      govProofSection.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      govProofSection.height = 20;
      overviewSheet.mergeCells(
        `A${govProofSection.number}:B${govProofSection.number}`,
      );

      candidateData.governmentProof.forEach((proof, index) => {
        const docTypeLabel = proof.idProofType || `Document ${index + 1}`;
        const docTypeDisplay = proof.type
          ? proof.type.charAt(0).toUpperCase() + proof.type.slice(1)
          : 'N/A';
        const isVerified = !!proof.verified;

        const proofDetails: [string, string][] = [
          [`${docTypeLabel} — Type`, docTypeDisplay],
          [`${docTypeLabel} — Value`, proof.value || 'N/A'],
          [
            `${docTypeLabel} — Verified`,
            `${getVerificationIcon(isVerified)} ${isVerified ? 'Verified' : 'Not Verified'}`,
          ],
        ];

        proofDetails.forEach(([field, value]) => {
          const row = overviewSheet.addRow([field, value]);
          row.getCell(1).font = { bold: true };
          row.height = 18;

          // Color-code verified row
          if (field.includes('Verified')) {
            row.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isVerified ? 'FFD1FAE5' : 'FFFECACA' },
            };
          }
        });
      });
    }

    // Add proctoring alerts if available
    if (
      candidateData.proctoringAlerts &&
      candidateData.proctoringAlerts.length > 0
    ) {
      overviewSheet.addRow([]);
      const proctoringSection = overviewSheet.addRow(['PROCTORING ALERTS', '']);
      proctoringSection.font = { bold: true, color: { argb: 'FF374151' } };
      proctoringSection.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      proctoringSection.height = 20;
      overviewSheet.mergeCells(
        `A${proctoringSection.number}:B${proctoringSection.number}`,
      );

      candidateData.proctoringAlerts.forEach((alert, index) => {
        const row = overviewSheet.addRow([
          `Alert ${index + 1}`,
          (alert as any).message || 'N/A',
        ]);
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
      const categorySection = overviewSheet.addRow([
        'CATEGORY PERFORMANCE',
        '',
      ]);
      categorySection.font = { bold: true, color: { argb: 'FF374151' } };
      categorySection.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      categorySection.height = 20;
      overviewSheet.mergeCells(
        `A${categorySection.number}:B${categorySection.number}`,
      );

      // Add overall category metrics
      const categoryOverallInfo = [
        ['Total Score', `${candidateData.categoryPercentage.totalScore || 0}`],
        [
          'Overall Score',
          `${candidateData.categoryPercentage.overallScore || 0}`,
        ],
        [
          'Overall Percentage',
          `${candidateData.categoryPercentage.overallPercentage || 0}%`,
        ],
      ];

      categoryOverallInfo.forEach(([field, value]) => {
        const row = overviewSheet.addRow([field, value]);
        row.getCell(1).font = { bold: true };
        row.height = 18;
      });

      // Add category-wise breakdown
      if (candidateData.categoryPercentage?.categoryWiseScore) {
        overviewSheet.addRow([]);
        const categoryWiseSection = overviewSheet.addRow([
          'CATEGORY-WISE BREAKDOWN',
          '',
        ]);
        categoryWiseSection.font = { bold: true, color: { argb: 'FF6B7280' } };
        categoryWiseSection.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
        categoryWiseSection.height = 20;
        overviewSheet.mergeCells(
          `A${categoryWiseSection.number}:B${categoryWiseSection.number}`,
        );

        Object.entries(
          candidateData.categoryPercentage?.categoryWiseScore,
        ).forEach(([category, data]: [string, any]) => {
          const score =
            (data?.total ?? 0) > 0
              ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
              : 0;
          const categoryRow = overviewSheet.addRow([
            camelToLabel(category),
            `${score}%`,
          ]);
          categoryRow.getCell(1).font = { bold: true };
          categoryRow.height = 18;

          // Add color coding based on performance
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
        });
      }
    }

    // Add performance breakdown section
    overviewSheet.addRow([]);
    const performanceSection = overviewSheet.addRow([
      'PERFORMANCE BREAKDOWN',
      '',
    ]);
    performanceSection.font = { bold: true, color: { argb: 'FF374151' } };
    performanceSection.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    performanceSection.height = 20;
    overviewSheet.mergeCells(
      `A${performanceSection.number}:B${performanceSection.number}`,
    );

    // Add performance data
    if (candidateData.performanceBreakdown) {
      Object.entries(candidateData.performanceBreakdown).forEach(
        ([skill, data]: [string, any]) => {
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
        },
      );
    }

    // Add Category Analysis sheet (if categoryPercentage data exists)
    let categorySheet: any;
    if (
      candidateData.categoryPercentage &&
      candidateData.categoryPercentage?.categoryWiseScore
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
      categoryTitle.font = {
        size: 16,
        bold: true,
        color: { argb: 'FF1F2937' },
      };
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
      categoryHeaders.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7C3AED' },
      };
      categoryHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      categoryHeaders.height = 22;

      // Add category data
      Object.entries(
        candidateData.categoryPercentage?.categoryWiseScore,
      ).forEach(([category, data]: [string, any]) => {
        const scoreValue =
          (data?.total ?? 0) > 0
            ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
            : 0;
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
      });

      // Add category insights
      categorySheet.addRow([]);
      const insightsTitle = categorySheet.addRow([
        'PERFORMANCE INSIGHTS',
        '',
        '',
        '',
      ]);
      insightsTitle.font = { bold: true, color: { argb: 'FF374151' } };
      insightsTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      insightsTitle.height = 20;
      categorySheet.mergeCells(
        `A${insightsTitle.number}:D${insightsTitle.number}`,
      );

      // Calculate insights
      const categoryScoresList = Object.values(
        candidateData.categoryPercentage?.categoryWiseScore || {},
      ).map((data: any) =>
        (data?.total ?? 0) > 0
          ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
          : 0,
      );
      const avgCategoryScore =
        categoryScoresList.length > 0
          ? categoryScoresList.reduce((a, b) => a + b, 0) /
            categoryScoresList.length
          : 0;

      const entries = Object.entries(
        candidateData.categoryPercentage?.categoryWiseScore || {},
      ).map(([c, data]: any) => [
        c,
        (data?.total ?? 0) > 0
          ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
          : 0,
      ]);

      const strongestCategory =
        entries.length > 0
          ? entries.reduce((a, b) =>
              (a[1] as number) > (b[1] as number) ? a : b,
            )[0]
          : 'N/A';
      const weakestCategory =
        entries.length > 0
          ? entries.reduce((a, b) =>
              (a[1] as number) < (b[1] as number) ? a : b,
            )[0]
          : 'N/A';

      const getCatScore = (cat: string) => {
        if (!cat || cat === 'N/A') return 0;
        const data = candidateData.categoryPercentage?.categoryWiseScore[cat];
        return (data?.total ?? 0) > 0
          ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
          : 0;
      };

      const insights = [
        ['Average Category Score', `${avgCategoryScore.toFixed(1)}%`, '', ''],
        [
          'Strongest Area',
          camelToLabel(strongestCategory),
          `${getCatScore(strongestCategory)}%`,
          '🎯 Strength',
        ],
        [
          'Development Area',
          camelToLabel(weakestCategory),
          `${getCatScore(weakestCategory)}%`,
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
        { key: 'institution', width: 28 },
        { key: 'percentage', width: 15 },
        { key: 'year', width: 15 },
        { key: 'level', width: 20 },
      ];

      // Add title for education sheet
      const educationTitle = educationSheet.addRow([
        'EDUCATION ANALYSIS',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      educationTitle.font = {
        size: 16,
        bold: true,
        color: { argb: 'FF1F2937' },
      };
      educationTitle.getCell(1).alignment = { horizontal: 'center' };
      educationTitle.height = 25;
      educationSheet.mergeCells('A1:G1');

      educationSheet.addRow([]);

      // Add summary info
      const totalEducations = candidateData.educations.length;
      const avgPercentage =
        candidateData.educations
          .filter((edu) => edu.percentage && !isNaN(parseFloat(edu.percentage)))
          .reduce((sum, edu) => sum + parseFloat(edu.percentage || '0'), 0) /
        candidateData.educations.filter(
          (edu) => edu.percentage && !isNaN(parseFloat(edu.percentage)),
        ).length;

      const summaryRow = educationSheet.addRow([
        `Total Qualifications: ${totalEducations} | Average Performance: ${isNaN(avgPercentage) ? 'N/A' : avgPercentage.toFixed(1) + '%'}`,
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      summaryRow.getCell(1).alignment = { horizontal: 'center' };
      summaryRow.font = { bold: true, color: { argb: 'FF374151' } };
      summaryRow.height = 20;
      educationSheet.mergeCells(`A${summaryRow.number}:G${summaryRow.number}`);

      educationSheet.addRow([]);

      // Add headers
      const educationHeaders = educationSheet.addRow([
        'Qualification',
        'Level',
        'Stream/Subject',
        'Institution',
        'Score (%)',
        'Year',
        'Performance',
      ]);
      educationHeaders.font = { bold: true };
      educationHeaders.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B5CF6' },
      };
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

        const institution =
          education.schoolName || education.collegeName || 'N/A';
        const row = educationSheet.addRow([
          `${formatEducationType(education.type || '')} ${index + 1}`,
          formatEducationType(education.type || ''),
          education.stream || 'N/A',
          institution,
          education.percentage ? `${education.percentage}%` : 'N/A',
          education.yearOfPassing || 'N/A',
          performanceLevel,
        ]);
        row.height = 18;

        // Color coding based on performance
        // Column indices: 1=Qualification, 2=Level, 3=Stream, 4=Institution, 5=Score, 6=Year, 7=Performance
        if (!isNaN(percentage)) {
          if (percentage >= 80) {
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' },
            };
          } else if (percentage >= 70) {
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
          } else if (percentage >= 60) {
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFED7AA' },
            };
          } else if (percentage < 60) {
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFECACA' },
            };
          }
        }
      });

      // Add education insights
      educationSheet.addRow([]);
      const eduInsightsTitle = educationSheet.addRow([
        'EDUCATION INSIGHTS',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      eduInsightsTitle.font = { bold: true, color: { argb: 'FF374151' } };
      eduInsightsTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };
      eduInsightsTitle.height = 20;
      educationSheet.mergeCells(
        `A${eduInsightsTitle.number}:G${eduInsightsTitle.number}`,
      );

      // Calculate education insights
      const validPercentages = candidateData.educations
        .filter((edu) => edu.percentage && !isNaN(parseFloat(edu.percentage)))
        .map((edu) => parseFloat(edu.percentage!));

      const highestEducation = candidateData.educations.reduce(
        (highest, current) => {
          const levels = { tenth: 1, degree: 2, pg: 3, master: 4, phd: 5 };
          const currentLevel = levels[current.type as keyof typeof levels] || 0;
          const highestLevel = levels[highest.type as keyof typeof levels] || 0;
          return currentLevel > highestLevel ? current : highest;
        },
      );

      const bestPerformance =
        validPercentages.length > 0
          ? candidateData.educations.find(
              (edu) =>
                parseFloat(edu.percentage || '0') ===
                Math.max(...validPercentages),
            )
          : null;

      const insights = [
        [
          'Total Qualifications',
          totalEducations.toString(),
          '',
          '',
          '',
          '',
          '',
        ],
        [
          'Highest Education Level',
          formatEducationType(highestEducation.type || ''),
          highestEducation.stream || '',
          highestEducation.schoolName || highestEducation.collegeName || '',
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
          bestPerformance?.schoolName || bestPerformance?.collegeName || '',
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
          '',
          validPercentages.length > 1
            ? Math.max(...validPercentages) - Math.min(...validPercentages) < 10
              ? '📈 Consistent'
              : '📊 Variable'
            : '',
        ],
      ];

      insights.forEach(
        ([metric, value, additional, institution, empty1, empty2, note]) => {
          const row = educationSheet.addRow([
            metric,
            value,
            additional,
            institution,
            empty1,
            empty2,
            note,
          ]);
          row.getCell(1).font = { bold: true };
          row.height = 18;
        },
      );
    }

    // Add Government Proof Analysis sheet (if government proof data exists)
    let govProofSheet: any;
    if (
      candidateData.governmentProof &&
      candidateData.governmentProof.length > 0
    ) {
      govProofSheet = workbook.addWorksheet('Document Verification');

      // Set column widths for government proof sheet
      govProofSheet.columns = [
        { key: 'srno', width: 8 },
        { key: 'idtype', width: 20 },
        { key: 'doctype', width: 20 },
        { key: 'value', width: 28 },
        { key: 'status', width: 22 },
      ];

      // Add title for government proof sheet
      const govProofTitle = govProofSheet.addRow([
        'DOCUMENT VERIFICATION STATUS',
        '',
        '',
        '',
        '',
      ]);
      govProofTitle.font = {
        size: 16,
        bold: true,
        color: { argb: 'FF1F2937' },
      };
      govProofTitle.getCell(1).alignment = { horizontal: 'center' };
      govProofTitle.height = 25;
      govProofSheet.mergeCells('A1:E1');

      govProofSheet.addRow([]);

      // Add verification summary
      const totalDocs = candidateData.governmentProof.length;
      const verifiedDocs = candidateData.governmentProof.filter(
        (proof) => proof.verified,
      ).length;
      const verificationRate = ((verifiedDocs / totalDocs) * 100).toFixed(1);

      const govSummaryRow = govProofSheet.addRow([
        `Total Documents: ${totalDocs} | Verified: ${verifiedDocs} | Pending: ${totalDocs - verifiedDocs} | Verification Rate: ${verificationRate}%`,
        '',
        '',
        '',
        '',
      ]);
      govSummaryRow.getCell(1).alignment = { horizontal: 'center' };
      govSummaryRow.font = { bold: true, color: { argb: 'FF374151' } };
      govSummaryRow.height = 20;
      govProofSheet.mergeCells(
        `A${govSummaryRow.number}:E${govSummaryRow.number}`,
      );

      govProofSheet.addRow([]);

      // Add headers
      const govHeaders = govProofSheet.addRow([
        'Sr#',
        'ID Proof Type',
        'Document Type',
        'Document Value / Number',
        'Verification Status',
      ]);
      govHeaders.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' },
      };
      govHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      govHeaders.height = 22;

      // Add government proof data
      candidateData.governmentProof.forEach((proof, index) => {
        const isVerified = !!proof.verified;
        const idProofLabel = proof.idProofType || `Govt ID ${index + 1}`;
        const docTypeLabel = proof.type
          ? proof.type.charAt(0).toUpperCase() + proof.type.slice(1)
          : 'N/A';
        const status = isVerified ? '✅ Verified' : '❌ Not Verified';

        const row = govProofSheet.addRow([
          index + 1,
          idProofLabel,
          docTypeLabel,
          proof.value || 'N/A',
          status,
        ]);
        row.height = 20;

        // Color coding based on verification status
        const fillColor = isVerified ? 'FFD1FAE5' : 'FFFECACA';
        [4, 5].forEach((col) => {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
          };
        });
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
    const behavioralTitle = behavioralSheet.addRow([
      'BEHAVIORAL ANALYSIS',
      '',
      '',
    ]);
    behavioralTitle.font = {
      size: 16,
      bold: true,
      color: { argb: 'FF1F2937' },
    };
    behavioralTitle.getCell(1).alignment = { horizontal: 'center' };
    behavioralTitle.height = 25;
    behavioralSheet.mergeCells('A1:C1');

    behavioralSheet.addRow([]);

    // Add headers
    const headers = behavioralSheet.addRow([
      'Behavioral Aspect',
      'Score (%)',
      'Performance Level',
    ]);
    headers.font = { bold: true };
    headers.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    headers.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headers.height = 22;

    // Add behavioral data
    if (candidateData.behavioral_analysis) {
      const behavioralData = [
        ['Eye Contact', candidateData.behavioral_analysis.eye_contact],
        ['Posture', candidateData.behavioral_analysis.posture],
        ['Gestures', candidateData.behavioral_analysis.gestures],
        [
          'Facial Expressions',
          candidateData.behavioral_analysis.facial_expressions,
        ],
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
    // if (comparisonData && comparisonData.totalCandidates > 0) {
    //   const comparisonSheet = workbook.addWorksheet('Performance Comparison');

    //   comparisonSheet.columns = [
    //     { key: 'skill', width: 25 },
    //     { key: 'candidateScore', width: 18 },
    //     { key: 'averageScore', width: 18 },
    //     { key: 'difference', width: 15 },
    //     { key: 'ranking', width: 20 },
    //   ];

    //   // Add title
    //   const comparisonTitle = comparisonSheet.addRow([
    //     'PERFORMANCE COMPARISON',
    //     '',
    //     '',
    //     '',
    //     '',
    //   ]);
    //   comparisonTitle.font = {
    //     size: 16,
    //     bold: true,
    //     color: { argb: 'FF1F2937' },
    //   };
    //   comparisonTitle.getCell(1).alignment = { horizontal: 'center' };
    //   comparisonTitle.height = 25;
    //   comparisonSheet.mergeCells('A1:E1');

    //   comparisonSheet.addRow([]);

    //   // Add info row
    //   const infoRow = comparisonSheet.addRow([
    //     `Compared with ${comparisonData.totalCandidates} other candidates`,
    //     '',
    //     '',
    //     '',
    //     '',
    //   ]);
    //   infoRow.getCell(1).alignment = { horizontal: 'center' };
    //   infoRow.height = 20;
    //   comparisonSheet.mergeCells(`A${infoRow.number}:E${infoRow.number}`);

    //   comparisonSheet.addRow([]);

    //   // Add headers
    //   const compHeaders = comparisonSheet.addRow([
    //     'Skill',
    //     'Your Score',
    //     'Average Score',
    //     'Difference',
    //     'Performance',
    //   ]);
    //   compHeaders.font = { bold: true };
    //   compHeaders.fill = {
    //     type: 'pattern',
    //     pattern: 'solid',
    //     fgColor: { argb: 'FF059669' },
    //   };
    //   compHeaders.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    //   compHeaders.height = 22;

    //   // Add comparison data
    //   if (candidateData.performanceBreakdown) {
    //     Object.entries(candidateData.performanceBreakdown).forEach(
    //       ([skill, data]: [string, any]) => {
    //         if (!['culturalFit', 'behavior', 'body_language'].includes(skill)) {
    //           const candidateScore = data?.overallAveragePercentage || 0;
    //           const averageScore = comparisonData.averageScores?.[skill] || 0;
    //           const difference = candidateScore - averageScore;

    //           let performance = 'At Average';
    //           if (difference > 0) performance = 'Above Average';
    //           else if (difference < 0) performance = 'Below Average';

    //           const row = comparisonSheet.addRow([
    //             camelToLabel(skill),
    //             `${candidateScore}%`,
    //             `${averageScore}%`,
    //             `${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`,
    //             performance,
    //           ]);
    //           row.height = 18;

    //           // Color coding
    //           if (difference > 0) {
    //             row.getCell(5).fill = {
    //               type: 'pattern',
    //               pattern: 'solid',
    //               fgColor: { argb: 'FFD1FAE5' },
    //             };
    //           } else if (difference < 0) {
    //             row.getCell(5).fill = {
    //               type: 'pattern',
    //               pattern: 'solid',
    //               fgColor: { argb: 'FFFECACA' },
    //             };
    //           }
    //         }
    //       },
    //     );
    //   }
    // }

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
