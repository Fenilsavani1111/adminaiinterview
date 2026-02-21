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

      const eduTypeMap: Record<string, string> = {
        tenth: '10th Standard / SSC',
        twelfth: '12th Standard / HSC',
        plusTwo: '12th Standard / HSC',
        degree: "Bachelor's Degree",
        pg: 'Post Graduate Degree',
        master: "Master's Degree",
        phd: 'PhD / Doctorate',
      };
      const eduLabel = eduTypeMap[edu.type] || edu.type;

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${eduLabel}`, leftX, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      const institution = edu.schoolName || edu.collegeName;
      if (institution)
        (doc.text(`   Institute: ${institution}`, leftX + 4, y), (y += 4));
      if (edu.stream)
        (doc.text(`   Stream: ${edu.stream}`, leftX + 4, y), (y += 4));
      if (edu.yearOfPassing)
        (doc.text(`   Year: ${edu.yearOfPassing}`, leftX + 4, y), (y += 4));
      if (edu.percentage)
        (doc.text(`   Score: ${edu.percentage}`, leftX + 4, y), (y += 5));
      y += 2;
    });
  } else {
    doc.text('No education details available', leftX, y);
    y += 8;
  }

  /* ================= GOVERNMENT ID DOCUMENTS ================= */
  if (
    Array.isArray(candidateData?.governmentProof) &&
    candidateData.governmentProof.length > 0
  ) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Government ID Documents', leftX, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    candidateData.governmentProof.forEach((proof: any, index: number) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const isVerified = !!proof.verified;
      const idLabel = proof.idProofType || `Govt ID ${index + 1}`;
      const docType = proof.type
        ? proof.type.charAt(0).toUpperCase() + proof.type.slice(1)
        : 'N/A';
      const verifiedText = isVerified ? '✓ Verified' : '✗ Not Verified';

      // Document label
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${idLabel} — ${docType}`, leftX, y);
      y += 5;

      // Value
      doc.setFont('helvetica', 'normal');
      if (proof.value)
        (doc.text(`   Number: ${proof.value}`, leftX + 4, y), (y += 4));

      // Verified status with colour
      if (isVerified) {
        doc.setTextColor(22, 163, 74); // green-600
      } else {
        doc.setTextColor(220, 38, 38); // red-600
      }
      doc.text(`   ${verifiedText}`, leftX + 4, y);
      doc.setTextColor(0);
      y += 6;
    });
    y += 2;
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

  await renderScreenshotSection(doc, candidateData);

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
  doc.text('Identity Verification', marginX, y);
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
    extra?: { docNumber?: string; status?: string; isVerified?: boolean },
  ) => {
    // Card border
    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(tileX, tileY, tileW, tileH, 3, 3, 'FD');

    // Make space for extra text
    const headerH = extra?.docNumber ? 16 : 10;

    const imgArea = {
      x: tileX + 4,
      y: tileY + headerH + 4,
      w: tileW - 8,
      h: tileH - headerH - 8,
    };

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(label, tileX + 4, tileY + 9);

    if (extra?.docNumber) {
      // Document Number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`No: ${extra.docNumber}`, tileX + 4, tileY + 14);
    }

    if (extra?.status) {
      // Verification Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (extra.isVerified) {
        doc.setTextColor(22, 163, 74); // green
      } else {
        doc.setTextColor(220, 38, 38); // red
      }
      doc.text(
        extra.status,
        tileX + tileW - 4,
        tileY + (extra?.docNumber ? 14 : 9),
        { align: 'right' },
      );
    }

    // Reset color
    doc.setTextColor(0);
    if (imageUrl) {
      try {
        const base64 = await getImageBase64(imageUrl);
        doc.addImage(
          base64,
          getImageType(base64),
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
        doc.text(
          'Image unavailable',
          tileX + tileW / 2,
          tileY + tileH / 2 + 4,
          {
            align: 'center',
          },
        );
      }
    } else {
      // No URL placeholder
      doc.setFillColor(243, 244, 246);
      doc.rect(imgArea.x, imgArea.y, imgArea.w, imgArea.h, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Not provided', tileX + tileW / 2, tileY + tileH / 2 + 4, {
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
  type ImageEntry = {
    label: string;
    url: string | null | undefined;
    docNumber?: string;
    status?: string;
    isVerified?: boolean;
  };
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
      let url = proof?.image_url;
      null;
      if (
        !url &&
        typeof proof?.value === 'string' &&
        proof.value.startsWith('http')
      ) {
        url = proof.value;
      }

      const docType =
        proof?.type || proof?.documentType || `Government ID ${idx + 1}`;

      const verified = proof?.verified;
      let status = '';
      if (verified === true) status = 'Verified ✓';
      else if (verified === false) status = 'Unverified ✗';

      const docNumber =
        proof?.value && !proof.value.startsWith('http')
          ? proof.value
          : undefined;

      images.push({
        label: docType.charAt(0).toUpperCase() + docType.slice(1),
        url,
        docNumber,
        status,
        isVerified: verified === true,
      });
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
        images[i],
      );
    } else {
      await drawImageTile(
        images[i].label,
        images[i].url,
        tileX,
        tileY,
        tileW,
        tileH,
        images[i],
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
  doc.addPage();
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Skill Assessment', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const categoryScores = Object.keys(
    candidateData?.categoryPercentage?.categoryWiseScore || {},
  )
    .filter(
      (skill) => !['culturalFit', 'behavior', 'body_language'].includes(skill),
    )
    .map((skill) => {
      const data = candidateData?.categoryPercentage?.categoryWiseScore[skill];
      const scoreRatio =
        (data?.total ?? 0) > 0
          ? Math.round(((data?.score ?? 0) / (data?.total ?? 0)) * 100)
          : 0;
      let defaultSummary = '';
      if (scoreRatio >= 90) {
        defaultSummary = 'Excellent understanding and application of concepts.';
      } else if (scoreRatio >= 80) {
        defaultSummary =
          'Strong grasp of core principles with good proficiency.';
      } else if (scoreRatio >= 70) {
        defaultSummary =
          'Solid foundational knowledge, though some areas need refinement.';
      } else if (scoreRatio >= 50) {
        defaultSummary =
          'Basic knowledge demonstrated; further improvement recommended.';
      } else {
        defaultSummary =
          'Significant gaps identified; requires focused development.';
      }

      return {
        skill: skill?.replace(/_/g, ' '),
        scoreRatio,
        scoreText: `${data?.score} / ${data?.total} (${scoreRatio}%)`,
        summary: defaultSummary,
      };
    });

  const performanceKeys = [
    'confidenceLevel',
    'leadershipPotential',
    'culturalFit',
  ];
  const performanceScores = performanceKeys
    .map((skill) => {
      const data = candidateData?.performanceBreakdown?.[skill];
      if (!data) return null;
      return {
        skill: skill === 'culturalFit' ? 'professionalAttire' : skill,
        scoreRatio: data.overallAveragePercentage ?? 0,
        scoreText: `${data.overallAveragePercentage ?? 0}%`,
        summary: data.summary,
      };
    })
    .filter(Boolean as any);

  [...categoryScores, ...performanceScores].forEach(
    ({ skill, scoreRatio, scoreText, summary }: any) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(`${camelToLabel(skill)}: ${scoreText}`, 20, y);
      y += 2;

      // Progress bar background
      doc.setFillColor(220, 220, 220);
      doc.rect(20, y, 170, 3, 'F');

      // Progress bar value
      const score = scoreRatio;
      doc.setFillColor(
        score >= 90 ? 34 : score >= 80 ? 59 : score >= 70 ? 234 : 220,
        score >= 90 ? 197 : score >= 80 ? 130 : score >= 70 ? 179 : 38,
        score >= 90 ? 94 : score >= 80 ? 246 : score >= 70 ? 8 : 38,
      );
      doc.rect(20, y, (170 * score) / 100, 3, 'F');

      y += 8;

      if (summary) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        const splitText = doc.splitTextToSize(summary, 170);
        doc.text(splitText, 20, y);
        y += splitText.length * 4 + 4;
      } else {
        y += 4;
      }

      doc.setTextColor(0);
      doc.setFontSize(10);
    },
  );

  // y = renderSkillComparisonSection(doc, candidateData, comparisonData, y + 10);

  return y;
};

