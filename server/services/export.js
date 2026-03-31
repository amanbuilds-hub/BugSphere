import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import Bug from '../models/Bug.js';
import logger from '../utils/logger.js';

/**
 * Bug Data Export Service
 */
class ExportService {
    /**
     * Export bugs to PDF
     * @param {Array<Object>} bugIds - IDs of bugs to export
     * @returns {Promise<string>} - Path to the generated PDF
     */
    async toPDF(bugIds) {
        const bugs = await Bug.find({ _id: { $in: bugIds } }).populate('reportedBy projectId assignedTo');
        const doc = new PDFDocument();
        const filePath = path.join(process.cwd(), 'uploads', `bugs_report_${Date.now()}.pdf`);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(20).text('Bug Tracker - Report', { align: 'center' });
        doc.moveDown();

        bugs.forEach(bug => {
            doc.fontSize(14).text(`Bug: ${bug.title}`, { underline: true });
            doc.fontSize(10).text(`ID: ${bug._id}`);
            doc.text(`Project: ${bug.projectId?.name || 'N/A'}`);
            doc.text(`Status: ${bug.status} | Severity: ${bug.severity} | Priority: ${bug.priority}`);
            doc.text(`Reporter: ${bug.reportedBy?.name} | Assignee: ${bug.assignedTo?.name || 'Unassigned'}`);
            doc.moveDown(0.5);
            doc.fontSize(10).text(`Description: ${bug.description}`);
            doc.moveDown();
            doc.rect(doc.x, doc.y, 500, 1).fill('#ccc');
            doc.moveDown();
        });

        doc.end();
        return new Promise((resolve) => {
            stream.on('finish', () => resolve(filePath));
        });
    }

    /**
     * Export bugs to CSV
     * @param {Array<Object>} bugIds - IDs of bugs to export
     * @returns {Promise<string>} - Path to the generated CSV
     */
    async toCSV(bugIds) {
        const bugs = await Bug.find({ _id: { $in: bugIds } }).populate('reportedBy projectId assignedTo');
        const data = bugs.map(bug => ({
            ID: bug._id,
            Title: bug.title,
            Status: bug.status,
            Severity: bug.severity,
            Priority: bug.priority,
            Project: bug.projectId?.name || 'N/A',
            Reporter: bug.reportedBy?.name,
            Assignee: bug.assignedTo?.name || 'Unassigned',
            Description: bug.description.replace(/\n/g, ' '),
            CreatedAt: bug.createdAt
        }));

        const parser = new Parser();
        const csvData = parser.parse(data);
        const filePath = path.join(process.cwd(), 'uploads', `bugs_report_${Date.now()}.csv`);
        fs.writeFileSync(filePath, csvData);
        return filePath;
    }
}

const exportService = new ExportService();
export default exportService;
