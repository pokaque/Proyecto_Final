import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generarPDF = (proyecto, hitos = []) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Informe del Proyecto Escolar', 14, 20);

  doc.setFontSize(12);
  doc.text(`Nombre: ${proyecto.nombreProyecto}`, 14, 30);
  doc.text(`Área: ${proyecto.areaConocimiento}`, 14, 38);
  doc.text(`Institución: ${proyecto.institucion}`, 14, 46);
  doc.text(`Presupuesto: ${proyecto.presupuesto}`, 14, 54);
  doc.text(`Fecha de Inicio: ${proyecto.fechaInicio}`, 14, 62);
  doc.text(`Estado: ${proyecto.estado}`, 14, 70);

  doc.text('Objetivos:', 14, 78);
  doc.text(proyecto.objetivos || '', 20, 86, { maxWidth: 170 });

  let nextY = 110;

  if (proyecto.integrantes?.length > 0) {
    doc.text('Integrantes del equipo:', 14, nextY);
    nextY += 6;
    autoTable(doc, {
      startY: nextY,
      head: [['Nombre', 'Apellido', 'ID', 'Grado']],
      body: proyecto.integrantes.map(i => [i.nombre, i.apellido, i.id, i.grado]),
    });
    nextY = doc.lastAutoTable.finalY + 10;
  }

  if (hitos.length > 0) {
    doc.text('Hitos del proyecto:', 14, nextY);
    nextY += 6;
    autoTable(doc, {
      startY: nextY,
      head: [['Fecha', 'Descripción']],
      body: hitos.map(h => [h.fecha, h.descripcion]),
    });
  }

  doc.save(`proyecto-${proyecto.nombreProyecto}.pdf`);
};


const generarPDFGeneral = (proyectos) => {
  const doc = new jsPDF();
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
    ])
  });
  doc.save('reporte_general_proyectos.pdf');
};

export { generarPDF, generarPDFGeneral };
