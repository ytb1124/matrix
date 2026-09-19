"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const HIDE_UNTIL_KEY = "matrix_welcome_hide_until";
const SESSION_KEY = "matrix_welcome_closed_session";

function shouldOpen() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
  return Number(localStorage.getItem(HIDE_UNTIL_KEY) ?? 0) <= Date.now();
}

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(shouldOpen()), []);
  const closeSession = () => { sessionStorage.setItem(SESSION_KEY, "1"); setOpen(false); };
  const hideForDay = () => { localStorage.setItem(HIDE_UNTIL_KEY, String(Date.now() + 24 * 60 * 60 * 1000)); setOpen(false); };

  return <Dialog open={open} onOpenChange={(next) => { if (!next) closeSession(); }}>
    <DialogContent className="matrix-welcome" showCloseButton={false} onEscapeKeyDown={closeSession}>
      <div className="matrix-welcome-mark" aria-hidden="true">M</div>
      <DialogHeader>
        <DialogTitle>MATRIX에 오신 것을 환영합니다.</DialogTitle>
        <DialogDescription>MATRIX는 공연을 준비하는 아티스트와 엔지니어가 공연장의 대관·테크니컬 정보를 한곳에서 확인하고 비교하는 비영리 정보 플랫폼입니다.<br />동아방송예술대학교 음향제작과 산학협동프로젝트의 일환으로 제작되었습니다.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <button type="button" className="welcome-later" onClick={hideForDay}>24시간 동안 보지 않기</button>
        <button type="button" className="welcome-close" onClick={closeSession}>닫기</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
