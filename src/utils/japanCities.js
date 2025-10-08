// 日本の主要都市データ（緯度・経度付き）
export const JAPAN_CITIES = [
  // 北海道
  { name: '札幌市', prefecture: '北海道', latitude: 43.0642, longitude: 141.3469 },
  { name: '函館市', prefecture: '北海道', latitude: 41.7687, longitude: 140.7288 },
  { name: '旭川市', prefecture: '北海道', latitude: 43.7711, longitude: 142.3649 },
  
  // 東北
  { name: '青森市', prefecture: '青森県', latitude: 40.8244, longitude: 140.7400 },
  { name: '盛岡市', prefecture: '岩手県', latitude: 39.7036, longitude: 141.1527 },
  { name: '仙台市', prefecture: '宮城県', latitude: 38.2682, longitude: 140.8694 },
  { name: '秋田市', prefecture: '秋田県', latitude: 39.7186, longitude: 140.1024 },
  { name: '山形市', prefecture: '山形県', latitude: 38.2404, longitude: 140.3633 },
  { name: '福島市', prefecture: '福島県', latitude: 37.7608, longitude: 140.4747 },
  
  // 関東
  { name: '水戸市', prefecture: '茨城県', latitude: 36.3418, longitude: 140.4468 },
  { name: '宇都宮市', prefecture: '栃木県', latitude: 36.5658, longitude: 139.8836 },
  { name: '前橋市', prefecture: '群馬県', latitude: 36.3911, longitude: 139.0608 },
  { name: 'さいたま市', prefecture: '埼玉県', latitude: 35.8617, longitude: 139.6455 },
  { name: '千葉市', prefecture: '千葉県', latitude: 35.6074, longitude: 140.1065 },
  { name: '東京都', prefecture: '東京都', latitude: 35.6762, longitude: 139.6503 },
  { name: '横浜市', prefecture: '神奈川県', latitude: 35.4478, longitude: 139.6425 },
  
  // 中部
  { name: '新潟市', prefecture: '新潟県', latitude: 37.9161, longitude: 139.0364 },
  { name: '富山市', prefecture: '富山県', latitude: 36.6959, longitude: 137.2139 },
  { name: '金沢市', prefecture: '石川県', latitude: 36.5944, longitude: 136.6256 },
  { name: '福井市', prefecture: '福井県', latitude: 36.0652, longitude: 136.2217 },
  { name: '山梨市', prefecture: '山梨県', latitude: 35.6914, longitude: 138.6811 },
  { name: '長野市', prefecture: '長野県', latitude: 36.6513, longitude: 138.1810 },
  { name: '岐阜市', prefecture: '岐阜県', latitude: 35.3912, longitude: 136.7223 },
  { name: '静岡市', prefecture: '静岡県', latitude: 34.9756, longitude: 138.3828 },
  { name: '名古屋市', prefecture: '愛知県', latitude: 35.1815, longitude: 136.9066 },
  
  // 近畿
  { name: '津市', prefecture: '三重県', latitude: 34.7303, longitude: 136.5086 },
  { name: '大津市', prefecture: '滋賀県', latitude: 35.0045, longitude: 135.8686 },
  { name: '京都市', prefecture: '京都府', latitude: 35.0116, longitude: 135.7681 },
  { name: '大阪市', prefecture: '大阪府', latitude: 34.6937, longitude: 135.5023 },
  { name: '神戸市', prefecture: '兵庫県', latitude: 34.6901, longitude: 135.1956 },
  { name: '奈良市', prefecture: '奈良県', latitude: 34.6851, longitude: 135.8048 },
  { name: '和歌山市', prefecture: '和歌山県', latitude: 34.2261, longitude: 135.1675 },
  
  // 中国
  { name: '鳥取市', prefecture: '鳥取県', latitude: 35.5014, longitude: 134.2378 },
  { name: '松江市', prefecture: '島根県', latitude: 35.4723, longitude: 133.0505 },
  { name: '岡山市', prefecture: '岡山県', latitude: 34.6617, longitude: 133.9341 },
  { name: '広島市', prefecture: '広島県', latitude: 34.3853, longitude: 132.4553 },
  { name: '山口市', prefecture: '山口県', latitude: 34.1858, longitude: 131.4706 },
  
  // 四国
  { name: '徳島市', prefecture: '徳島県', latitude: 34.0658, longitude: 134.5594 },
  { name: '高松市', prefecture: '香川県', latitude: 34.3401, longitude: 134.0434 },
  { name: '松山市', prefecture: '愛媛県', latitude: 33.8416, longitude: 132.7657 },
  { name: '高知市', prefecture: '高知県', latitude: 33.5597, longitude: 133.5311 },
  
  // 九州・沖縄
  { name: '福岡市', prefecture: '福岡県', latitude: 33.5904, longitude: 130.4017 },
  { name: '佐賀市', prefecture: '佐賀県', latitude: 33.2494, longitude: 130.2989 },
  { name: '長崎市', prefecture: '長崎県', latitude: 32.7503, longitude: 129.8779 },
  { name: '熊本市', prefecture: '熊本県', latitude: 32.7898, longitude: 130.7417 },
  { name: '大分市', prefecture: '大分県', latitude: 33.2382, longitude: 131.6126 },
  { name: '宮崎市', prefecture: '宮崎県', latitude: 31.9077, longitude: 131.4202 },
  { name: '鹿児島市', prefecture: '鹿児島県', latitude: 31.5966, longitude: 130.5571 },
  { name: '那覇市', prefecture: '沖縄県', latitude: 26.2124, longitude: 127.6792 }
]

// 都道府県別にグループ化
export const CITIES_BY_PREFECTURE = JAPAN_CITIES.reduce((acc, city) => {
  if (!acc[city.prefecture]) {
    acc[city.prefecture] = []
  }
  acc[city.prefecture].push(city)
  return acc
}, {})

// 都道府県リスト
export const PREFECTURES = Object.keys(CITIES_BY_PREFECTURE).sort()

// 都市名で検索
export const findCityByName = (cityName) => {
  return JAPAN_CITIES.find(city => city.name === cityName)
}

// 都道府県で検索
export const getCitiesByPrefecture = (prefecture) => {
  return CITIES_BY_PREFECTURE[prefecture] || []
}

// デフォルト都市（東京）
export const DEFAULT_CITY = JAPAN_CITIES.find(city => city.name === '東京都')

// 地域別グループ
export const REGIONS = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}

// 地域名から都道府県を取得
export const getPrefecturesByRegion = (region) => {
  return REGIONS[region] || []
}

// 地域名から都市を取得
export const getCitiesByRegion = (region) => {
  const prefectures = getPrefecturesByRegion(region)
  return JAPAN_CITIES.filter(city => prefectures.includes(city.prefecture))
}
