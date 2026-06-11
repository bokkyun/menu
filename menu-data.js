const RESTAURANT = {
  name: "스미스가좋아하는 테라스",
  location: "서울 종로구 삼청동",
};

const MENU_NOTES = [
  "커피 세트: 아메리카노 포함, 다른 커피로 변경 시 추가 요금",
  "디카페인·오트밀크 변경 시 +500원",
  "파스타 와인 세트: 하우스 와인 1잔 (레드/화이트 선택)",
  "피자 와인 세트: 하우스 와인 1잔 (레드/화이트 선택)",
];

const OPTION_SETS = {
  coffee: [
    { key: "single", label: "Single", priceKey: "single" },
    { key: "coffee-set", label: "Coffee Set", priceKey: "coffeeSet" },
  ],
  wine: [
    { key: "single", label: "Single", priceKey: "single" },
    { key: "wine-set", label: "Wine Set", priceKey: "wineSet" },
  ],
};

const MENU_ITEMS = [
  // Salad
  {
    id: "burrata-salad",
    name: "부라타 치즈",
    category: "샐러드",
    description: "제철 과일과 채소, 부라타 치즈, 바질오일이 어우러진 샐러드",
    options: OPTION_SETS.coffee,
    prices: { single: 24000, coffeeSet: 26500 },
  },
  {
    id: "grilled-chicken-salad",
    name: "그릴드 치킨 & 베지",
    category: "샐러드",
    description: "다양한 향신료로 시즈닝 한 구운 닭다리살과 여러 채소가 어우러진 샐러드",
    image: "https://ldb-phinf.pstatic.net/20260324_61/1774310648995PIuOJ_JPEG/IMG_2593.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 19500, coffeeSet: 22000 },
  },

  // Brunch
  {
    id: "brunch-plate",
    name: "브런치 플레이트",
    category: "브런치",
    description: "채소, 치아바타, 구운 감자, 계란, 소세지, 베이컨 등이 어우러진 플레이트",
    image: "https://ldb-phinf.pstatic.net/20260324_53/17743106025081MCWG_JPEG/IMG_2594.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 18500, coffeeSet: 21000 },
  },

  // Hot Plate
  {
    id: "egg-in-hell",
    name: "에그 인 헬 & 치아바타",
    category: "핫플레이트",
    description: "토마토소스에 새우, 양파, 계란, 모짜렐라 치즈를 넣어 오븐에 익힌 메뉴",
    image: "https://ldb-phinf.pstatic.net/20260324_63/1774310142074YuNhh_JPEG/IMG_2600.jpeg",
    spicy: 1,
    options: OPTION_SETS.coffee,
    prices: { single: 26500, coffeeSet: 29000 },
  },
  {
    id: "tteokbokki",
    name: "떡볶이",
    category: "핫플레이트",
    description: "해물, 깻잎, 그라나 파다노 치즈가 들어간 떡볶이",
    options: OPTION_SETS.coffee,
    prices: { single: 19500, coffeeSet: 22000 },
  },
  {
    id: "rose-tteokbokki",
    name: "로제 떡볶이",
    category: "핫플레이트",
    description: "해물, 깻잎, 그라나 파다노 치즈가 들어간 로제 떡볶이",
    options: OPTION_SETS.coffee,
    prices: { single: 19500, coffeeSet: 22000 },
  },

  // Side
  {
    id: "bacon-potato-soup",
    name: "베이컨 감자 크림 스프",
    category: "사이드",
    description: "구운 리크를 올린 크림 수프",
    price: 10000,
  },
  {
    id: "roasted-potato",
    name: "구운 감자 플레이트",
    category: "사이드",
    description: "각종 향신료로 시즈닝 후 오븐에 구운 감자, 사워크림, 베이컨칩, 치즈, 쪽파",
    image: "https://ldb-phinf.pstatic.net/20260324_100/1774310418264fq6Sl_JPEG/IMG_2597.jpeg",
    price: 14000,
  },

  // Sandwich
  {
    id: "basil-mozzarella-ciabatta",
    name: "바질 생 모짜렐라 치아바타",
    category: "샌드위치",
    description: "신선한 생 모짜렐라치즈, 바질페스토, 발사믹 소스",
    options: OPTION_SETS.coffee,
    prices: { single: 12000, coffeeSet: 14500 },
  },
  {
    id: "carrot-tuna-rye",
    name: "당근 라페 튜나 샌드위치(호밀빵)",
    category: "샌드위치",
    description: "타르타르 소스 참치, 테라스에서 직접 만든 당근 라페",
    options: OPTION_SETS.coffee,
    prices: { single: 12000, coffeeSet: 14500 },
  },
  {
    id: "chicken-chipotle-rye",
    name: "치킨 치폴레 샌드위치(호밀빵)",
    category: "샌드위치",
    description: "매콤한 치폴레 소스 닭가슴살, 적채피클",
    options: OPTION_SETS.coffee,
    prices: { single: 12000, coffeeSet: 14500 },
  },
  {
    id: "bacon-egg-cheese-croissant",
    name: "베이컨 에그 치즈 크로아상",
    category: "샌드위치",
    description: "버터 함량이 높은 크로아상에 베이컨, 계란, 치즈",
    options: OPTION_SETS.coffee,
    prices: { single: 11000, coffeeSet: 13500 },
  },
  {
    id: "apple-brie-croissant",
    name: "애플 브리 치즈 크로아상",
    category: "샌드위치",
    description: "버터 함량이 높은 크로아상에 사과 브리치즈, 꿀",
    options: OPTION_SETS.coffee,
    prices: { single: 11000, coffeeSet: 13500 },
  },

  // Hummus
  {
    id: "hummus-chicken",
    name: "후무스 with 닭다리살",
    category: "후무스",
    description: "후무스와 구운 닭다리살, 대파, 차지키 소스 (치아바타 함께 제공)",
    image: "https://ldb-phinf.pstatic.net/20260324_221/17743099952176zteC_JPEG/IMG_2602.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 17500, coffeeSet: 20000 },
  },

  // Rice
  {
    id: "beef-fried-rice",
    name: "우삼겹 볶음밥",
    category: "밥",
    description: "굴소스와 우삼겹, 숙주, 버섯, 써니사이드업",
    image: "https://ldb-phinf.pstatic.net/20260324_246/1774310474245PoqDY_JPEG/IMG_2596.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 16000, coffeeSet: 18500 },
  },
  {
    id: "chicken-poke",
    name: "닭다리살 포케",
    category: "밥",
    description: "각종 채소와 당근 라페, 구운 닭다리살, 현미밥",
    image: "https://ldb-phinf.pstatic.net/20260324_277/17743102888043k3ac_JPEG/IMG_2598.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 16000, coffeeSet: 18500 },
  },
  {
    id: "basil-fried-rice",
    name: "바질페스토 볶음밥",
    category: "밥",
    description: "새우와 바질페스토, 튀일, 적채 피클",
    image: "https://ldb-phinf.pstatic.net/20260324_101/17743107042146QcE5_JPEG/IMG_2591.jpeg",
    options: OPTION_SETS.coffee,
    prices: { single: 17500, coffeeSet: 20000 },
  },

  // Pasta
  {
    id: "shrimp-anchovy-oil",
    name: "쉬림프 앤초비 오일",
    category: "파스타",
    description: "새우, 앤초비가 들어간 오일 파스타",
    spicy: 1,
    options: OPTION_SETS.wine,
    prices: { single: 22000, wineSet: 28000 },
  },
  {
    id: "seafood-oil",
    name: "해산물 오일(해장 파스타)",
    category: "파스타",
    description: "각종 해산물과 숙주, 청양고추 페스토가 어우러진 국물 있는 해장 파스타",
    image: "https://ldb-phinf.pstatic.net/20260324_75/1774310529290K3QS3_JPEG/IMG_2595.jpeg",
    spicy: 3,
    options: OPTION_SETS.wine,
    prices: { single: 26500, wineSet: 32500 },
  },
  {
    id: "pane",
    name: "빠네",
    category: "파스타",
    description: "빵을 그릇처럼 사용한 베이컨 & 머쉬룸 크림 파스타",
    options: OPTION_SETS.wine,
    prices: { single: 28000, wineSet: 34000 },
  },
  {
    id: "ragu",
    name: "라구",
    category: "파스타",
    description: "테라스에서 직접 끓인 라구소스, 파케리 면 토마토 파스타",
    image: "https://ldb-phinf.pstatic.net/20260324_264/1774310403330QU9DM_JPEG/IMG_2592.jpeg",
    options: OPTION_SETS.wine,
    prices: { single: 22000, wineSet: 28000 },
  },
  {
    id: "jalapeno-tomato",
    name: "할라피뇨 토마토",
    category: "파스타",
    description: "할라피뇨로 매운 맛을 낸 깔끔한 토마토 소스 파스타",
    image: "https://ldb-phinf.pstatic.net/20260324_292/1774310092462LpuEN_JPEG/IMG_2601.jpeg",
    spicy: 2,
    options: OPTION_SETS.wine,
    prices: { single: 22000, wineSet: 28000 },
  },
  {
    id: "seafood-rose",
    name: "해산물 로제",
    category: "파스타",
    description: "각종 해산물과 로제소스가 어우러진 파스타",
    options: OPTION_SETS.wine,
    prices: { single: 24000, wineSet: 30000 },
  },
  { id: "ciabatta-extra", name: "치아바타 추가", category: "추가", description: "파스타 추가 옵션", price: 3500 },

  // Pizza
  {
    id: "pepperoni",
    name: "페페로니",
    category: "피자",
    description: "페페로니와 모짜렐라 치즈가 어우러진 심플한 피자",
    options: OPTION_SETS.wine,
    prices: { single: 26000, wineSet: 32000 },
  },
  {
    id: "bulgogi-eggplant",
    name: "소불고기 & 가지",
    category: "피자",
    description: "소불고기, 가지, 양파, 모짜렐라 치즈",
    options: OPTION_SETS.wine,
    prices: { single: 28000, wineSet: 34000 },
  },
  {
    id: "basil-jamon-burrata",
    name: "바질 페스토 & 하몽 & 부라타 치즈",
    category: "피자",
    description: "바질 페스토, 루꼴라, 하몽, 부라타 치즈",
    image: "https://ldb-phinf.pstatic.net/20260324_160/1774310209713z1vMY_JPEG/IMG_2599.jpeg",
    options: OPTION_SETS.wine,
    prices: { single: 30000, wineSet: 36000 },
  },
];

const CATEGORY_ORDER = [
  "전체",
  "샐러드",
  "브런치",
  "핫플레이트",
  "사이드",
  "샌드위치",
  "후무스",
  "밥",
  "파스타",
  "피자",
  "추가",
];

function getItemPrice(item, optionKey) {
  if (item.price != null) return item.price;
  const option = item.options.find((opt) => opt.key === optionKey) || item.options[0];
  return item.prices[option.priceKey];
}

function getDefaultOption(item) {
  if (!item.options || item.options.length === 0) return null;
  return item.options[0].key;
}

function resolveOptionKey(item, optionKey) {
  if (!item.options) return null;
  if (optionKey && item.options.some((opt) => opt.key === optionKey)) return optionKey;
  return getDefaultOption(item);
}

function formatSelectionKey(itemId, optionKey) {
  return optionKey ? `${itemId}::${optionKey}` : itemId;
}

function parseSelectionKey(key) {
  const [itemId, optionKey] = key.split("::");
  return { itemId, optionKey: optionKey || null };
}
