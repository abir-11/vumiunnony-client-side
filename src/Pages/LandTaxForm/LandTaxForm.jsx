import React, { useState, useEffect, use } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash } from 'react-icons/fa';
// পাথ ঠিক আছে কিনা নিশ্চিত করুন
import LandReceipt from '../LandReceipt/LandReceipt'; 
import useAxiosSecure from '../../Hooks/useAxioseSecure';
import { useNavigate } from 'react-router';

const LandTaxForm = () => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm({
        defaultValues: {
            id: '',
            dateBangla: '', 
            dateEnglish: '', 
            owners: [{ name: '', share: '' }],
            lands: [{ dagNo: '', landClass: '', landArea: '' }],
            totalLandArea: '',
            arrearsAbove3Yrs: '',
            arrearsLast3Yrs: '',
            interest: '',
            currentDemand: '',
            totalDemand: '',
            totalCollection: '',
            totalArrears: '',
            amountInWords: '',
            lastPaymentYear: '',
            challanNo: ''
        }
    });
    const navigate=useNavigate();

    // ইংরেজি থেকে বাংলা নাম্বার কনভার্টার
    const engToBangla = (str) => {
        if (!str) return '';
        const banglaDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        return str.toString().replace(/[0-9]/g, (match) => banglaDigits[match]);
    };

    // বাংলা থেকে ইংরেজি নাম্বার কনভার্টার (হিসাবের জন্য)
    const banglaToEng = (str) => {
        if (!str) return 0;
        const engDigits = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
        return str.toString().replace(/[০-৯]/g, (match) => engDigits[match]);
    };

    // ইনপুট হ্যান্ডলার
    const handleBanglaInput = (event, fieldName) => {
        const value = event.target.value;
        const banglaValue = engToBangla(value);
        setValue(fieldName, banglaValue);
    };

    const { fields: ownerFields, append: appendOwner, remove: removeOwner } = useFieldArray({
        control,
        name: "owners"
    });

    const { fields: landFields, append: appendLand, remove: removeLand } = useFieldArray({
        control,
        name: "lands"
    });

    // মোট জমি ক্যালকুলেশন
    const lands = useWatch({ control, name: "lands" });

    useEffect(() => {
        if (lands) {
            const total = lands.reduce((acc, curr) => {
                const area = parseFloat(banglaToEng(curr.landArea)) || 0;
                return acc + area;
            }, 0);
            setValue('totalLandArea', total > 0 ? engToBangla(total) : '');
        }
    }, [lands, setValue]);

    const [isPreview, setIsPreview] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // লোডিং স্টেট যোগ করা হলো
    const axiosSecure = useAxiosSecure();

    const onSubmit = async (data) => {
        setIsLoading(true); // লোডিং শুরু
        // ডাটাবেস এবং রশিদের জন্য ডাটা স্ট্রাকচার তৈরি করা
        const finalData = {
            dateBangla: data.dateBangla,
            dateEnglish: data.dateEnglish,
            status: 'pending',
            id: data.id,
            landOfficeName: data.landOfficeName,
            mouzaName: data.mouzaName,
            upazila: data.upazila,
            district: data.district,
            holdingNo: data.holdingNo,
            khatianNo: data.khatianNo,
            // মালিকের তথ্য ম্যাপ করা
            ownersInfo: data.owners.map(owner => ({
                ownerName: owner.name,
                ownerShare: owner.share
            })),
            // জমির তথ্য ম্যাপ করা
            landDetails: {
                lands: data.lands.map(land => ({
                    dagNo: land.dagNo,
                    landClass: land.landClass,
                    landArea: land.landArea
                })),
                totalLandArea: data.totalLandArea
            },
            // পেমেন্ট ডিটেইলস
            paymentDetails: {
                arrearsAbove3Yrs: data.arrearsAbove3Yrs || engToBangla(0),
                arrearsLast3Yrs: data.arrearsLast3Yrs || engToBangla(0),
                interest: data.interest || engToBangla(0),
                currentDemand: data.currentDemand,
                totalDemand: data.totalDemand,
                totalCollection: data.totalCollection,
                totalArrears: data.totalArrears || engToBangla(0),
                amountInWords: data.amountInWords,
                lastPaymentYear: data.lastPaymentYear,
                challanNo: data.challanNo || ''
            }
        };

        setFormData(finalData);

        try {
            const res = await axiosSecure.post('/usersPage', finalData);
            if (res.data.insertedId) {
                 const qrId = res.data.qrId;
                Swal.fire({
                    title: 'সফল!',
                    text: 'রশিদ তৈরি হয়েছে। প্রিভিউ দেখুন।',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে'
                });
                navigate(`/receipt/${qrId}`);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            Swal.fire({
                title: 'ত্রুটি!',
                text: 'ডাটা সেভ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
                icon: 'error'
            });
        } finally {
            setIsLoading(false); // লোডিং শেষ
        }
    };

    const bgImage = "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=2000&auto=format&fit=crop";

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed font-bengali"
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage})` }}
        >
            <div className="bg-white/95 backdrop-blur-sm w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                
                {/* প্রিভিউ মোডে থাকলে হেডার দেখানোর দরকার নেই */}
                {!isPreview && (
                    <div className="bg-green-700 text-white p-4 text-center">
                        <h2 className="text-2xl font-bold">ভূমি উন্নয়ন কর পরিশোধ রশিদ</h2>
                        <p className="text-xs">(অনুচ্ছেদ ৩৯২ দ্রষ্টব্য)</p>
                    </div>
                )}

                <div className="p-0"> {/* প্যাডিং কমানো হয়েছে */}
                    {!isPreview ? (
                        <div className="p-6 md:p-10">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                
                                {/* ১. সাধারণ তথ্য */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-6 border-dashed border-gray-400">
                                    <div className="form-control">
                                        <label className="label font-bold">ক্রমিক নং</label>
                                        <input 
                                            type="text" 
                                            {...register("id", { required: true })} 
                                            onChange={(e) => handleBanglaInput(e, "id")}
                                            className="input input-bordered w-full bg-yellow-100 border-gray-300" 
                                        />
                                        {errors.id && <span className="text-red-500 text-xs">এটি পূরণ করা আবশ্যক</span>}
                                    </div>
                                    <div className="form-control lg:col-span-2">
                                        <label className="label font-bold">ভূমি অফিসের নাম</label>
                                        <input type="text" {...register("landOfficeName", { required: true })} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold">মৌজার নাম ও জে. এল. নং</label>
                                        <input type="text" {...register("mouzaName", { required: true })} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold">উপজেলা/থানা</label>
                                        <input type="text" {...register("upazila", { required: true })} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold">জেলা</label>
                                        <input type="text" {...register("district", { required: true })} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold">হোল্ডিং নম্বর</label>
                                        <input type="text" {...register("holdingNo", { required: true })} onChange={(e) => handleBanglaInput(e, "holdingNo")} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label font-bold">খতিয়ান নং</label>
                                        <input type="text" {...register("khatianNo", { required: true })} onChange={(e) => handleBanglaInput(e, "khatianNo")} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                    </div>
                                </div>

                                {/* ২. মালিকের বিবরণ */}
                                <div className="border border-gray-300 p-4 rounded bg-gray-50">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-bold text-lg">মালিকের বিবরণ</h3>
                                        <button type="button" onClick={() => appendOwner({ name: '', share: '' })} className="btn btn-sm btn-circle btn-success text-white"><FaPlus /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ownerFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm border">
                                                <span className="font-bold text-green-700 w-8">{engToBangla(index + 1)}।</span>
                                                <input type="text" placeholder="মালিকের নাম" {...register(`owners.${index}.name`, { required: true })} className="input input-sm flex-1 bg-yellow-50 border-gray-300" />
                                                <input type="text" placeholder="অংশ" {...register(`owners.${index}.share`, { required: true })} onChange={(e) => handleBanglaInput(e, `owners.${index}.share`)} className="input input-sm w-24 bg-yellow-50 border-gray-300" />
                                                {ownerFields.length > 1 && (<button type="button" onClick={() => removeOwner(index)} className="text-red-500 hover:text-red-700"><FaTrash size={14} /></button>)}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ৩. জমির বিবরণ */}
                                <div className="border border-gray-300 p-4 rounded bg-gray-50">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-bold text-lg text-center underline">জমির বিবরণ</h3>
                                        <button type="button" onClick={() => appendLand({ dagNo: '', landClass: '', landArea: '' })} className="btn btn-sm btn-circle btn-success text-white"><FaPlus /></button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-bold bg-green-100 p-2 rounded-t border border-b-0 border-green-200">
                                        <div className="col-span-1 text-center">ক্রমঃ</div>
                                        <div className="col-span-3 text-center">দাগ নং</div>
                                        <div className="col-span-4 text-center">জমির শ্রেণি</div>
                                        <div className="col-span-3 text-center">জমির পরিমাণ (শতাংশ)</div>
                                        <div className="col-span-1 text-center">অ্যাকশন</div>
                                    </div>
                                    <div className="space-y-2">
                                        {landFields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-2 border border-gray-200 rounded">
                                                <div className="col-span-1 text-center font-bold md:block hidden">{engToBangla(index + 1)}</div>
                                                <div className="col-span-1 md:col-span-3"><input type="text" {...register(`lands.${index}.dagNo`, { required: true })} onChange={(e) => handleBanglaInput(e, `lands.${index}.dagNo`)} className="input input-sm w-full bg-yellow-50 border-gray-300 text-center" placeholder="দাগ নং" /></div>
                                                <div className="col-span-1 md:col-span-4"><input type="text" {...register(`lands.${index}.landClass`, { required: true })} className="input input-sm w-full bg-yellow-50 border-gray-300 text-center" placeholder="জমির শ্রেণি" /></div>
                                                <div className="col-span-1 md:col-span-3"><input type="text" {...register(`lands.${index}.landArea`, { required: true })} onChange={(e) => handleBanglaInput(e, `lands.${index}.landArea`)} className="input input-sm w-full bg-yellow-50 border-gray-300 text-center" placeholder="পরিমাণ" /></div>
                                                <div className="col-span-1 text-center flex justify-center">{landFields.length > 1 && (<button type="button" onClick={() => removeLand(index)} className="btn btn-xs btn-ghost text-red-500"><FaTrash /></button>)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-4 bg-gray-100 p-2 rounded border border-gray-200">
                                        <span className="font-bold text-lg">সর্বমোট জমি (শতাংশ):</span>
                                        <input type="text" {...register("totalLandArea")} className="input input-sm w-32 bg-yellow-100 border-gray-400 text-center font-bold text-lg" readOnly />
                                    </div>
                                </div>

                                {/* ৪. আদায়ের বিবরণ */}
                                <div className="border border-gray-300 rounded overflow-hidden">
                                    <div className="bg-gray-100 p-2 text-center font-bold border-b border-gray-300">আদায়ের বিবরণ</div>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full text-center border-collapse">
                                            <thead className="text-xs bg-gray-50">
                                                <tr>
                                                    <th className="border p-2">৩ বছরের উর্ধ্বের বকেয়া</th>
                                                    <th className="border p-2">গত ৩ বছরের বকেয়া</th>
                                                    <th className="border p-2">জরিমানা ও ক্ষতিপূরণ</th>
                                                    <th className="border p-2">হাল দাবি</th>
                                                    <th className="border p-2">মোট দাবি</th>
                                                    <th className="border p-2">মোট আদায়</th>
                                                    <th className="border p-2">মোট বকেয়া</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border p-1"><input type="text" {...register("arrearsAbove3Yrs")} onChange={(e)=>handleBanglaInput(e, "arrearsAbove3Yrs")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("arrearsLast3Yrs")} onChange={(e)=>handleBanglaInput(e, "arrearsLast3Yrs")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("interest")} onChange={(e)=>handleBanglaInput(e, "interest")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("currentDemand", { required: true })} onChange={(e)=>handleBanglaInput(e, "currentDemand")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("totalDemand", { required: true })} onChange={(e)=>handleBanglaInput(e, "totalDemand")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("totalCollection", { required: true })} onChange={(e)=>handleBanglaInput(e, "totalCollection")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                    <td className="border p-1"><input type="text" {...register("totalArrears")} onChange={(e)=>handleBanglaInput(e, "totalArrears")} className="w-full text-center bg-yellow-100 p-1 rounded" /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ৫. ফুটার এবং তারিখ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 items-end">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold whitespace-nowrap">সর্বমোট (কথায়):</span>
                                            <input type="text" {...register("amountInWords", { required: true })} className="input input-bordered w-full bg-yellow-100 border-gray-300" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold whitespace-nowrap">সর্বশেষ কর পরিশোধের সাল:</span>
                                            <input type="text" {...register("lastPaymentYear", { required: true })} onChange={(e)=>handleBanglaInput(e, "lastPaymentYear")} className="input input-sm bg-yellow-100 border-gray-300 w-full" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold whitespace-nowrap">চালান নং:</span>
                                            <input type="text" {...register("challanNo")} onChange={(e)=>handleBanglaInput(e, "challanNo")} className="input input-sm bg-yellow-100 border-gray-300 w-full" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end md:items-end justify-end">
                                        <div className="flex items-center gap-3 font-bold text-lg bg-yellow-50 p-2 rounded border border-yellow-200">
                                            <span>তারিখ :</span>
                                            <div className="flex flex-col items-center">
                                                <input 
                                                    type="text" 
                                                    placeholder="২৮ পৌষ ১৪৩২"
                                                    {...register("dateBangla", { required: true })}
                                                    className="text-center bg-transparent border-b-2 border-black focus:outline-none w-48 placeholder-gray-400"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="১১ জানুয়ারী, ২০২৬"
                                                    {...register("dateEnglish", { required: true })}
                                                    className="text-center bg-transparent focus:outline-none w-48 placeholder-gray-400 mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-6">
                                    <button 
                                        type="submit" 
                                        className={`btn bg-green-700 hover:bg-green-800 text-white w-full md:w-1/2 text-lg shadow-lg ${isLoading ? 'loading' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'দাখিল হচ্ছে...' : 'দাখিল করুন'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // ================= প্রিভিউ সেকশন =================
                        <LandReceipt 
                            data={formData} 
                            onBack={() => {
                                setIsPreview(false);
                                // আপনি যদি চান ব্যাক করলে ফর্ম রিসেট হবে না, তাহলে নিচের লাইনটি কমেন্ট করে রাখুন
                                // reset(); 
                            }} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandTaxForm;