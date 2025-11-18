"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShoppingCart } from "@/components/shopping-cart";
import { MessageChat } from "@/components/message-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร" }),
  email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
  subject: z.string().min(5, { message: "กรุณากรอกหัวข้ออย่างน้อย 5 ตัวอักษร" }),
  message: z.string().min(10, { message: "กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร" }),
});

export default function ContactPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = 4; // Mock data

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success("ส่งข้อความสำเร็จ!", {
      description: "เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header onCartClick={() => setIsCartOpen(true)} cartItemCount={cartItemCount} /> */}
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-hero text-white">
          <div className="absolute inset-0 bg-primary/50"></div>
          <div className="container mx-auto px-4 relative text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-up">ติดต่อเรา</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              เราพร้อมให้ความช่วยเหลือและตอบทุกข้อสงสัยของคุณ
            </p>
          </div>
        </section>

        {/* Contact Info and Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">ข้อมูลการติดต่อ</h2>
                  <p className="text-muted-foreground">
                    ติดต่อเราผ่านช่องทางต่างๆ ด้านล่างนี้ หรือกรอกแบบฟอร์มเพื่อส่งข้อความถึงเรา
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">ที่อยู่</h3>
                      <p className="text-muted-foreground">123/45 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">โทรศัพท์</h3>
                      <p className="text-muted-foreground">02-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">อีเมล</h3>
                      <p className="text-muted-foreground">info@interlink.co.th</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">เวลาทำการ</h3>
                      <p className="text-muted-foreground">จันทร์ - ศุกร์: 9:00 - 18:00</p>
                      <p className="text-muted-foreground">เสาร์: 9:00 - 16:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <Card className="p-6 md:p-8 shadow-soft">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-bold mb-6">ส่งข้อความถึงเรา</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ชื่อ</FormLabel>
                              <FormControl>
                                <Input placeholder="ชื่อ-นามสกุลของคุณ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>อีเมล</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>หัวข้อ</FormLabel>
                              <FormControl>
                                <Input placeholder="เรื่องที่ต้องการติดต่อ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ข้อความ</FormLabel>
                              <FormControl>
                                <Textarea placeholder="รายละเอียดข้อความของคุณ..." className="min-h-[120px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" size="lg" className="w-full">ส่งข้อความ</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section>
          <div className="w-full h-[400px] md:h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.141319308818!2d100.5734544758021!3d13.77037149691083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29e1575141315%3A0x787e6dcd5513a431!2sINTERLINK%20TELECOM%20PUBLIC%20COMPANY%20LIMITED!5e0!3m2!1sen!2sth!4v1721894030139!5m2!1sen!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {/* <MessageChat /> */}
    </div>
  );
}