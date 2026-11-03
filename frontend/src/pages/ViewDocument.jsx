import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Backend URL comes from the .env files (localhost in dev, Vercel in production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export default function ViewDocument() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loaderHidden, setLoaderHidden] = useState(false);

  // PDF / viewer mode is active when ?view=pdf is in the URL
  const isPdfView = searchParams.get('view') === 'pdf';

  // Load Tajawal font and FontAwesome icons (same as the PHP page)
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    ].map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    const previousTitle = document.title;
    document.title = 'معاينة الوثيقة - غرفة الرياض';

    return () => {
      links.forEach((link) => document.head.removeChild(link));
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/api/documents/${id}`)
      .then(res => {
        if (res.data.success) {
          setDoc(res.data.data);
        }
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Hide the loader shortly after the data has finished loading
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setLoaderHidden(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Full screen rotating loader
  const loader = (
    <div
      className={`fixed inset-0 w-full h-full bg-white flex justify-center items-center z-[9999] transition-[opacity,visibility] duration-[400ms] ease-in-out ${
        loaderHidden ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      <div className="w-[60px] h-[60px] border-[5px] border-[#e0e0e0] border-t-[#13324c] rounded-full animate-[spin_0.8s_linear_infinite]"></div>
    </div>
  );

  // While loading, show only the loader
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f8f9fa] text-[#333] font-['Tajawal',sans-serif]">
        {loader}
      </div>
    );
  }

  const fileExt = doc && doc.filePath
    ? (doc.filePath.split('?')[0].split('.').pop() || '').toLowerCase()
    : '';
  const isImage = IMAGE_EXTENSIONS.includes(fileExt);

  // Document viewer mode (PDF / image) - only for an existing and active record
  if (isPdfView && doc && doc.isActive) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f8f9fa] text-[#333] font-['Tajawal',sans-serif]">
        {loader}

        {/* Document Preview Top Bar */}
        <div className="bg-[#0088cc] text-white px-5 py-3 flex justify-between items-center shadow-[0_2px_5px_rgba(0,0,0,0.15)] sticky top-0 z-[1000]">
          <div className="flex items-center gap-[10px] text-[1.25rem] font-bold">
            <span className="bg-white text-[#0088cc] px-[6px] py-[2px] rounded text-[0.8rem] font-extrabold uppercase">
              {fileExt ? fileExt.toUpperCase() : 'DOC'}
            </span>
            <span>{isImage ? 'معاينة الصورة / Image Preview' : 'Save as PDF'}</span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="text-white text-[0.9rem] bg-white/20 px-[14px] py-[6px] rounded cursor-pointer"
            >
              رجوع / Back
            </button>
          </div>
        </div>

        {/* Print options bar */}
        <div className="bg-[#0077b3] px-[15px] py-[10px] text-white text-[0.95rem] flex justify-around items-center border-b border-white/10">
          <div>Copies: <strong>01</strong></div>
          <div>Paper size: <strong>Letter</strong></div>
        </div>

        {/* Document Viewer (handles PDF and images) */}
        <div className="w-full max-w-[850px] mx-auto my-5 min-h-[80vh] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] rounded-md overflow-hidden relative flex justify-center items-center">
          {doc.filePath ? (
            isImage ? (
              <img
                src={doc.filePath}
                alt="Document Image"
                className="max-w-full max-h-[80vh] object-contain block mx-auto p-[10px]"
              />
            ) : (
              <iframe
                src={`${doc.filePath}#toolbar=1`}
                title="Document PDF"
                className="w-full h-[80vh] border-0"
              >
                <p>
                  آپ کا براؤزر PDF ڈسپلے نہیں کر پا رہا۔{' '}
                  <a href={doc.filePath}>یہاں کلک کر کے ڈاؤن لوڈ کریں</a>.
                </p>
              </iframe>
            )
          ) : (
            <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] p-[15px] rounded-md text-center text-[1.1rem] font-bold my-10 mx-auto max-w-[80%]">
              اس وثيقة کے ساتھ کوئی فائل اپ لوڈ نہیں کی گئی۔
            </div>
          )}
        </div>

        {/* Floating Download Button */}
        {doc.filePath && (
          <a
            href={doc.filePath}
            download
            title="Download File"
            className="fixed top-[50px] right-5 bg-[#ffcc00] text-[#13324c] w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] no-underline font-extrabold text-[0.75rem] z-[1000] transition-transform duration-200 hover:scale-105"
          >
            <span className="text-[1.2rem] leading-none">⬇</span>
            <span>{fileExt.toUpperCase()}</span>
          </a>
        )}
      </div>
    );
  }

  // Main verification page
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fa] text-[#333] font-['Tajawal',sans-serif]">
      {loader}

      {/* Header containing top-logo.png */}
      <header className="bg-[#0d273d] w-full p-0 m-0 block overflow-hidden">
        <div className="block w-full m-0 p-0 leading-[0]">
          <img
            src="/top-logo.png"
            alt="Riyadh Chamber Banner Logo"
            className="w-full max-w-full h-auto object-cover block m-0 p-0"
          />
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-[500px] mx-auto my-[30px] bg-white px-5 py-[25px] rounded shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <h2 className="text-[#5b8ba8] text-[1.2rem] font-bold border-b-2 border-[#e9ecef] pb-2 mb-5 text-right">
          التحقق من المعاملات:
        </h2>

        {error || !doc ? (
          <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] p-[15px] rounded-md text-center text-[1.1rem] font-bold my-5">
            السجل غير موجود!
          </div>
        ) : !doc.isActive ? (
          // Record is hidden/inactive: show only the warning, no data
          <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] p-[15px] rounded-md text-center text-[1.1rem] font-bold my-5">
            عذراً، هذه الوثيقة غير مفعلة حالياً أو تم إيقافها!
          </div>
        ) : (
          // Record is active: show the data
          <>
            <div className="mb-[18px] text-right">
              <span className="text-[#70778b] text-[0.92rem] mb-[3px] block">اسم المنشأة / Organization Name</span>
              <div className="text-[#111] text-[1.15rem] font-bold">{doc.orgName}</div>
            </div>

            <div className="mb-[18px] text-right">
              <span className="text-[#70778b] text-[0.92rem] mb-[3px] block">الرقم الموحد / National Number</span>
              <div className="text-[#111] text-[1.15rem] font-bold">{doc.nationalNum}</div>
            </div>

            <div className="mb-[18px] text-right">
              <span className="text-[#70778b] text-[0.92rem] mb-[3px] block">رقم العضوية / Member Number</span>
              <div className="text-[#111] text-[1.15rem] font-bold">{doc.memberNum}</div>
            </div>

            <div className="mb-[18px] text-right">
              <span className="text-[#70778b] text-[0.92rem] mb-[3px] block">رقم الوثيقة / Document Number</span>
              <div className="text-[#111] text-[1.15rem] font-bold">{doc.docNum}</div>
            </div>

            <div className="mb-[18px] text-right">
              <span className="text-[#70778b] text-[0.92rem] mb-[3px] block">حالة الوثيقة / Status</span>
              <div className="mt-[5px]">
                <span className="inline-block bg-[#e6f4ea] text-[#1e7e34] border border-[#c3e6cb] px-[15px] py-[5px] rounded font-bold text-[0.95rem]">
                  {doc.status || 'Active / مصدقة'}
                </span>
              </div>
            </div>

            {/* Open Letter Button */}
            <button
              type="button"
              onClick={() => setSearchParams({ view: 'pdf' })}
              className="block w-full bg-[#5b8ba8] text-white px-5 py-3 rounded text-[1.05rem] font-bold text-center mt-[25px] cursor-pointer transition-colors duration-300 hover:bg-[#4a7590]"
            >
              خطاب / Open Letter
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0d273d] text-white pt-[35px] px-5 pb-5 text-center mt-[50px]">
        <div className="flex justify-center gap-3 flex-wrap mb-5 text-[0.9rem]">
          <a href="#" className="text-white no-underline text-[0.9rem]">الرئيسية</a> |
          <a href="#" className="text-white no-underline text-[0.9rem]">الأسئلة الشائعة</a> |
          <a href="#" className="text-white no-underline text-[0.9rem]">الشكاوى والاقترحات</a> |
          <a href="#" className="text-white no-underline text-[0.9rem]">اتصل بنا</a> |
          <a href="#" className="text-white no-underline text-[0.9rem]">فروع الغرفة</a> |
          <a href="#" className="text-white no-underline text-[0.9rem]">تسجيل الاهتمامات</a>
        </div>

        {/* Social Media Icons (FontAwesome) */}
        <div className="flex justify-center gap-3 mb-5">
          {[
            { title: 'YouTube', icon: 'fa-youtube' },
            { title: 'LinkedIn', icon: 'fa-linkedin-in' },
            { title: 'Facebook', icon: 'fa-facebook-f' },
            { title: 'Instagram', icon: 'fa-instagram' },
            { title: 'Twitter', icon: 'fa-x-twitter' },
          ].map((item) => (
            <a
              key={item.title}
              href="#"
              title={item.title}
              className="w-[38px] h-[38px] bg-white text-[#0d273d] rounded-full flex items-center justify-center no-underline text-[1.1rem] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-[#f3b200] hover:text-[#0d273d]"
            >
              <i className={`fa-brands ${item.icon}`}></i>
            </a>
          ))}
        </div>

        <div>جميع الحقوق محفوظة © 2026</div>
        <div className="mt-2 text-[#a0b2c6]">للاستفسار والدعم الفني</div>
        <div className="text-[#f3b200] text-[1.7rem] font-extrabold my-3">920004565</div>

        <div>
          <img
            src="/footer-logo.png"
            alt="Riyadh Chamber Footer Logo"
            className="max-w-[250px] h-auto my-[15px] mx-auto block"
          />
        </div>

        {/* Play Store & App Store Badges */}
        <div className="flex justify-center gap-3 mt-5 flex-wrap">
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              className="h-[42px] w-auto rounded-md border border-white/20"
            />
          </a>
          <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="h-[42px] w-auto rounded-md border border-white/20"
            />
          </a>
        </div>

        <div className="text-[#a0b2c6] text-[0.85rem] mt-[15px]">غرفة الرياض - Riyadh Chamber</div>
      </footer>
    </div>
  );
}