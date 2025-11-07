// src/app/admin/components/AdminImportCategoryPanel.tsx

"use client";

import React, { useState } from 'react';
import { FileUp, Database, FolderPlus, Image, Trash2 } from 'lucide-react';
import { Zap } from 'lucide-react';

// กำหนด Type สำหรับ State ของการทำงานแต่ละขั้นตอน
type ProcessState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

// ข้อมูลสำหรับแต่ละขั้นตอนใน Workflow
const workflowSteps = [
  {
    key: 'read_excel',
    title: '1. อ่านไฟล์ Excel (Upload & Read)',
    description: 'อ่านไฟล์ Excel ที่อัปโหลด และแปลงข้อมูลเป็น JSON',
    apiPath: '/api/import/categories/read-excel',
    icon: <FileUp className="w-4 h-4" />,
    style: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    key: 'insert_db',
    title: '2. นำเข้าข้อมูล Category สู่ DB',
    description: 'อัปเดต/เพิ่ม (Upsert) ข้อมูล Category ลงในตาราง ui_categories',
    apiPath: '/api/import/categories/insert-db',
    icon: <Database className="w-4 h-4" />,
    style: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    key: 'create_folders',
    title: '3. สร้างโฟลเดอร์รูปภาพ',
    description: 'สร้างโฟลเดอร์สำหรับจัดเก็บรูปภาพใน Public Asset Path ตาม Slug',
    apiPath: '/api/import/categories/create-folders',
    icon: <FolderPlus className="w-4 h-4" />,
    style: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    key: 'copy_images',
    title: '4. คัดลอกและประมวลผลรูปภาพ',
    description: 'คัดลอกรูปภาพ (.webp) จาก Temp ไปยังโฟลเดอร์ Category และอัปเดต Metadata ใน DB',
    apiPath: '/api/import/categories/copy-images',
    icon: <Image className="w-4 h-4" />,
    style: 'bg-green-600 hover:bg-green-700',
  },
  {
    key: 'cleanup_temp',
    title: '5. ล้างไฟล์ชั่วคราว (Cleanup)',
    description: 'ลบไฟล์ Excel และรูปภาพที่เหลืออยู่ในโฟลเดอร์ Temp',
    apiPath: '/api/files/cleanup-temp-excel',
    icon: <Trash2 className="w-4 h-4" />,
    style: 'bg-red-600 hover:bg-red-700',
  },
];

const initialProcessState: ProcessState = { status: 'idle', message: 'พร้อมดำเนินการ...' };

export default function AdminImportCategoryPanel() {
  // ใช้ Record<string, ProcessState> เพื่อเก็บสถานะของแต่ละขั้นตอน
  const [processState, setProcessState] = useState<Record<string, ProcessState>>(
    workflowSteps.reduce((acc, step) => ({ ...acc, [step.key]: initialProcessState }), {})
  );

  const runStep = async (stepKey: string, apiPath: string) => {
    // รีเซ็ตสถานะสำหรับ Step ที่กำลังจะทำงาน
    setProcessState(prev => ({
      ...prev,
      [stepKey]: { status: 'loading', message: 'กำลังดำเนินการ...' }
    }));

    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // ส่ง Body เปล่าสำหรับ API ที่ไม่มี input พิเศษ
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProcessState(prev => ({
          ...prev,
          [stepKey]: { 
            status: 'success', 
            message: data.message || 'ดำเนินการสำเร็จ' 
          }
        }));
      } else {
        const errorMsg = data.error || data.message || 'เกิดข้อผิดพลาดในการดำเนินการ';
        setProcessState(prev => ({
          ...prev,
          [stepKey]: { 
            status: 'error', 
            message: `ล้มเหลว: ${errorMsg}` 
          }
        }));
      }

    } catch (error: any) {
      console.error(`Error running step ${stepKey}:`, error);
      setProcessState(prev => ({
        ...prev,
        [stepKey]: { 
          status: 'error', 
          message: `Internal Error: ${error.message || 'ไม่สามารถเชื่อมต่อ API ได้'}` 
        }
      }));
    }
  };

  const getStatusClasses = (status: ProcessState['status']) => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'error':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'idle':
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="mb-8 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-primary" />
        Workflow การนำเข้าข้อมูลหมวดหมู่ (5 ขั้นตอน)
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        ดำเนินการตามขั้นตอนด้านล่างทีละขั้นตอนเพื่อนำเข้าข้อมูล Category และจัดการ Assets รูปภาพ
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {workflowSteps.map((step) => {
          const state = processState[step.key];
          const isLoading = state.status === 'loading';
          const buttonDisabled = isLoading; // ทุกปุ่มควรถูก Disable เมื่อกำลังโหลด

          return (
            <div
              key={step.key}
              className={`flex flex-col rounded-lg p-4 transition-shadow h-full ${
                state.status === 'success' ? 'shadow-md ring-2 ring-emerald-400' : 'shadow-sm border border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3 h-10">
                <h4 className="font-medium text-gray-700 text-sm">{step.title}</h4>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusClasses(state.status)}`}
                >
                  {state.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 h-10 overflow-hidden">{step.description}</p>
              
              <button
                onClick={() => runStep(step.key, step.apiPath)}
                disabled={buttonDisabled}
                className={`mt-auto flex items-center justify-center space-x-2 text-sm font-semibold rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${step.style}`}
              >
                {isLoading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                )}
                {!isLoading && step.icon}
                <span>{isLoading ? 'กำลังประมวลผล...' : 'เริ่มดำเนินการ'}</span>
              </button>
              
              {state.message && (
                <p className="mt-2 text-xs font-mono p-1 rounded bg-gray-50 border border-gray-200 text-gray-700 break-words max-h-16 overflow-y-auto">
                  {state.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}