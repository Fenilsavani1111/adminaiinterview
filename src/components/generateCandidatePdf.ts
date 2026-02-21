import jsPDF from 'jspdf';
import { Candidate } from '../types';
import moment from 'moment';

const getImageBase64 = async (imageUrl: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_AIINTERVIEW_API_KEY}/image-base64?url=${imageUrl}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  const data = await response.json();
  return data.base64;
};

const getImageType = (base64: string): 'PNG' | 'JPEG' => {
  const b = (base64 || '').toLowerCase();
  if (b.startsWith('data:image/png')) return 'PNG';
  return 'JPEG';
};

/* ================= HELPERS ================= */
const drawCard = (doc: jsPDF, x: number, y: number, w: number, h: number) => {
  doc.setDrawColor(220);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');
};

const drawProgressBar = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  percent: number,
) => {
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  if (percent >= 90) doc.setFillColor(34, 197, 94);
  else if (percent >= 80) doc.setFillColor(59, 130, 246);
  else if (percent >= 70) doc.setFillColor(234, 179, 8);
  else doc.setFillColor(239, 68, 68);

  doc.roundedRect(x, y, (w * percent) / 100, h, 2, 2, 'F');
};

const camelToLabel = (camel: string) => {
  return camel
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export const generateCandidatePdf = async (
  candidateData: Candidate,
  comparisonData: any,
): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');

  /* ================= CONSTANTS ================= */
  const pageWidth = 210;
  const marginX = 20;
  let y = 30;

  /* ================= PHOTO (LEFT) ================= */
  const photoSize = 28;
  const photoX = marginX;
  const photoY = 10;

  /* ================= COMPANY LOGO (RIGHT) ================= */
  const logoWidth = 40;
  const logoHeight = 14;
  const logoX = pageWidth - marginX - logoWidth;
  const logoY = y - 14;

  /* ================= PROFILE PHOTO ================= */
  if (candidateData?.photoUrl) {
    try {
      const base64 = await getImageBase64(candidateData.photoUrl);
      doc.addImage(
        base64,
        getImageType(base64),
        photoX,
        photoY,
        photoSize,
        photoSize,
      );
    } catch {}
  }

  /* ================= COMPANY LOGO ================= */
  const jobLogoUrl = candidateData?.JobPost?.logoUrl;
  if (jobLogoUrl) {
    try {
      const base64 = await getImageBase64(jobLogoUrl);
      doc.addImage(
        base64,
        getImageType(base64),
        logoX,
        logoY,
        logoWidth,
        logoHeight,
      );
    } catch {}
  }

  /* ================= NAME ================= */
  const textX = photoX + photoSize + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(
    camelToLabel(candidateData?.name) || 'Candidate Profile',
    textX,
    y - 7,
  );

  /* ================= JOB TITLE ================= */
  const jobTitle = candidateData?.JobPost?.jobTitle;
  if (jobTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text(camelToLabel(jobTitle), textX, y);
  }

  /* ================= DIVIDER ================= */
  doc.setDrawColor(200);
  doc.line(marginX, y + 16, pageWidth - marginX, y + 16);

  /* ================= RESET ================= */
  doc.setTextColor(0);
  y += 26;

  /* ================= BASIC DETAILS ================= */
  const leftX = 20;
  const rightX = 110;

  doc.setFontSize(11);
  doc.text(`Email: ${candidateData?.email || '-'}`, leftX, y);
  doc.text(
    `Phone: ${candidateData?.mobile || candidateData?.phone || '-'}`,
    rightX,
    y,
  );
  y += 6;

  doc.text(`Location: ${candidateData?.location || '-'}`, leftX, y);
  doc.text(
    `Status: ${
      candidateData?.status
        ? camelToLabel(candidateData?.status?.replace('_', ' '))
        : '-'
    }`,
    rightX,
    y,
  );
  y += 10;

  /* ================= INTERVIEW SUMMARY ================= */
  if (
    candidateData?.status === 'completed' ||
    candidateData?.status === 'under_review'
  ) {
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Summary', 20, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(
      `Overall Score: ${candidateData?.categoryPercentage?.overallPercentage ?? 0}%`,
      leftX,
      y,
    );
    doc.text(`Duration: ${candidateData?.duration ?? 0} min`, rightX, y);
    y += 6;

    doc.text(
      `Questions Answered: ${candidateData?.attemptedQuestions ?? 0}`,
      leftX,
      y,
    );
    y += 10;
  }

  /* ================= INTERVIEW DATES ================= */
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Details', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  if (candidateData?.appliedDate) {
    doc.text(
      `Applied: ${moment(candidateData.appliedDate).format('DD-MM-YYYY')}`,
      leftX,
      y,
    );
    y += 5;
  }
  if (candidateData?.interviewDate) {
    doc.text(
      `Interviewed: ${moment(candidateData.interviewDate).format('DD-MM-YYYY')}`,
      leftX,
      y,
    );
    y += 8;
  }

  /* ================= EDUCATION ================= */
  doc.setFont('helvetica', 'bold');
  doc.text('Education', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  if (candidateData?.highestQualification) {
    doc.text(
      `Highest Qualification: ${candidateData.highestQualification}`,
      leftX,
      y,
    );
    y += 6;
  }

  if (candidateData?.educations?.length) {
    candidateData.educations.forEach((edu, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${edu.type}`, leftX, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      if (edu.stream)
        (doc.text(`Stream: ${edu.stream}`, leftX + 4, y), (y += 4));
      if (edu.yearOfPassing)
        (doc.text(`Year: ${edu.yearOfPassing}`, leftX + 4, y), (y += 4));
      if (edu.percentage)
        (doc.text(`Score: ${edu.percentage}`, leftX + 4, y), (y += 5));
      y += 2;
    });
  } else {
    doc.text('No education details available', leftX, y);
    y += 8;
  }

  /* ================= OVERVIEW SECTION (NEW) ================= */
  if (y > 180) {
    doc.addPage();
    y = 20;
  }

  const colLeft = 20;
  const colRight = 115;

  /* Performance Breakdown */
  drawCard(doc, colLeft, y, 85, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Breakdown', colLeft + 4, y + 8);

  const perfItems = [
    {
      label: 'Communication',
      score:
        candidateData?.performanceBreakdown?.communicationSkills
          ?.overallAveragePercentage ?? 0,
    },
    {
      label: 'Technical',
      score:
        candidateData?.performanceBreakdown?.technicalKnowledge
          ?.overallAveragePercentage ?? 0,
    },
    {
      label: 'Body Language',
      score:
        candidateData?.performanceBreakdown?.body_language
          ?.overallAveragePercentage ?? 0,
    },
    {
      label: 'Confidence',
      score:
        candidateData?.performanceBreakdown?.confidenceLevel
          ?.overallAveragePercentage ?? 0,
    },
    {
      label: 'Attire',
      score:
        candidateData?.performanceBreakdown?.culturalFit
          ?.overallAveragePercentage ?? 0,
    },
  ];

  let py = y + 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  perfItems.forEach((p) => {
    doc.text(`${p.label}`, colLeft + 4, py);
    doc.text(`${p.score}%`, colLeft + 78, py, { align: 'right' });
    drawProgressBar(doc, colLeft + 4, py + 2, 77, 3, p.score);
    py += 14;
  });

  /* AI Summary */
  drawCard(doc, colLeft, y + 90, 85, 45);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Evaluation Summary', colLeft + 4, y + 98);
  doc.setFont('helvetica', 'normal');
  doc.text(
    candidateData?.aiEvaluationSummary?.summary || '-',
    colLeft + 4,
    y + 106,
    {
      maxWidth: 77,
    },
  );

  /* Quick Stats */
  drawCard(doc, colRight, y, 75, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('Quick Stats', colRight + 4, y + 8);
  doc.setFont('helvetica', 'normal');

  let sy = y + 16;
  Object.entries(candidateData?.quickStats ?? {}).forEach(([k, v]) => {
    doc.text(k.replace(/([A-Z])/g, ' $1'), colRight + 4, sy);
    doc.text(String(v), colRight + 70, sy, { align: 'right' });
    sy += 6;
  });

  /* Recommendation */
  drawCard(doc, colRight, y + 60, 75, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendation', colRight + 4, y + 68);
  doc.setFontSize(11);
  doc.text(
    candidateData?.recommendations?.recommendation || '-',
    colRight + 37,
    y + 90,
    {
      align: 'center',
    },
  );

  // await renderScreenshotSection(doc, candidateData);

  y = renderSkillAssessmentSection(doc, candidateData, comparisonData);

  y = renderBehavioralSection(doc, candidateData?.behavioral_analysis);

  y = renderProctoringSection(doc, candidateData);

  return doc;
};

/* ================= SCREENSHOT / IDENTITY VERIFICATION PAGE ================= */
const renderScreenshotSection = async (doc: jsPDF, candidateData: any) => {
  doc.addPage();
  const pageWidth = 210;
  const marginX = 20;
  let y = 20;

  /* --- Title --- */
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Screenshot / Identity Verification', marginX, y);
  y += 4;

  doc.setDrawColor(200);
  doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "The images below were captured during the candidate's assessment session for identity verification purposes.",
    marginX,
    y,
    { maxWidth: pageWidth - marginX * 2 },
  );
  y += 12;

  /* --- Helper: draw one image tile --- */
  const drawImageTile = async (
    label: string,
    imageUrl: string | undefined | null,
    tileX: number,
    tileY: number,
    tileW: number,
    tileH: number,
  ) => {
    const imgArea = {
      x: tileX + 4,
      y: tileY + 14,
      w: tileW - 8,
      h: tileH - 22,
    };

    // Card border
    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(tileX, tileY, tileW, tileH, 3, 3, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(label, tileX + 4, tileY + 9);

    if (imageUrl) {
      try {
        const base64 = await getImageBase64(imageUrl);
        const imgType: 'PNG' | 'JPEG' = (base64 || '')
          .toLowerCase()
          .startsWith('data:image/png')
          ? 'PNG'
          : 'JPEG';
        doc.addImage(
          base64,
          imgType,
          imgArea.x,
          imgArea.y,
          imgArea.w,
          imgArea.h,
        );
      } catch {
        // Placeholder if image fails
        doc.setFillColor(229, 231, 235);
        doc.rect(imgArea.x, imgArea.y, imgArea.w, imgArea.h, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Image unavailable', tileX + tileW / 2, tileY + tileH / 2, {
          align: 'center',
        });
      }
    } else {
      // No URL placeholder
      doc.setFillColor(243, 244, 246);
      doc.rect(imgArea.x, imgArea.y, imgArea.w, imgArea.h, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Not provided', tileX + tileW / 2, tileY + tileH / 2, {
        align: 'center',
      });
    }

    doc.setTextColor(0);
  };

  /* --- Layout constants --- */
  const colCount = 2;
  const tileW = (pageWidth - marginX * 2 - 6) / colCount; // 6 = gap between cols
  const tileH = 65;
  const gapX = 6;
  const gapY = 8;

  // Build the list of images to show
  type ImageEntry = { label: string; url: string | null | undefined };
  const images: ImageEntry[] = [];

  // 1. Live photo (captured during assessment)
  if (candidateData?.photoUrl) {
    images.push({
      label: 'Live Capture (Assessment)',
      url: candidateData.photoUrl,
    });
  }

  // 2. Government proof images
  if (Array.isArray(candidateData?.governmentProof)) {
    candidateData.governmentProof.forEach((proof: any, idx: number) => {
      const url =
        proof?.url || proof?.imageUrl || proof?.fileUrl || proof?.value || null;
      const docType =
        proof?.type || proof?.documentType || `Government ID ${idx + 1}`;
      const verified = proof?.verified;
      const verifiedLabel =
        verified === true ? ' ✓' : verified === false ? ' ✗' : '';
      images.push({ label: `${docType}${verifiedLabel}`, url });
    });
  }

  // If nothing to show
  if (images.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'No identity screenshots available for this candidate.',
      marginX,
      y,
    );
    return;
  }

  // Render in a 2-column grid
  for (let i = 0; i < images.length; i++) {
    const col = i % colCount;
    const row = Math.floor(i / colCount);

    const tileX = marginX + col * (tileW + gapX);
    const tileY = y + row * (tileH + gapY);

    // Page overflow guard
    if (tileY + tileH > 280) {
      doc.addPage();
      y = 20;
      // Reset y and recalculate this tile on the new page
      const newTileY = y + (row - Math.floor(i / colCount)) * (tileH + gapY);
      await drawImageTile(
        images[i].label,
        images[i].url,
        tileX,
        newTileY,
        tileW,
        tileH,
      );
    } else {
      await drawImageTile(
        images[i].label,
        images[i].url,
        tileX,
        tileY,
        tileW,
        tileH,
      );
    }
  }

  /* --- Footer note --- */
  const totalRows = Math.ceil(images.length / colCount);
  const lastTileBottom = y + totalRows * (tileH + gapY);
  const noteY = Math.min(lastTileBottom + 6, 285);

  if (noteY < 287) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      'Note: Images are captured automatically during the assessment for verification purposes only.',
      marginX,
      noteY,
      { maxWidth: pageWidth - marginX * 2 },
    );
  }

  doc.setTextColor(0);
};

const renderSkillAssessmentSection = (
  doc: jsPDF,
  candidateData: any,
  comparisonData: any,
) => {
  // add new page
  doc.addPage();
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Skill Assessment', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  Object.entries(candidateData?.performanceBreakdown || {}).forEach(
    ([skill, data]: any) => {
      if (['culturalFit', 'behavior', 'body_language'].includes(skill)) return;

      const score = data?.overallAveragePercentage ?? 0;

      doc.text(`${camelToLabel(skill)}: ${score}%`, 20, y);
      y += 2;

      // Progress bar background
      doc.setFillColor(220, 220, 220);
      doc.rect(20, y, 170, 3, 'F');

      // Progress bar value
      doc.setFillColor(
        score >= 90 ? 34 : score >= 80 ? 59 : score >= 70 ? 234 : 220,
        score >= 90 ? 197 : score >= 80 ? 130 : score >= 70 ? 179 : 38,
        score >= 90 ? 94 : score >= 80 ? 246 : score >= 70 ? 8 : 38,
      );
      doc.rect(20, y, (170 * score) / 100, 3, 'F');

      y += 8;

      if (data?.summary) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(doc.splitTextToSize(data.summary, 170), 20, y);
        y += 8;
      }

      doc.setTextColor(0);
      doc.setFontSize(10);
    },
  );

  y = renderSkillComparisonSection(doc, candidateData, comparisonData, y + 10);

  return y;
};

const renderSkillComparisonSection = (
  doc: jsPDF,
  candidateData: any,
  comparisonData: any,
  startY: number,
) => {
  let y = startY;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Skill Comparison', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const totalCandidates = comparisonData?.totalCandidates || 0;

  doc.text(
    totalCandidates > 0
      ? `Comparison based on ${totalCandidates} completed interviews`
      : 'No completed interviews available for comparison',
    20,
    y,
  );
  y += 8;

  Object.entries(candidateData?.performanceBreakdown || {}).forEach(
    ([skill, data]: any) => {
      if (['culturalFit', 'behavior', 'body_language'].includes(skill)) return;

      const candidateScore = data?.overallAveragePercentage || 0;
      const averageScore = comparisonData?.averageScores?.[skill] || 0;
      const difference = candidateScore - averageScore;

      doc.setFont('helvetica', 'bold');
      doc.text(`${camelToLabel(skill)}: ${candidateScore}%`, 20, y);

      doc.setFont('helvetica', 'normal');
      doc.text(`Average: ${averageScore}%`, 150, y);
      y += 2;

      // Background bar
      doc.setFillColor(220, 220, 220);
      doc.rect(20, y, 170, 3, 'F');

      // Average marker
      const avgX = 20 + (170 * averageScore) / 100;
      doc.setDrawColor(120);
      doc.line(avgX, y - 1, avgX, y + 4);

      // Candidate bar
      doc.setFillColor(
        candidateScore > averageScore
          ? 34
          : candidateScore === averageScore
            ? 234
            : 220,
        candidateScore > averageScore
          ? 197
          : candidateScore === averageScore
            ? 179
            : 38,
        candidateScore > averageScore
          ? 94
          : candidateScore === averageScore
            ? 8
            : 38,
      );
      doc.rect(20, y, (170 * Math.min(candidateScore, 100)) / 100, 3, 'F');

      y += 8;

      if (totalCandidates > 0) {
        doc.setFontSize(9);
        doc.setTextColor(90);

        const message =
          candidateScore > averageScore
            ? `Scored ${difference.toFixed(1)}% higher than average`
            : candidateScore === averageScore
              ? 'Score is equal to the average'
              : `Scored ${Math.abs(difference).toFixed(1)}% below average`;

        doc.text(message, 20, y);
        y += 7;

        doc.setTextColor(0);
        doc.setFontSize(10);
      }
    },
  );

  return y;
};

const renderBehavioralSection = (doc: jsPDF, behavioralData: any) => {
  // add new page
  doc.addPage();
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Behavioral Analysis', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  Object.entries(behavioralData || {}).forEach(([key, value]: any) => {
    doc.text(`${camelToLabel(key)}: ${value}%`, 20, y);
    y += 2;

    doc.setFillColor(220, 220, 220);
    doc.rect(20, y, 170, 3, 'F');

    doc.setFillColor(79, 70, 229); // indigo
    doc.rect(20, y, (170 * value) / 100, 3, 'F');

    y += 10;
  });

  return y;
};

const renderProctoringSection = (doc: jsPDF, candidateData: any) => {
  // Always start proctoring on a new page
  doc.addPage();
  let y = 20;

  /* ================= TITLE ================= */
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Proctoring Summary', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  /* ================= OVERVIEW ================= */
  const alerts = candidateData?.proctoringAlerts || [];

  const infoCount = alerts.filter(
    (a: any) => (a.severity || 'info') === 'info',
  ).length;
  const warningCount = alerts.filter(
    (a: any) => (a.severity || 'info') === 'warning',
  ).length;
  const criticalCount = alerts.filter(
    (a: any) => (a.severity || 'info') === 'critical',
  ).length;

  doc.text(`Status: ${candidateData?.proctoringStatus || 'N/A'}`, 20, y);
  y += 6;

  doc.text(`Total Alerts: ${alerts.length}`, 20, y);
  y += 5;

  doc.text(`Info Alerts: ${infoCount}`, 20, y);
  y += 5;

  doc.text(`Warning Alerts: ${warningCount}`, 20, y);
  y += 5;

  doc.text(`Critical Alerts: ${criticalCount}`, 20, y);
  y += 10;

  /* ================= NO ALERT CASE ================= */
  if (alerts.length === 0) {
    doc.text(
      'No proctoring alerts were detected. The candidate maintained proper conduct throughout the interview.',
      20,
      y,
    );
    y += 6;
    return y;
  }

  /* ================= DETAILED ALERTS ================= */
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Proctoring Alerts', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');

  alerts.slice(0, 30).forEach((alert: any, index: number) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const type = alert?.type || 'unknown';
    const severity = alert?.severity || 'info';
    const message =
      alert?.message ||
      (typeof alert === 'string' ? alert : JSON.stringify(alert));
    const time = alert?.timestamp
      ? new Date(alert.timestamp).toLocaleString()
      : 'N/A';

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${type.toUpperCase()}`, 20, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(`Severity: ${severity}`, 24, y);
    y += 4;

    const messageLines = doc.splitTextToSize(`Message: ${message}`, 160);
    doc.text(messageLines, 24, y);
    y += messageLines.length * 4;

    doc.text(`Time: ${time}`, 24, y);
    y += 6;
  });

  /* ================= REVIEW NOTE ================= */
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'italic');
  doc.text(
    'Note: Proctoring alerts are generated automatically. Final evaluation decisions should be made after reviewing video recordings and overall candidate performance.',
    20,
    y,
    {
      maxWidth: 170,
    },
  );

  return y;
};
