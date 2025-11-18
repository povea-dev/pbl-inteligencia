import jsPDF from 'jspdf';
import { Conversation, Message } from '../types';
import { format } from 'date-fns';

/**
 * Servicio para exportar conversaciones a PDF o texto
 */
export const exportService = {
  /**
   * Exporta una conversación completa a PDF
   */
  async exportToPDF(
    conversation: Conversation,
    messages: Message[],
    courseTitle?: string
  ): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Función para agregar nueva página si es necesario
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(conversation.title, maxWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 7 + 5;

    // Información del curso
    if (courseTitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Curso: ${courseTitle}`, margin, yPosition);
      yPosition += 5;
    }

    // Fecha de creación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const createdAt = format(conversation.createdAt, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm");
    doc.text(`Creada: ${createdAt}`, margin, yPosition);
    yPosition += 5;

    // Número de mensajes
    doc.text(`Total de mensajes: ${messages.length}`, margin, yPosition);
    yPosition += 10;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Mensajes
    doc.setTextColor(0, 0, 0);
    messages.forEach((message, index) => {
      checkNewPage(30);

      // Rol del mensaje
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      let role: string;
      if (message.role === 'assistant') {
        role = 'Asistente IA';
      } else {
        // Si es 'user', verificar el rol del usuario en la conversación
        role = conversation.userRole === 'teacher' ? 'Docente' : 'Estudiante';
      }
      doc.text(role, margin, yPosition);
      yPosition += 7;

      // Fecha del mensaje
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const messageDate = format(message.timestamp, "dd/MM/yyyy HH:mm");
      doc.text(messageDate, margin, yPosition);
      yPosition += 5;

      // Contenido del mensaje (limpiar markdown básico)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Limpiar markdown básico
      let cleanContent = message.content
        .replace(/```[\s\S]*?```/g, '[Código]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '');

      const contentLines = doc.splitTextToSize(cleanContent, maxWidth);
      contentLines.forEach((line: string) => {
        checkNewPage(7);
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Separador entre mensajes (excepto el último)
      if (index < messages.length - 1) {
        checkNewPage(5);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${totalPages} - PBL Classroom`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Descargar
    const fileName = `conversacion_${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  },

  /**
   * Exporta una conversación completa a texto plano
   */
  exportToText(
    conversation: Conversation,
    messages: Message[],
    courseTitle?: string
  ): void {
    let text = '='.repeat(80) + '\n';
    text += conversation.title.toUpperCase() + '\n';
    text += '='.repeat(80) + '\n\n';

    if (courseTitle) {
      text += `Curso: ${courseTitle}\n`;
    }
    text += `Creada: ${format(conversation.createdAt, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm")}\n`;
    text += `Total de mensajes: ${messages.length}\n`;
    text += '\n' + '-'.repeat(80) + '\n\n';

    messages.forEach((message, index) => {
      let role: string;
      if (message.role === 'assistant') {
        role = 'ASISTENTE IA';
      } else {
        // Si es 'user', verificar el rol del usuario en la conversación
        role = conversation.userRole === 'teacher' ? 'DOCENTE' : 'ESTUDIANTE';
      }
      const messageDate = format(message.timestamp, "dd/MM/yyyy HH:mm");
      
      text += `[${role}] - ${messageDate}\n`;
      text += '-'.repeat(80) + '\n';
      
      // Limpiar markdown básico
      let cleanContent = message.content
        .replace(/```[\s\S]*?```/g, '[Código]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '');
      
      text += cleanContent + '\n\n';
      
      if (index < messages.length - 1) {
        text += '\n';
      }
    });

    text += '\n' + '='.repeat(80) + '\n';
    text += `Exportado desde PBL Classroom el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm")}\n`;

    // Crear blob y descargar
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `conversacion_${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

