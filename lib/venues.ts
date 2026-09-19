export type Ternary = true | false | null;

export type Venue = {
  slug: string;
  name: string;
  type: string;
  district: string;
  area: string;
  address: string;
  nearestStation: string;
  contact: string;
  officialUrl: string;
  sourceUrl: string;
  status: string;
  capacity: number | null;
  prices: {
    weekday: string | null;
    weekend: string | null;
    weekdayMin: number | null;
    weekendMin: number | null;
    rentalHours: string | null;
    taxIncluded: Ternary;
    notes: string | null;
  };
  staff: {
    soundEngineer: Ternary;
    lightingOperator: Ternary;
    stageStaff: Ternary;
    includedNotes: string | null;
    extraFee: string | null;
    notes: string | null;
  };
  audio: {
    console: string | null;
    mainPa: string | null;
    monitor: string | null;
    wiredMic: string | null;
    wirelessMic: string | null;
    diBox: string | null;
  };
  backline: {
    drums: string | null;
    guitarAmp: string | null;
    bassAmp: string | null;
    keyboard: string | null;
    notes: string | null;
  };
  facilities: {
    parking: Ternary;
    waitingRoom: Ternary;
    accessibility: Ternary;
  };
  latitude: number | null;
  longitude: number | null;
  lastCheckedAt: string | null;
  verificationStatus: "verified" | "needs_review" | "unverified";
  accent: string;
};

