import React, { useRef, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router';
import useAxiosSecure from '../../Hooks/useAxioseSecure';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const LandReceipt = ({ data, onBack }) => {
    const { id } = useParams();
    const [fetchedData, setFetchedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const componentRef = useRef(null);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (data) {
            setFetchedData(data);
            return;
        }

        if (!id) return;

        setLoading(true);
        axiosSecure
            .get(`/usersPage/${id}`)
            .then(res => setFetchedData(res.data))
            .catch(err => console.error("Receipt fetch error:", err))
            .finally(() => setLoading(false));

    }, [data, id, axiosSecure]);


    const receiptData = data || fetchedData;
    console.log("Receipt Data:", receiptData);
    const owners = receiptData?.ownersInfo || [];

    const leftOwners = owners.filter((_, i) => i % 2 === 0);
    const rightOwners = owners.filter((_, i) => i % 2 !== 0);

    const maxRows = Math.max(leftOwners.length, rightOwners.length);

    const lands = receiptData?.landDetails?.lands || [];


    const leftLands = lands.filter((_, i) => i % 2 === 0);
    const rightLands = lands.filter((_, i) => i % 2 !== 0);

    const maxLandRows = Math.max(leftLands.length, rightLands.length);



    const toBangla = (str) => {
        if (!str && str !== 0) return "";
        const banglaDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        return str.toString().replace(/[0-9]/g, (match) => banglaDigits[match]);
    };

    const handleDownloadPDF = async () => {
        const element = componentRef.current;
        if (!element) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(element, {
                quality: 1.0,
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2.5 // High quality for sharp text
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Land_Receipt_${receiptIdForQR}.pdf`);
        } catch (error) {
            console.error("PDF Download Error:", error);
            alert("পিডিএফ ডাউনলোড সমস্যা: " + error.message);
        } finally {
            setDownloading(false);
        }
    };

    // // // ১. ডাটা থেকে আইডি বের করা
    const banglaToEng = (str) => {
        if (!str) return '';
        const engDigits = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
        return str.toString().replace(/[০-৯]/g, (match) => engDigits[match]);
    };

    const receiptIdForQR = receiptData?._id?.toString();

    const origin =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:5173';

    const qrLink = receiptIdForQR
        ? `${origin}/receipt/${receiptIdForQR}`
        : "";

    console.log("QR Link:", qrLink);

    if (loading) return <div className="p-10 text-center font-bold">রশিদ লোড হচ্ছে...</div>;
    if (!receiptData) return <div className="p-10 text-center text-red-500 font-bold">কোনো তথ্য পাওয়া যায়নি!</div>;


    const s = {

        fontBangla: { fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" },
        headerText: { fontSize: '14px', lineHeight: '1.3', fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif", },
        title: { fontSize: '14px', textAlign: 'center', marginBottom: '2px', fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif", },
        subTitle: { fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif", },

        // Dotted Fields Style
        fieldRow: { display: 'flex', alignItems: 'flex-end', marginBottom: '6px' },
        fieldLabel: { whiteSpace: 'nowrap', paddingRight: '5px', fontSize: '13px', fontWeight: '500' },
        fieldValue: {
            borderBottom: '2px dashed  #000',
            flexGrow: 1,
            textAlign: 'center', // Image shows center aligned values
            paddingBottom: '0px',
            marginLeft: '2px ',
            fontWeight: '',
            fontSize: '14px',
            fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif",
        },

        // Dotted Table Style (For Owner/Land)
        dottedTable: { width: '100%', borderCollapse: 'collapse', border: '1px dotted #000' },
        dtHeader: { border: '1px dotted #000', padding: '3px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px' },
        dtCell: { border: '1px dotted #000', padding: '3px', textAlign: 'center', fontSize: '12px' },

        // Solid Table Style (For Payment)
        solidTable: { width: '100%', borderCollapse: 'collapse', border: '1px solid #dedede', marginTop: '' },
        stHeader: { border: '1px solid #d1d5db', padding: '6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', verticalAlign: 'middle' },
        stCell: { border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' },

        sectionHeader: {
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'underline 2px',
            margin: '10px 0 5px 0',
            fontSize: '14px',
            fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif"
        }
    };



    return (
        <div className='bg-white min-h-screen py-8 '>
            <div className='max-w-[210mm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden'>



                {/* ============== DOCUMENT START ============== */}
                <div ref={componentRef} style={{
                    width: '210mm',
                    height: '297mm',
                    backgroundColor: '#ffffff',
                    padding: '10mm',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}>
                    <div style={{
                        border: '2px dashed #000',
                        padding: '4mm',
                        height: '100%',
                        display: 'flex',

                        flexDirection: 'column',
                        boxSizing: 'border-box',
                        fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif",
                        borderRadius: '8px'
                    }}>

                        {/* 1. HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={s.headerText}>
                                <p>বাংলাদেশ ফরম নং ১০৭৭</p>
                                <p>(সংশোধিত)</p>
                            </div>
                            <div style={{ ...s.headerText, textAlign: 'right' }}>
                                <p>(পরিশিষ্ট: ৩৮)</p>
                                <p style={{ fontSize: '13px' }}>ক্রমিক নং {toBangla(receiptData.id)}</p>
                            </div>
                        </div>

                        <div style={s.title}>ভূমি উন্নয়ন কর পরিশোধ রসিদ</div>
                        <div style={s.subTitle}>(অনুচ্ছেদ ৩৯২ দ্রষ্টব্য)</div>

                        {/* 2. INFO FIELDS (Dotted Lines matching Image) */}
                        <div style={{ marginTop: '10px' }}>
                            {/* Row 1 */}
                            <div style={s.fieldRow}>
                                <span style={s.fieldLabel}>সিটি কর্পোরেশন/ পৌর/ ইউনিয়ন ভূমি অফিসের নাম:</span>
                                <span style={{ ...s.fieldValue, textAlign: 'center' }}>{receiptData.landOfficeName}</span>
                            </div>

                            {/* Row 2: Split 3 ways */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', flex: 1.5, alignItems: 'flex-end' }}>
                                    <span style={s.fieldLabel}>মৌজার নাম ও জে. এল. নং:</span>
                                    <span style={{ ...s.fieldValue, textAlign: 'left', paddingLeft: '10px' }}>{receiptData.mouzaName}</span>
                                </div>
                                <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}>
                                    <span style={s.fieldLabel}>উপজেলা/থানা:</span>
                                    <span style={s.fieldValue}>{receiptData.upazila}</span>
                                </div>
                                <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}>
                                    <span style={s.fieldLabel}>জেলা:</span>
                                    <span style={s.fieldValue}>{receiptData.district}</span>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div style={s.fieldRow}>
                                <span style={s.fieldLabel}>২ নং রেজিস্টার অনুযায়ী হোল্ডিং নম্বর:</span>
                                <span style={{ ...s.fieldValue, flexGrow: 0, width: '200px', textAlign: 'left', paddingLeft: '20px' }}>{toBangla(receiptData.holdingNo)}</span>
                                <div style={{ flexGrow: 1, borderBottom: '2px dashed #000' }}></div> {/* Filler line */}
                            </div>

                            {/* Row 4 */}
                            <div style={s.fieldRow}>
                                <span style={s.fieldLabel}>খতিয়ান নং:</span>
                                <span style={{ ...s.fieldValue, flexGrow: 0, width: '150px', textAlign: 'left', paddingLeft: '20px' }}>{toBangla(receiptData.khatianNo)}</span>
                                <div style={{ flexGrow: 1, borderBottom: '2px dashed #000' }}></div> {/* Filler line */}
                            </div>
                        </div>

                        {/* 3. OWNERS SECTION (Side-by-side) */}
                        <div style={s.sectionHeader}>মালিকের বিবরণ</div>
                        {/* মালিকের বিবরণ */}
                        <div className="mb-4 space-y-2" style={s.fontBangla}>
                            {Array.from({ length: maxRows }).map((_, rowIdx) => {
                                const left = leftOwners[rowIdx];
                                const right = rightOwners[rowIdx];

                                return (
                                    <div key={rowIdx} className="flex gap-4">

                                        {/* ===== Left Table ===== */}
                                        <table className="w-1/2 border-collapse border-dashed border-black text-xs text-center">
                                            <thead>
                                                <tr>
                                                    <th className="border-dashed border-2 text-xs border-black p-1">ক্রমঃ</th>
                                                    <th className="border-dashed border-2 text-xs border-black px-7 py-1">মালিকের নাম</th>
                                                    <th className="border-dashed border-2 text-xs border-black px-2 py-1 ">মালিকের অংশ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border-dashed text-xs border-2 border-black p-1">
                                                        {left ? toBangla(owners.indexOf(left) + 1) : ""}
                                                    </td>
                                                    <td className="border-dashed text-xs border-2 border-black p-1 text-left px-2">
                                                        {left?.ownerName || ""}
                                                    </td>
                                                    <td className="border-dashed text-xs border-2 border-black p-1">
                                                        {left?.ownerShare || ""}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* ===== Right Table ===== */}
                                        <table className="w-1/2 border-collapse border-dashed border-2 border-black text-xs text-center">
                                            <thead>
                                                <tr>
                                                    <th className="border-dashed  border-2 text-xs border-black p-1 ">ক্রমঃ</th>
                                                    <th className="border-dashed border-2 text-xs border-black px-7 py-1">মালিকের নাম</th>
                                                    <th className="border-dashed border-2 text-xs border-black px-2 py-1">মালিকের অংশ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border-dashed text-xs border-2 border-black p-1">
                                                        {right ? toBangla(owners.indexOf(right) + 1) : ""}
                                                    </td>
                                                    <td className="border-dashed text-xs border-2 border-black p-1 text-left px-2">
                                                        {right?.ownerName || ""}
                                                    </td>
                                                    <td className="border-dashed text-xs border-2 border-black p-1">
                                                        {right?.ownerShare || ""}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div>
                                );
                            })}
                        </div>




                        {/* 4. LAND SECTION (Side-by-side) */}
                        <div style={s.sectionHeader}>জমির বিবরণ</div>
                        <div className="mb-4 space-y-2" style={s.fontBangla}>
                            {Array.from({ length: maxLandRows }).map((_, rowIdx) => {
                                const left = leftLands[rowIdx];
                                const right = rightLands[rowIdx];

                                return (
                                    <div key={rowIdx} className="flex gap-4">

                                        {/* ===== Left Land Table ===== */}
                                        <table className="w-1/2 border-collapse border border-black text-xs text-center">
                                            <thead>
                                                <tr>
                                                    <th className="border-dashed border-2 border-black text-xs p-1">ক্রমঃ</th>
                                                    <th className="border-dashed border-2 border-black text-xs p-1">দাগ নং</th>
                                                    <th className="border-dashed border-2 border-black text-xs text-start pr-2 py-1">জমির শ্রেণী</th>
                                                    <th className="border-dashed border-2 border-black text-xs text-start pr-7 py-1">জমির পরিমাণ (শতাংশ)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border-dashed border-2 text-xs text-center border-black py-1">
                                                        {left ? toBangla(lands.indexOf(left) + 1) : ""}
                                                    </td>
                                                    <td className="border-dashed border-2 border-black text-xs text-center py-1">{left?.dagNo || ""}</td>
                                                    <td className="border-dashed border-2 border-black text-xs text-center py-1">{left?.landClass || ""}</td>
                                                    <td className="border-dashed border-2 border-black text-xs text-center py-1">{left?.landArea || ""}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* ===== Right Land Table ===== */}
                                        <table className="w-1/2 border-collapse border-dashed border-2 border-black text-xs text-center">
                                            <thead>
                                                <tr>
                                                    <th className="border-dashed border-2 border-black text-xs p-1 ">ক্রমঃ</th>
                                                    <th className="border-dashed border-2 border-black text-xs p-1">দাগ নং</th>
                                                    <th className="border-dashed border-2 border-black text-xs text-start pr-2 py-1">জমির শ্রেণী</th>
                                                    <th className="border-dashed border-2 border-black text-xs text-start pr-7 py-1 ">জমির পরিমাণ (শতাংশ)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border-dashed border-2 text-xs text-center border-black py-1">
                                                        {right ? toBangla(lands.indexOf(right) + 1) : ""}
                                                    </td>
                                                    <td className="border-dashed border-2 text-xs text-center border-black py-1">{right?.dagNo || ""}</td>
                                                    <td className="border-dashed border-2 text-xs text-center border-black py-1">{right?.landClass || ""}</td>
                                                    <td className="border-dashed border-2 text-xs text-center border-black py-1">{right?.landArea || ""}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div>
                                );
                            })}
                        </div>


                        {/* Total Land Row (Full Width Dotted Box) */}
                        <table
                            style={{
                                width: '100%',
                                border: '1px dashed #000',
                                borderCollapse: 'collapse',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td
                                        style={{
                                            width: '50%',
                                            textAlign: 'center',
                                            padding: '3px',
                                            borderRight: '1px dashed #000',
                                        }}
                                    >
                                        সর্বমোট জমি (শতাংশ)
                                    </td>

                                    <td
                                        style={{
                                            width: '50%',
                                            textAlign: 'left',
                                            padding: '3px',
                                        }}
                                    >
                                        {toBangla(receiptData.landDetails?.totalLandArea)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>


                        {/* 5. PAYMENT TABLE (Solid Borders) */}
                        <div style={{ ...s.fontBangla, marginTop: '20px', }}>
                            <div style={{
                                textDecoration: 'none', borderTop: '1px solid #dedede',
                                borderLeft: '1px solid #dedede',
                                borderRight: '1px solid #dedede',
                                borderBottom: 'none',
                                fontSize: '15px', textAlign: 'center', padding: '10px 0px', fontWeight: 'bold'
                            }}>আদায়ের বিবরণ</div>
                            <table style={s.solidTable}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fff' }}> {/* Image shows white background */}
                                        <th style={s.stHeader}>তিন বংসরের ঊর্ধ্বের<br />বকেয়া</th>
                                        <th style={s.stHeader}>গত তিন বংসরের<br />বকেয়া</th>
                                        <th style={s.stHeader}>বকেয়ার জরিমানা ও<br />ক্ষতিপূরণ</th>
                                        <th style={s.stHeader}>হাল<br />দাবি</th>
                                        <th style={s.stHeader}>মোট<br />দাবি</th>
                                        <th style={s.stHeader}>মোট<br />আদায়</th>
                                        <th style={s.stHeader}>মোট<br />বকেয়া</th>
                                        <th style={s.stHeader}>মন্তব্য</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.arrearsAbove3Yrs)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.arrearsLast3Yrs)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.interest)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.currentDemand)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.totalDemand)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.totalCollection)}</td>
                                        <td style={s.stCell}>{toBangla(receiptData.paymentDetails?.totalArrears)}</td>
                                        <td style={s.stCell}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 6. AMOUNT IN WORDS */}
                        <div style={{ ...s.fontBangla, marginTop: '10px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
                            <span style={{ fontWeight: '', fontSize: '13px' }}>সর্বমোট (কথায়):</span> {receiptData.paymentDetails?.amountInWords} ।
                        </div>

                        {/* 7. FOOTER */}
                        <div className=''>
                            <div style={{ ...s.fontBangla, display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>

                                {/* Left Side: Note, Challan, Date */}
                                <div style={{ fontSize: '13px', flex: 1 }}>
                                    <p style={{ marginBottom: '3px' }}>নোট: সর্বশেষ কর পরিশোধের সাল - {toBangla(receiptData.paymentDetails?.lastPaymentYear)} (অর্থবছর)</p>
                                    <p style={{ marginBottom: '3px' }}>
                                        <span style={{ fontWeight: '' }}>চালান নং :</span>
                                        <span style={{ paddingLeft: '10px' }}>{toBangla(receiptData.paymentDetails?.challanNo) || '______________'}</span>
                                    </p>

                                    {/* Date Box Logic */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <span style={{ fontWeight: '', paddingTop: '10px', marginRight: '5px' }}>তারিখ :</span>
                                        <div style={{ borderBottom: '', textAlign: 'center' }}>
                                            <div style={{ padding: '0px 0px', borderBottom: '1px solid #000', fontWeight: '' }}>
                                                {toBangla(receiptData.dateBangla)}
                                            </div>
                                            <div style={{ padding: '0px 0px', fontWeight: '' }}>
                                                {receiptData.dateEnglish}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='mr-20'>
                                    <div style={{ marginBottom: '5px' }}>
                                        {qrLink && (
                                            <QRCodeSVG
                                                value={qrLink}
                                                size={70}
                                                level="H"
                                            />
                                        )}
                                    </div>
                                </div>
                                {/* Right Side: QR Code & Text */}
                                <div style={{ textAlign: 'center' }}>

                                    <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                        <p>এই দাখিলা ইলেক্ট্রনিকভাবে তৈরি করা হয়েছে,</p>
                                        <p>কোন স্বাক্ষর প্রয়োজন নেই।</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
                {/* ============== DOCUMENT END ============== */}
                <div className='border-t-2 pt-2 flex justify-center items-center '>
                    <div className="mb-6 flex gap-4 print:hidden">
                        {onBack && (
                            <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2">
                                <FaArrowLeft /> ফিরে যান
                            </button>
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2 disabled:bg-gray-400"
                        >
                            {downloading ? 'প্রসেসিং...' : <><FaDownload /> পিডিএফ ডাউনলোড করুন</>}
                        </button>
                    </div>
                </div>
            </div >
        </div>
    );
};

export default LandReceipt;