const renderSkillComparisonSection = (
  doc: jsPDF,
  candidateData: any,
  comparisonData: any,
  startY: number,
) => {
  let y = startY;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

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

  const categoryComparisons = Object.keys(
    candidateData?.categoryPercentage?.categoryWiseScore || {},
  )
    .filter(
      (skill) => !['culturalFit', 'behavior', 'body_language'].includes(skill),
    )
    .map((skill) => {
      const data = candidateData?.categoryPercentage?.categoryWiseScore[skill];
      return {
        skill,
        candidateScore: data?.percentage || 0,
        averageScore: comparisonData?.averageScores?.[skill] || 0,
      };
    });

  const performanceKeys = [
    'confidenceLevel',
    'leadershipPotential',
    'culturalFit',
  ];
  const performanceComparisons = performanceKeys
    .map((skill) => {
      const data = candidateData?.performanceBreakdown?.[skill];
      if (!data) return null;
      return {
        skill: skill === 'culturalFit' ? 'professionalAttire' : skill,
        candidateScore: data.overallAveragePercentage || 0,
        averageScore: comparisonData?.averageScores?.[skill] || 0,
      };
    })
    .filter(Boolean as any);

  [...categoryComparisons, ...performanceComparisons].forEach(
    ({ skill, candidateScore, averageScore }: any) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
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
    doc.text(`${camelToLabel(key?.replace(/_/g, ' '))}: ${value}%`, 20, y);
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