export const venues: Venue[] = [
  {
    slug: "hongdae-flex-lounge",
    name: "홍대 플렉스라운지",
    type: "라이브클럽 및 소공연장",
    district: "마포구",
    area: "합정·상수",
    address: "서울 마포구 독막로7길 51 지하1층",
    nearestStation: "합정역 (2·6호선) / 상수역 (6호선)",
    contact: "02-322-2935",
    officialUrl: "https://www.instagram.com/flex.lounge/",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=5949876",
    status: "운영 중",
    capacity: null,
    prices: {
      weekday: "월–목 60만~80만 원, 금 90만~110만 원 (월별 상이)",
      weekend: "토 130만~150만 원, 일 100만~120만 원 (월별 상이)",
      weekdayMin: 600000,
      weekendMin: 1000000,
      rentalHours: "기본 8시간",
      taxIncluded: false,
      notes: "공연 러닝타임 3시간 초과 시 15만 원/시간. 기본 대관시간 초과 시 10만 원/시간. 심야·이른 시간 및 성수기는 별도 조건.",
    },
    staff: { soundEngineer: true, lightingOperator: null, stageStaff: null, includedNotes: "음향 엔지니어", extraFee: "중계팀·카메라 구성에 따라 55만~90만 원", notes: null },
    audio: {
      console: "Behringer X32",
      mainPa: "dB Technologies DVA K5 ×12, DVA K20 ×2",
      monitor: "Yamaha DHR12M ×4, Turbosound TFX122M-AN ×2, P16-M ×6",
      wiredMic: "유선 마이크 ×2",
      wirelessMic: "KANALS 무선 마이크 시스템 ×4",
      diBox: "Stereo DI ×4, Mono DI ×1",
    },
    backline: {
      drums: "Pearl Decade Maple 5-piece, Zildjian A Custom / DC Cymbals",
      guitarAmp: "Marshall JVM 410H + 1960A, Fender Hot Rod Deluxe IV",
      bassAmp: "Ampeg SVT7 Pro + SVT-410HLF",
      keyboard: "Yamaha S90 ES, Motif ES7, MODX 7+",
      notes: "건반 사용 대수에 따라 선택 모델 및 추가 요금 조건이 있음.",
    },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null,
    longitude: null,
    lastCheckedAt: null,
    verificationStatus: "unverified",
    accent: "violet",
  },
  {
    slug: "susanghan-street-2",
    name: "수상한 거리 2호점",
    type: "복합문화 소공연장",
    district: "마포구",
    area: "합정·홍대",
    address: "서울 마포구 잔다리로 28 지하1층",
    nearestStation: "합정역 (2·6호선) / 홍대입구역 (2호선)",
    contact: "010-7521-7220",
    officialUrl: "https://susanghanstno2.creatorlink.net/",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=62603581",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 25만~30만 원, 금 40만~50만 원 (월별 상이)", weekend: "토 50만~60만 원 (월별 상이)", weekdayMin: 250000, weekendMin: 500000, rentalHours: "기본 5시간", taxIncluded: false, notes: "기본시간 이후 10만 원/시간, 24시 이후 15만 원/시간. 공휴일·성수기 별도 문의." },
    staff: { soundEngineer: true, lightingOperator: true, stageStaff: null, includedNotes: "음향 엔지니어", extraFee: "조명감독 15만 원", notes: null },
    audio: { console: "Midas M32R", mainPa: "LD Systems MAUI 11 G2", monitor: null, wiredMic: "유선 마이크 ×4", wirelessMic: "없음", diBox: "없음" },
    backline: { drums: "Ludwig 어쿠스틱 드럼 5기통", guitarAmp: "Vox Night Train NT-15H, Marshall JVM 410H", bassAmp: "Markbass Little Mark 250 Black Line", keyboard: "Kurzweil K2700", notes: "세컨드 건반 Motif ES6 추가 5만 원." },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "blue",
  },
  {
    slug: "club-steelface",
    name: "클럽 스틸페이스",
    type: "라이브 클럽 & 루프탑 공연장",
    district: "마포구",
    area: "홍대",
    address: "서울 마포구 어울마당로 136-3 3층/옥상",
    nearestStation: "홍대입구역 (2·경의중앙·공항철도)",
    contact: "공식 인스타그램 @steelface_",
    officialUrl: "https://www.instagram.com/clubsteelface",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=69174749",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 55만 원, 금 65만 원", weekend: "토 70만 원, 일 65만 원", weekdayMin: 550000, weekendMin: 650000, rentalHours: "기본 4시간", taxIncluded: null, notes: "기본시간 이후 10만 원/시간. 단축 대관 가능." },
    staff: { soundEngineer: true, lightingOperator: null, stageStaff: null, includedNotes: "음향 엔지니어", extraFee: null, notes: null },
    audio: { console: "Behringer WING Compact", mainPa: "Turbosound TXD151, FBT X-Sub18", monitor: "HK Pro12MA ×3, JBL ×1", wiredMic: "Shure SM58 ×4, SM57 ×1", wirelessMic: "없음", diBox: "EWI Stereo DI ×2, Mono DI ×2" },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: "마이크 스탠드 보유" },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "red",
  },
  {
    slug: "flex-no-3",
    name: "플렉스 3호점",
    type: "라이브클럽 및 소공연장",
    district: "마포구",
    area: "상수",
    address: "서울 마포구 독막로 68 (상수동 321-1) 지하1층",
    nearestStation: "상수역 (6호선 1번 출구 도보 약 2분) / 합정역 (2·6호선)",
    contact: "010-9348-4620 / 010-2207-0100",
    officialUrl: "https://www.instagram.com/flexno3/",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=63966471",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 60만 원, 금 70만 원", weekend: "토 120만~130만 원, 일 70만~80만 원 (월별 상이)", weekdayMin: 600000, weekendMin: 700000, rentalHours: "기본 8시간", taxIncluded: null, notes: "공연 러닝타임 3시간 초과 시 15만 원/시간. 기본 대관시간 초과 시 10만 원/시간." },
    staff: { soundEngineer: true, lightingOperator: null, stageStaff: null, includedNotes: null, extraFee: null, notes: null },
    audio: { console: null, mainPa: null, monitor: null, wiredMic: null, wirelessMic: null, diBox: null },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: null },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "amber",
  },
  {
    slug: "space-hong",
    name: "SPACE HONG",
    type: "복합문화 소공연장",
    district: "마포구",
    area: "서교동",
    address: "서울특별시 마포구 서교동 463-28",
    nearestStation: "홍대입구역",
    contact: "010-3909-2443",
    officialUrl: "https://www.space-hong.com",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=69406785",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "60만 원", weekend: null, weekdayMin: 600000, weekendMin: null, rentalHours: "기본 5시간", taxIncluded: false, notes: "대관시간 초과 시 12만 원/시간." },
    staff: { soundEngineer: true, lightingOperator: true, stageStaff: null, includedNotes: "음향 엔지니어, 조명감독", extraFee: null, notes: "외부 엔지니어 동반 불가" },
    audio: { console: null, mainPa: null, monitor: null, wiredMic: null, wirelessMic: null, diBox: null },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: null },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "emerald",
  },
  {
    slug: "roller-coaster",
    name: "Roller Coaster",
    type: "라이브클럽 및 소공연장",
    district: "마포구",
    area: "합정·서교동",
    address: "서울 마포구 서교동 446-60 청람빌딩 지하",
    nearestStation: "합정역 (2·6호선 3번 출구 도보 약 6분) / 홍대입구역 (2호선)",
    contact: "@club_rollercoaster / 010-7669-4612 / 070-8281-4612",
    officialUrl: "https://www.instagram.com/hallrollercoaster/",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=3926878",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 43만 원, 금 60만 원", weekend: "토 75만 원, 일 60만 원", weekdayMin: 430000, weekendMin: 600000, rentalHours: "기본 6시간", taxIncluded: false, notes: null },
    staff: { soundEngineer: null, lightingOperator: null, stageStaff: null, includedNotes: null, extraFee: null, notes: null },
    audio: { console: null, mainPa: null, monitor: null, wiredMic: null, wirelessMic: null, diBox: null },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: null },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "cyan",
  },
  {
    slug: "001-live-hall",
    name: "001라이브홀",
    type: "복합문화 소공연장",
    district: "마포구",
    area: "망원·성산",
    address: "서울특별시 마포구 성산동 260-8 B1",
    nearestStation: "망원역",
    contact: "010-3293-2245",
    officialUrl: "https://cafe.naver.com/001livehall",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=68352615",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 80만 원(대학생) / 90만 원(일반), 금 100만 원(대학생) / 110만 원(일반)", weekend: "토 120만 원(대학생) / 140만 원(일반), 일 100만 원(대학생) / 110만 원(일반)", weekdayMin: 800000, weekendMin: 1000000, rentalHours: "기본 7시간", taxIncluded: null, notes: "대관시간 초과 시 30분당 10만 원." },
    staff: { soundEngineer: true, lightingOperator: null, stageStaff: null, includedNotes: null, extraFee: null, notes: null },
    audio: { console: null, mainPa: null, monitor: null, wiredMic: null, wirelessMic: null, diBox: null },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: null },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "pink",
  },
  {
    slug: "the-mascagni",
    name: "The Mascagni",
    type: "라이브클럽 및 소공연장",
    district: "마포구",
    area: "상수",
    address: "서울특별시 마포구 와우산로15길 29 지층(지하 1층)",
    nearestStation: "상수역",
    contact: "02-6954-7777",
    officialUrl: "https://www.instagram.com/mascagni_manager/",
    sourceUrl: "https://www.mule.co.kr/bbs/info/club?idx=66353496",
    status: "운영 중",
    capacity: null,
    prices: { weekday: "월–목 시간당 10만 원", weekend: "80만 원", weekdayMin: 100000, weekendMin: 800000, rentalHours: null, taxIncluded: false, notes: null },
    staff: { soundEngineer: true, lightingOperator: true, stageStaff: null, includedNotes: "음향·조명·영상 엔지니어", extraFee: null, notes: null },
    audio: { console: null, mainPa: null, monitor: null, wiredMic: null, wirelessMic: null, diBox: null },
    backline: { drums: null, guitarAmp: null, bassAmp: null, keyboard: null, notes: null },
    facilities: { parking: null, waitingRoom: null, accessibility: null },
    latitude: null, longitude: null, lastCheckedAt: null, verificationStatus: "unverified", accent: "slate",
  },
];

export const venueBySlug = (slug: string) => venues.find((venue) => venue.slug === slug);

export const formatWon = (value: number | null) =>
  value === null ? "확인 필요" : `${new Intl.NumberFormat("ko-KR").format(value)}원`;

