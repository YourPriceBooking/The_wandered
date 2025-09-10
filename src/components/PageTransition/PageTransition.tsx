"use client";

import { usePathname } from "next/navigation";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useRef } from "react";
import './transitions.scss';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nodeRef = useRef(null);

  return (
    <SwitchTransition>
      <CSSTransition
        key={pathname} // key for animation when changing route
        nodeRef={nodeRef}
        timeout={900}
        classNames="page"
        unmountOnExit
      >
        <div ref={nodeRef}>{children}</div>
      </CSSTransition>
    </SwitchTransition>
  );
}