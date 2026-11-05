'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const paginasSemFooter = ['/cadastro', '/login'];
  
  const esconderFooter = paginasSemFooter.includes(pathname);

  return (
    <>
      <Header />
      <main>{children}</main>
      {!esconderFooter && <Footer />}
    </>
  );
}