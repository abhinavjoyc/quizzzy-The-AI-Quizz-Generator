'use client';

import React from 'react';

interface CertificateViewProps {
  userName: string;
  topic: string;
}

const CertificateView = ({ userName, topic }: CertificateViewProps) => {
  const handleDownload = () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.getElementById('certificate');
      if (!element) {
        console.error('Certificate element not found');
        return;
      }

      const opt = {
        margin: 1,
        filename: `${userName}-certificate.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'landscape',
        }
      };

      // @ts-ignore
      html2pdf().from(element).set(opt).save();
    };
    document.head.appendChild(script);
  };

  return (
    <div className="text-center mt-6">
      <div 
        id="certificate" 
        className="certificate-preview bg-white p-6 rounded shadow-lg max-w-xl mx-auto mb-8"
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          padding: '40px'
        }}
      >
        <div className="flex flex-col items-center justify-center w-full space-y-4">
          <h3 className="text-2xl font-semibold text-center w-full" style={{ textAlign: 'center' }}>
            Certificate of Achievement
          </h3>
          
          <p className="text-lg text-center w-full" style={{ textAlign: 'center' }}>
            This is to certify that
          </p>
          
          <h4 className="text-xl font-bold text-center w-full" style={{ textAlign: 'center' }}>
            {userName || "Student"}
          </h4>
          
          <p className="text-center w-full" style={{ textAlign: 'center' }}>
            has successfully completed the quiz on
          </p>
          
          <h5 className="text-lg font-semibold text-center w-full" style={{ textAlign: 'center' }}>
            Quizzy App
          </h5>
          
          <p className="text-center w-full" style={{ textAlign: 'center' }}>
            on the topic
          </p>
          
          <h5 className="text-lg font-semibold text-center w-full" style={{ textAlign: 'center' }}>
            {topic}
          </h5>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
      >
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateView;