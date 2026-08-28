// Starting itinerary data, loaded into db/store.js the first time the app runs
// (i.e. when data/trip.json doesn't exist yet). Editing this file afterwards has
// no effect on an already-seeded install; edit the trip from the web UI instead.
const seedDays = (function seedDays() {

  const days = [
    {
      day_number: 1, date: '2027-01-26', title: '출국 & 방콕 입성', city: 'bkk', icon: 'plane',
      hotel_name: '더 블레스 호텔 앤 레지던스', hotel_addr: '10 Sukhumvit 33 Alley, Khlong Tan Nuea, Watthana, Bangkok',
      hotel_note: '프롬퐁 BTS역 도보 5분, 엠포리엄 백화점 인근. 루프탑 수영장 보유. (1/26~1/28, 3박)',
      hotel_map_query: 'The Bless Hotel & Residence Bangkok', hotel_website: 'https://www.blessresidence.com/',
      events: [
        { time: '15:20', type: 'flight', name: '인천공항 집결 · 진에어 수속', desc: '출발 2시간 30분 전 집결 권장.' },
        { time: '17:50', type: 'flight', name: '인천(ICN) → 수완나품(BKK) 출발', desc: '진에어. 비행시간 약 5시간 50분.' },
        { time: '21:40', type: 'flight', name: '수완나품 공항 도착 (현지시각 예상)', desc: '실제 도착시각은 항공권 기준으로 재확인.', map_query: 'Suvarnabhumi Airport' },
        { time: '22:30', type: 'activity', name: '호텔 체크인', desc: '공항에서 약 40~50분.' },
        { time: '23:00', type: 'meal', name: '숙소 인근 야식', desc: '수쿰빗 33 골목 로컬 식당/편의점.' },
      ],
    },
    {
      day_number: 2, date: '2027-01-27', title: '올드타운 3사원 & 카오산 로드', city: 'bkk', icon: 'temple',
      hotel_name: '', hotel_addr: '', hotel_note: '', hotel_map_query: '', hotel_website: '',
      events: [
        { time: '08:00', type: 'meal', name: '호텔 조식' },
        { time: '09:00', type: 'activity', name: '왕궁 & 왓프라깨우', desc: '복장 규정 필수. 왓포·왓아룬과 도보/보트로 묶어서 관람.', map_query: 'Grand Palace Bangkok' },
        { time: '11:00', type: 'activity', name: '왓포 (와불사원)', desc: '왕궁 도보 5분.', map_query: 'Wat Pho Bangkok' },
        { time: '11:45', type: 'activity', name: '왓포 전통 마사지', desc: '경내 마사지 스쿨, 30~60분.', map_query: 'Wat Pho Thai Traditional Massage School' },
        { time: '13:00', type: 'activity', name: '타티엔 선착장 → 왓아룬', desc: '대중 크로스보트로 강 건넘.', map_query: 'Wat Arun Bangkok' },
        { time: '14:00', type: 'activity', name: '보트로 프라아팃 선착장 이동' },
        { time: '14:30', type: 'meal', name: '쿤댕 꾸어이짭 유안 점심', desc: '카오산 인근 베트남식 롤 쌀국수.', map_query: 'Khun Daeng Kuay Jub Yuan Bangkok' },
        { time: '15:30', type: 'activity', name: '카오산 로드 프리마켓', map_query: 'Khao San Road Bangkok' },
        { time: '17:00', type: 'activity', name: '택시로 호텔 복귀 & 휴식' },
        { time: '19:00', type: 'meal', name: '엠쿼티어 헬릭스 푸드코트 저녁', desc: '호텔 도보 5분. 1인 150~300밧.', map_query: 'EmQuartier Helix Quartier Food Court Bangkok' },
      ],
    },
    {
      day_number: 3, date: '2027-01-28', title: '자유일정 & 쇼핑, 로컬 야시장', city: 'bkk', icon: 'bag',
      hotel_name: '', hotel_addr: '', hotel_note: '', hotel_map_query: '', hotel_website: '',
      events: [
        { time: '09:00', type: 'meal', name: '여유로운 호텔 조식' },
        { time: '10:30', type: 'activity', name: '호텔 루프탑 수영장 & 자유시간' },
        { time: '13:00', type: 'meal', name: '숙소 근처 점심' },
        { time: '14:30', type: 'activity', name: '터미널 21 아속 쇼핑', desc: '세계 도시 테마 층, 포토존 화장실, 가성비 푸드코트.', map_query: 'Terminal 21 Asok Bangkok' },
        { time: '17:00', type: 'activity', name: '호텔 복귀 & 짐 정리' },
        { time: '17:30', type: 'activity', name: '수쿰빗 인근 마사지', map_query: 'Thai Massage Sukhumvit 33 Bangkok' },
        { time: '19:00', type: 'meal', name: '조드페어스 야시장 (라마9) 저녁', desc: '목~일요일 운영, 트렌디 야시장.', map_query: 'Jodd Fairs Rama 9 Bangkok' },
      ],
    },
    {
      day_number: 4, date: '2027-01-29', title: '방콕 → 파타야 이동', city: 'pty', icon: 'van',
      hotel_name: '호텔 제이 파타야', hotel_addr: '221 Moo 6, Soi 5, North Pattaya Rd, Nong Prue, Bang Lamung, Chonburi',
      hotel_note: '터미널21 파타야 도보 9분, 노스 파타야 중심가. (1/29~1/30, 2박)',
      hotel_map_query: 'Hotel J Pattaya', hotel_website: 'https://www.hoteljpattaya.com/',
      events: [
        { time: '10:00', type: 'activity', name: '더 블레스 호텔 체크아웃' },
        { time: '10:30', type: 'activity', name: '방콕 → 파타야 이동 (밴 대절, 약 2시간)' },
        { time: '13:00', type: 'meal', name: '체크인 & 터미널 21 점심', desc: '팟타이 50밧, 카오카무 60밧 등 1인 100~200밧.', map_query: 'Terminal 21 Pattaya' },
        { time: '15:00', type: 'activity', name: '파타야 수상시장 (플로팅 마켓)', map_query: 'Pattaya Floating Market' },
        { time: '18:30', type: 'meal', name: '파타야 나이트 바자 (가벼운 저녁)', desc: '스트리트푸드 30~80밧 선.', map_query: 'Pattaya Night Bazaar' },
      ],
    },
    {
      day_number: 5, date: '2027-01-30', title: '꼬란섬 반일 투어 & 진리의 성전', city: 'pty', icon: 'anchor',
      hotel_name: '', hotel_addr: '', hotel_note: '', hotel_map_query: '', hotel_website: '',
      events: [
        { time: '08:30', type: 'activity', name: '발라하이 선착장 → 코랄아일랜드(꼬란) 반일 투어', map_query: 'Koh Larn Coral Island Pattaya' },
        { time: '12:30', type: 'meal', name: '파타야 복귀 후 점심' },
        { time: '14:30', type: 'activity', name: '진리의 성전 (Sanctuary of Truth)', map_query: 'Sanctuary of Truth Pattaya' },
        { time: '16:30', type: 'activity', name: '나클르아 인근 마사지', map_query: 'Thai Massage Naklua Pattaya' },
        { time: '19:00', type: 'meal', name: '뿌펜 파타야 저녁', desc: '게커리로 유명. 1인 약 500~1,000밧.', map_query: 'Pupen Seafood Pattaya' },
      ],
    },
    {
      day_number: 6, date: '2027-01-31', title: '풀빌라 이동 & 온종일 물놀이', city: 'pty', icon: 'droplet',
      hotel_name: '더 젬스 풀빌라', hotel_addr: '888 Moo 1, Nong Prue, Banglamung, Chonburi',
      hotel_note: '방콕-파타야 고속도로 접근 용이. 풀빌라 정문 앞 한식당 있음. (1/31~2/1, 2박)',
      hotel_map_query: 'The Gems Mining Pool Villas Pattaya', hotel_website: 'https://thegemspattaya.com/',
      events: [
        { time: '10:00', type: 'activity', name: '호텔 제이 체크아웃' },
        { time: '10:30', type: 'activity', name: '더 젬스 풀빌라 체크인', desc: '외출 없이 그랩 배달로 끼니 해결, 온전히 휴식.' },
        { time: '12:30', type: 'meal', name: '그랩 배달 점심', desc: 'MK / S&P 추천, 1인 120~300밧.' },
        { time: '13:30', type: 'activity', name: '프라이빗 풀 물놀이 & 자유시간' },
        { time: '19:00', type: 'meal', name: '그랩 배달 저녁 또는 빌라 앞 한식당', desc: '삼겹살·파전 등 주문 가능.' },
      ],
    },
    {
      day_number: 7, date: '2027-02-01', title: '풀빌라에서 온전히 쉬는 날', city: 'pty', icon: 'sun',
      hotel_name: '', hotel_addr: '', hotel_note: '', hotel_map_query: '', hotel_website: '',
      events: [
        { time: '08:30', type: 'meal', name: '그랩 배달 조식' },
        { time: '09:30', type: 'activity', name: '프라이빗 풀 물놀이 & 휴식' },
        { time: '13:00', type: 'meal', name: '그랩 배달 점심', desc: '더 피자 컴퍼니 / 스시 이즈미 추천.' },
        { time: '15:00', type: 'activity', name: '낮잠 · 보드게임 · 자유시간' },
        { time: '19:00', type: 'meal', name: '그랩 배달 저녁', desc: '본촌치킨/체스터스 등, 바비큐 세팅도 가능.' },
      ],
    },
    {
      day_number: 8, date: '2027-02-02', title: '파타야 → 방콕 이동, 아이콘시암 & 차이나타운', city: 'bkk', icon: 'bag',
      hotel_name: '호텔 뤼 드 시암', hotel_addr: '1216/1 Charoen Krung Rd, Bang Rak, Bangkok',
      hotel_note: '짜런끄룽 로드. 후아람퐁역 도보 10분, 차이나타운·아이콘시암 인근. (2/2~2/3, 1박)',
      hotel_map_query: 'Hotel Rue De Siam Bangkok', hotel_website: 'https://www.ruedesiamhotel.com/',
      events: [
        { time: '10:00', type: 'activity', name: '더 젬스 풀빌라 체크아웃' },
        { time: '10:30', type: 'activity', name: '파타야 → 방콕 이동 (밴 대절, 약 2시간)' },
        { time: '13:00', type: 'meal', name: '호텔 체크인 & 점심' },
        { time: '15:00', type: 'activity', name: '아이콘시암 (ICONSIAM)', desc: '쑥시암 푸드코트, 팁싸마이 팟타이.', map_query: 'ICONSIAM Bangkok' },
        { time: '17:30', type: 'activity', name: '차이나타운 인근 마사지', map_query: 'Thai Massage Charoen Krung Chinatown Bangkok' },
        { time: '19:00', type: 'meal', name: '야오와랏 차이나타운 야시장 저녁', map_query: 'Yaowarat Road Chinatown Bangkok' },
      ],
    },
    {
      day_number: 9, date: '2027-02-03', title: '마사지 & 마지막 쇼핑, 귀국', city: 'bkk', icon: 'suitcase',
      hotel_name: '', hotel_addr: '', hotel_note: '', hotel_map_query: '', hotel_website: '',
      events: [
        { time: '08:00', type: 'meal', name: '호텔 조식' },
        { time: '09:30', type: 'activity', name: '숙소 인근 마사지', map_query: 'Thai Massage Charoen Krung Bangkok' },
        { time: '11:00', type: 'activity', name: '빅씨 마트 & 쇼핑몰 — 마지막 기념품 쇼핑', map_query: 'Big C Ratchadamri Bangkok' },
        { time: '13:00', type: 'meal', name: '쇼핑몰 푸드코트 점심' },
        { time: '15:00', type: 'activity', name: '호텔 복귀 & 짐 정리' },
        { time: '18:00', type: 'activity', name: '호텔 레이트 체크아웃' },
        { time: '18:15', type: 'activity', name: '수완나품 공항 이동 (약 45~60분)' },
        { time: '20:00', type: 'flight', name: '진에어 탑승 수속' },
        { time: '22:35', type: 'flight', name: '수완나품(BKK) → 인천(ICN) 출발', desc: '한국 도착은 다음날(2/4) 새벽 예상.' },
      ],
    },
  ];

  return days;
})();

module.exports = seedDays;
