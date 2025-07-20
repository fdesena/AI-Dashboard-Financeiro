
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToExcel = async (sheetsData: { sheetName: string; data: any[] }[], fileName: string) => {
  const workbook = xlsx.utils.book_new();
  sheetsData.forEach(({ sheetName, data }) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  xlsx.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPdf = async (element: HTMLElement, fileName:string) => {
    if (!element) {
        console.error("Elemento para exportação para PDF não encontrado.");
        return;
    }

    const elementsToHide = element.querySelectorAll('.no-print');
    elementsToHide.forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
    });
    
    const canvas = await html2canvas(element, {
      scale: 2, // Aumenta a resolução para melhor qualidade
      useCORS: true,
      backgroundColor: '#111827', // Cor de fundo bg-gray-900
      logging: false,
    });

    elementsToHide.forEach(el => {
        (el as HTMLElement).style.visibility = 'visible';
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calcula as dimensões do PDF para manter a proporção da imagem
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
};