import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareId } = params;
  
  // In a real app, you'd fetch this from a database
  // For now, we'll use generic metadata
  return {
    title: 'คำทำนายไพ่ทาโรต์ - Hybridus Tarot',
    description: 'ดูคำทำนายไพ่ทาโรต์ที่ถูกแชร์จาก Hybridus Tarot',
    openGraph: {
      title: 'คำทำนายไพ่ทาโรต์ - Hybridus Tarot',
      description: 'ดูคำทำนายไพ่ทาโรต์ที่ถูกแชร์จาก Hybridus Tarot',
      type: 'website',
      images: [`/api/og?shareId=${shareId}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'คำทำนายไพ่ทาโรต์ - Hybridus Tarot',
      description: 'ดูคำทำนายไพ่ทาโรต์ที่ถูกแชร์จาก Hybridus Tarot',
      images: [`/api/og?shareId=${shareId}`],
    },
  };
}

export default function SharePage({ params }: SharePageProps) {
  const { shareId } = params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-400/30 p-8 text-center">
        <h1 className="text-3xl font-bold text-purple-300 mb-4">
          คำทำนายไพ่ทาโรต์
        </h1>
        <p className="text-slate-300 mb-6">
          ดูคำทำนายนี้แล้วอยากลองดูดวงด้วยตัวเองหรือไม่?
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
        >
          ลองดูดวงเลย
        </a>
        <div className="mt-8 text-sm text-slate-400">
          <p>Share ID: {shareId}</p>
          <p className="mt-2">
            ข้อมูลคำทำนายจะถูกเก็บไว้ชั่วคราวใน localStorage ของผู้แชร์
          </p>
        </div>
      </div>
    </div>
  );
}
