import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-secondary to-secondary/80 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company info */}
          <div>
            <div className="text-white font-bold text-2xl mb-4 flex items-center gap-2">
              <img 
                src="/lovable-uploads/445c1f0e-86bc-45a1-a47c-fe9bd739d132.png" 
                alt="Interlink Logo" 
                className="h-8 w-auto"
              />
              Interlink Shop
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              ผู้นำเข้าและจัดจำหน่ายสายสัญญาณคอมพิวเตอร์ และ อุปกรณ์เครือข่ายคอมพิวเตอร์ พร้อมให้บริการลูกค้าด้วยสินค้าคุณภาพสูงมาตรฐานสากล ในราคาที่คุ้มค้า
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/interlinkfan/?locale=th_TH"><Facebook className="h-6 w-6 hover:text-accent cursor-pointer transition-colors duration-300 hover:scale-110" /></a>
              <a href="https://line.me/R/ti/p/@interlinkfan?from=page&openQrModal=true&searchId=interlinkfan"><Instagram className="h-6 w-6 hover:text-accent cursor-pointer transition-colors duration-300 hover:scale-110" /></a>
              <a href="https://www.tiktok.com/@interlink_official?_t=8fBaR6oujvW&_r=1"><Twitter className="h-6 w-6 hover:text-accent cursor-pointer transition-colors duration-300 hover:scale-110" /></a>
              <a href="https://www.youtube.com/channel/UCa-mUrk77iW8HXKaJm-Kp1Q"><Youtube className="h-6 w-6 hover:text-accent cursor-pointer transition-colors duration-300 hover:scale-110" /></a>
            </div>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="font-semibold mb-6 text-white text-lg">ฝ่ายบริการลูกค้า</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">ศูนย์ช่วยเหลือ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">วิธีการซื้อ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">การชำระเงิน</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">ข้อกำหนดและเงื่อนไข</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">นโยบายความเป็นส่วนตัว</a></li>
            </ul>
          </div>

          {/* About us */}
          <div>
            <h3 className="font-semibold mb-6 text-white text-lg">เกี่ยวกับเรา</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">เกี่ยวกับ Interlink</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">งานกับเรา</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">ข่าวสาร</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">บทความเทคนิค</a></li>
              <li><a href="#" className="hover:text-accent transition-colors duration-300 text-white/80 hover:text-white">ติดต่อเรา</a></li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="font-semibold mb-6 text-white text-lg">ติดต่อเรา</h3>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-accent" />
                <span>บริษัท อินเตอร์ลิ้งค์ คอมมิวนิเคชั่น จำกัด (มหาชน) 48 อาคารอินเตอร์ลิ้งค์ ซอยรุ่งเรือง ถนนรัชดาภิเษก แขวงสามเสนนอก เขตห้วยขวาง กรุงเทพฯ 10310</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>02-666-1111</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>info@interlink.co.th</span>
              </li>
            </ul>

            <h3 className="font-semibold mt-8 mb-4 text-white text-lg">เวลาทำการ</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>จันทร์ - ศุกร์: 9:00 - 18:00</li>
              <li>เสาร์: 9:00 - 16:00</li>
              <li>อาทิตย์: ปิด</li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-4 md:mb-0 text-white/80">
            Copyright © 2025 Interlink All right reserved.
          </div>
          {/* <div className="flex gap-6 text-white/80">
            <span className="hover:text-white transition-colors cursor-pointer">ประเทศไทย</span>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">ภาษาไทย</span>
          </div> */}
        </div>
      </div>
    </footer>
  );
};