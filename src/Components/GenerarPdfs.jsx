import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generarPDF = (proyecto, hitos = []) => {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Informe del Proyecto Escolar', 14, 20);

  doc.setFontSize(12);
  const addText = (label, value, y) =>
    doc.text(`${label}: ${value || 'Sin especificar'}`, 14, y);

  let y = 30;
  addText('Nombre', proyecto.nombreProyecto, y); y += 8;
  addText('Área', proyecto.areaConocimiento, y); y += 8;
  addText('Institución', proyecto.institucion, y); y += 8;
  addText('Presupuesto', proyecto.presupuesto, y); y += 8;
  addText('Fecha de Inicio', proyecto.fechaInicio, y); y += 8;
  addText('Estado', proyecto.estado, y); y += 10;

  if (proyecto.descripcion) {
    doc.text('Descripción:', 14, y);
    const descLines = doc.splitTextToSize(proyecto.descripcion, 170);
    doc.text(descLines, 20, y + 6);
    y += descLines.length * 6 + 10;
  }

  if (proyecto.objetivos) {
    doc.text('Objetivos:', 14, y);
    const objLines = doc.splitTextToSize(proyecto.objetivos, 170);
    doc.text(objLines, 20, y + 6);
    y += objLines.length * 6 + 10;
  }

  if (proyecto.observaciones) {
    doc.text('Observaciones:', 14, y);
    const obsLines = doc.splitTextToSize(proyecto.observaciones, 170);
    doc.text(obsLines, 20, y + 6);
    y += obsLines.length * 6 + 10;
  }

  if (proyecto.cronogramaURL) {
    doc.setTextColor(0, 0, 255);
    doc.textWithLink('Ver cronograma', 14, y, { url: proyecto.cronogramaURL });
    doc.setTextColor(0);
    y += 10;
  }

  if (proyecto.integrantes?.length > 0) {
    doc.text('Integrantes del equipo:', 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Nombre', 'Apellido', 'ID', 'Grado']],
      body: proyecto.integrantes.map(i => [i.nombre, i.apellido, i.id, i.grado]),
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: 20, halign: 'left' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (hitos.length > 0) {
    doc.text('Hitos del proyecto:', 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Descripción']],
      body: hitos.map(h => [h.fecha, h.descripcion]),
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: 20, halign: 'left' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
  }

  doc.save(`proyecto-${proyecto.nombreProyecto}.pdf`);
};

const generarPDFGeneral = (proyectos) => {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Reporte General de Proyectos', 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Nombre', 'Área', 'Institución', 'Estado', 'Fecha de Inicio']],
    body: proyectos.map(p => [
      p.nombreProyecto,
      p.areaConocimiento,
      p.institucion,
      p.estado,
      p.fechaInicio
    ]),
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { textColor: 20, halign: 'left' },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save('reporte_general_proyectos.pdf');
};

export { generarPDF, generarPDFGeneral };
