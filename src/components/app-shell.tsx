// src/components/app-shell.tsx
"use client";

import { useState, createContext, useContext } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShoppingCart } from "@/components/shopping-cart";
import { MessageChat } from "@/components/message-chat";

type CartApi = { open: () => void; close: () => void; count: number };
const CartCtx = createContext<CartApi | null>(null);

// (ออปชัน) ใช้เปิดตะกร้าจากคอมโพเนนต์ใด ๆ
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used within <AppShell>");
  return c;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const cartItemCount = 4; // TODO: ต่อกับ state จริงภายหลัง

  const api: CartApi = {
    open: () => setOpen(true),
    close: () => setOpen(false),
    count: cartItemCount,
  };

  return (
    <CartCtx.Provider value={api}>
      <div className="min-h-screen bg-background">
        <Header onCartClick={api.open} cartItemCount={api.count} />
        <main>{children}</main>
        <Footer />
        <ShoppingCart isOpen={isOpen} onClose={api.close} />
        <MessageChat />
      </div>
    </CartCtx.Provider>
  );
}
