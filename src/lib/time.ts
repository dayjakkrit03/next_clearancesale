// src/lib/time.ts

/** คืนค่า Date ปัจจุบันในเวลาไทย (+07:00) */
export function nowTH(): Date {
  const date = new Date();
  // บวก 7 ชั่วโมง เพื่อเป็นเวลาไทย
  date.setHours(date.getHours() + 7);
  return date;
}
