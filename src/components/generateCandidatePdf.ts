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
    }
  );
  const data = await response.json();
  return data.base64;
};

export const generateCandidatePdf = async (candidateData: Candidate): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');

  let y = 20;

  /* ================= HEADER ================= */
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(candidateData?.name || 'Candidate Profile', 20, y);
  y += 10;

  y += 8;

  if (candidateData?.designation) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(candidateData.designation, 20, y);
    y += 6;
  }

  doc.line(20, y, 190, y);
  y += 8;

  /* ================= BASIC DETAILS ================= */
  doc.setFontSize(11);

  const leftX = 20;
  const rightX = 110;

  doc.text(`Email: ${candidateData?.email || '-'}`, leftX, y);
  doc.text(`Phone: ${candidateData?.mobile || candidateData?.phone || '-'}`, rightX, y);

  y += 6;

  doc.text(`Location: ${candidateData?.location || '-'}`, leftX, y);
  doc.text(
    `Status: ${
      candidateData?.status
        ? candidateData.status.charAt(0).toUpperCase() + candidateData.status.slice(1)
        : '-'
    }`,
    rightX,
    y
  );

  y += 10;

  /* ================= SCORES ================= */
  if (candidateData?.status === 'completed' || candidateData?.status === 'under_review') {
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Summary', 20, y);
    y += 6;

    doc.setFont('helvetica', 'normal');

    doc.text(
      `Overall Score: ${candidateData?.categoryPercentage?.overallPercentage ?? 0}%`,
      leftX,
      y
    );
    doc.text(`Duration: ${candidateData?.duration ?? 0} min`, rightX, y);

    y += 6;

    doc.text(`Questions Answered: ${candidateData?.attemptedQuestions ?? 0}`, leftX, y);

    y += 10;
  }

  /* ================= INTERVIEW DATES ================= */
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Details', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');

  if (candidateData?.appliedDate) {
    doc.text(`Applied: ${moment(candidateData.appliedDate).format('DD-MM-YYYY')}`, leftX, y);
    y += 5;
  }

  if (candidateData?.interviewDate) {
    doc.text(`Interviewed: ${moment(candidateData.interviewDate).format('DD-MM-YYYY')}`, leftX, y);
    y += 8;
  }

  /* ================= EDUCATION ================= */
  doc.setFont('helvetica', 'bold');
  doc.text('Education', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');

  if (candidateData?.highestQualification) {
    doc.text(`Highest Qualification: ${candidateData.highestQualification}`, leftX, y);
    y += 6;
  }
  console.log(candidateData?.educations, 'educations');
  if (candidateData?.educations?.length && candidateData.educations.length > 0) {
    candidateData.educations.forEach((edu, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${edu.type}`, leftX, y);
      y += 5;

      doc.setFont('helvetica', 'normal');

      if (edu.stream) {
        doc.text(`Stream: ${edu.stream}`, leftX + 4, y);
        y += 4;
      }

      if (edu.yearOfPassing) {
        doc.text(`Year: ${edu.yearOfPassing}`, leftX + 4, y);
        y += 4;
      }

      if (edu.percentage) {
        doc.text(`Score: ${edu.percentage}`, leftX + 4, y);
        y += 5;
      }

      y += 2;
    });
  } else {
    doc.text('No education details available', leftX, y);
  }

  /* ================= PHOTO (OPTIONAL) ================= */
  const imageX = 160;
  const imageY = 5;
  const imageSize = 30;
  if (candidateData?.photoUrl) {
    try {
      const base64 = await getImageBase64(candidateData.photoUrl);

      doc.addImage(base64, 'JPEG', imageX, imageY, imageSize, imageSize);
    } catch {
      // silently ignore image error
    }
  }

  return doc;
};
