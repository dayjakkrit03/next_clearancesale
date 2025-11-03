    // ** นี่คือไฟล์ route.ts ชั่วคราวสำหรับการทดสอบเท่านั้น **
    import { NextResponse } from 'next/server';
    import { testExcelRead } from '@/services/file.service';

    export async function GET() {
        try {
            // 💡 ลองรันกับไฟล์ที่คุณสร้างเอง
            const testFileName = 'test_read.xlsx'; 
            const data = await testExcelRead(testFileName);
            
            return NextResponse.json({
                success: true,
                message: `Successfully read and parsed test file: ${testFileName}`,
                data_count: data.length,
                first_row: data[0] || null,
            });
        } catch (error) {
            console.error('Test Error:', error);
            return NextResponse.json({
                success: false,
                message: `Test failed. Error: ${(error as Error).message}`,
            }, { status: 500 });
        }
    }
    
