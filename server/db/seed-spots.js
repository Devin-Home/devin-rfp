// Starting "가볼 곳" / "맛집" list, loaded into db/store.js the first time the app
// runs (i.e. when data/trip.json has no spots yet). Editing this file afterwards has
// no effect on an already-seeded install; add/edit spots from the web UI instead.
const seedSpots = [
  { category: 'place', day: 2, city: '방콕', name: '왕궁 & 왓프라깨우', note: '올드타운의 시작. 복장 규정을 지켜야 입장할 수 있습니다.', map: 'Grand Palace Bangkok', tint: 'bl-200' },
  { category: 'place', day: 2, city: '방콕', name: '왓아룬', note: '타티엔 선착장에서 크로스보트로 강을 건너 도착.', map: 'Wat Arun Bangkok', tint: 'bl-100' },
  { category: 'place', day: 2, city: '방콕', name: '왓포 (와불사원)', note: '왕궁 도보 5분. 15m 황금 와불상과 전통 마사지 스쿨로 유명.', map: 'Wat Pho Bangkok', tint: 'bl-300' },
  { category: 'place', day: 2, city: '방콕', name: '카오산 로드', note: '배낭여행자 거리의 상징. 프리마켓과 길거리 음식, 야시장 분위기.', map: 'Khao San Road Bangkok', tint: 'sand' },
  { category: 'place', day: 3, city: '방콕', name: '조드페어스 야시장', note: '목요일부터 일요일까지 열리는 라마9의 야시장.', map: 'Jodd Fairs Rama 9 Bangkok', tint: 'sand' },
  { category: 'place', day: 4, city: '파타야', name: '파타야 수상시장', note: '수상가옥 사이를 오가며 즐기는 플로팅마켓.', map: 'Pattaya Floating Market', tint: 'bl-200' },
  { category: 'place', day: 4, city: '파타야', name: '파타야 나이트 바자', note: '해변가 야시장. 스트리트푸드와 기념품 쇼핑.', map: 'Pattaya Night Bazaar', tint: 'bl-100' },
  { category: 'place', day: 5, city: '파타야', name: '꼬란섬 코랄 비치', note: '발라하이 선착장에서 출발하는 반일 투어.', map: 'Koh Larn Coral Island Pattaya', tint: 'bl-300' },
  { category: 'place', day: 5, city: '파타야', name: '진리의 성전', note: '못 하나 쓰지 않고 짓는 목조 성전. 오후 관람.', map: 'Sanctuary of Truth Pattaya', tint: 'bl-100' },
  { category: 'place', day: 8, city: '방콕', name: '아이콘시암', note: '쑥시암 푸드코트와 팁싸마이 팟타이가 있는 강변 몰.', map: 'ICONSIAM Bangkok', tint: 'bl-200' },

  { category: 'meal', day: 2, city: '방콕', name: '쿤댕 꾸어이짭 유안', note: '카오산 인근. 베트남식 롤 쌀국수 맛집.', map: 'Khun Daeng Kuay Jub Yuan Bangkok', tint: 'bl-100' },
  { category: 'meal', day: 2, city: '방콕', name: '엠쿼티어 헬릭스 푸드코트', note: '다양한 로컬 음식을 한자리에서. 1인 150~300바트.', map: 'EmQuartier Helix Quartier Food Court Bangkok', tint: 'sand' },
  { category: 'meal', day: 4, city: '파타야', name: '터미널21 파타야 푸드코트', note: '팟타이 50바트, 카오카무 60바트 등 가성비 좋은 로컬 음식.', map: 'Terminal 21 Pattaya', tint: 'bl-200' },
  { category: 'meal', day: 5, city: '파타야', name: '뿌펜 파타야', note: '게커리로 유명한 시푸드 맛집. 1인 약 500~1,000바트.', map: 'Pupen Seafood Pattaya', tint: 'bl-300' },
  { category: 'meal', day: 8, city: '방콕', name: '팁싸마이 팟타이', note: '아이콘시암 인근, 방콕을 대표하는 팟타이 노포.', map: 'Thipsamai Pad Thai Bangkok', tint: 'bl-100' },
  { category: 'meal', day: 8, city: '방콕', name: '야오와랏 차이나타운 야시장', note: '거리 전체가 야시장. 다양한 길거리 음식이 모여있음.', map: 'Yaowarat Road Chinatown Bangkok', tint: 'bl-200' },
];

module.exports = seedSpots;
