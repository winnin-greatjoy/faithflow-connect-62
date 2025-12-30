
import PDFDocument from 'https://esm.sh/pdfkit@0.14.0';

interface Signature {
    title: string;
    name: string;
}

interface CertificateData {
    fullName: string;
    programName: string;
    graduationDate: string;
    signatures: Signature[];
}

export async function generateCertificate({
    fullName,
    programName,
    graduationDate,
    signatures,
}: CertificateData): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => {
            resolve(new Blob(chunks, { type: 'application/pdf' }));
        });
        doc.on('error', (err: any) => reject(err));

        // content
        doc.fontSize(28).text('CERTIFICATE OF COMPLETION', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(16).text(
            `This certifies that ${fullName} has successfully completed the ${programName} program.`,
            { align: 'center' }
        );

        doc.moveDown();
        doc.text(`Graduated on: ${graduationDate}`, { align: 'center' });

        doc.moveDown(3);

        // Simple signature layout
        let y = doc.y;
        signatures.forEach((sig, index) => {
            // distribute signatures horizontally if possible, or vertically for simplicity as per blueprint
            // Blueprint said: doc.text(`${sig.title}: ${sig.name}`, { align: 'left' });
            // We'll stick to blueprint's simple vertical list for now or slightly improve if needed.
            // Actually, let's keep it simple as per blueprint.
            doc.text(`${sig.title}: ${sig.name}`, { align: 'center' });
            doc.moveDown(0.5);
        });

        doc.end();
    });
}

export async function uploadCertificate(supabase: any, studentId: string, pdfBlob: Blob) {
    const filename = `${studentId}-${Date.now()}.pdf`;
    const path = `certificates/${filename}`;

    const { data, error } = await supabase.storage
        .from('bible-certificates')
        .upload(path, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true,
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('bible-certificates')
        .getPublicUrl(path);

    return publicUrl;
}
