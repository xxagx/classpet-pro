// ClassPet Pro - 宠物数据库
// 40种宠物，每种4个进化阶段

// 进化阶段定义
const PET_STAGES = {
  EGG: { name: '蛋', emoji: '🥚', minScore: 0 },
  BABY: { name: '幼崽', emoji: '🐣', minScore: 50 },
  YOUNG: { name: '成长期', emoji: '🐱', minScore: 150 },
  ADULT: { name: '完全体', emoji: '🦁', minScore: 300 }
};

// 宠物数据库（40种）
const PET_DATABASE = [
  // 萌宠风 (8种)
  { id: 'cat_01', name: '小猫咪', style: 'cute', rarity: 'common', cost: 0 },
  { id: 'dog_01', name: '小狗狗', style: 'cute', rarity: 'common', cost: 0 },
  { id: 'rabbit_01', name: '小兔子', style: 'cute', rarity: 'common', cost: 0 },
  { id: 'hamster_01', name: '小仓鼠', style: 'cute', rarity: 'common', cost: 0 },
  { id: 'bear_01', name: '小熊', style: 'cute', rarity: 'rare', cost: 20 },
  { id: 'fox_01', name: '小狐狸', style: 'cute', rarity: 'rare', cost: 20 },
  { id: 'raccoon_01', name: '小浣熊', style: 'cute', rarity: 'epic', cost: 50 },
  { id: 'panda_01', name: '小熊猫', style: 'cute', rarity: 'legendary', cost: 100 },

  // 幻想风 (8种)
  { id: 'dragon_01', name: '小龙', style: 'fantasy', rarity: 'common', cost: 0 },
  { id: 'unicorn_01', name: '独角兽', style: 'fantasy', rarity: 'common', cost: 0 },
  { id: 'fairy_01', name: '精灵', style: 'fantasy', rarity: 'common', cost: 0 },
  { id: 'crystal_01', name: '水晶兽', style: 'fantasy', rarity: 'rare', cost: 20 },
  { id: 'phoenix_01', name: '凤凰', style: 'fantasy', rarity: 'rare', cost: 20 },
  { id: 'moonrabbit_01', name: '月兔', style: 'fantasy', rarity: 'epic', cost: 50 },
  { id: 'starbeast_01', name: '星兽', style: 'fantasy', rarity: 'epic', cost: 50 },
  { id: 'rainbow_dragon', name: '彩虹龙', style: 'fantasy', rarity: 'legendary', cost: 100 },

  // 像素风 (8种)
  { id: 'chicken_01', name: '小鸡', style: 'pixel', rarity: 'common', cost: 0 },
  { id: 'frog_01', name: '小青蛙', style: 'pixel', rarity: 'common', cost: 0 },
  { id: 'dinosaur_01', name: '小恐龙', style: 'pixel', rarity: 'common', cost: 0 },
  { id: 'trex_01', name: '霸王龙', style: 'pixel', rarity: 'rare', cost: 20 },
  { id: 'asiandragon_01', name: '小青龙', style: 'pixel', rarity: 'rare', cost: 20 },
  { id: 'bat_01', name: '小蝙蝠', style: 'pixel', rarity: 'epic', cost: 50 },
  { id: 'ghost_01', name: '幽灵', style: 'pixel', rarity: 'epic', cost: 50 },
  { id: 'skeleton_dragon', name: '骷髅龙', style: 'pixel', rarity: 'legendary', cost: 100 },

  // 科幻风 (8种)
  { id: 'robot_01', name: '机器人', style: 'scifi', rarity: 'common', cost: 0 },
  { id: 'alien_01', name: '外星人', style: 'scifi', rarity: 'common', cost: 0 },
  { id: 'rocketpet_01', name: '火箭兽', style: 'scifi', rarity: 'common', cost: 0 },
  { id: 'ufo_01', name: 'UFO', style: 'scifi', rarity: 'rare', cost: 20 },
  { id: 'mechpet_01', name: '机械兽', style: 'scifi', rarity: 'rare', cost: 20 },
  { id: 'energypet_01', name: '能量兽', style: 'scifi', rarity: 'epic', cost: 50 },
  { id: 'nebula_dragon', name: '星云兽', style: 'scifi', rarity: 'epic', cost: 50 },
  { id: 'cyber_dragon', name: '赛博龙', style: 'scifi', rarity: 'legendary', cost: 100 },

  // 国潮风 (8种)
  { id: 'bigpanda_01', name: '大熊猫', style: 'china', rarity: 'common', cost: 0 },
  { id: 'chinesedragon_01', name: '中国龙', style: 'china', rarity: 'common', cost: 0 },
  { id: 'peacock_01', name: '孔雀', style: 'china', rarity: 'common', cost: 0 },
  { id: 'deer_01', name: '麋鹿', style: 'china', rarity: 'rare', cost: 20 },
  { id: 'luckybeast_01', name: '瑞兽', style: 'china', rarity: 'rare', cost: 20 },
  { id: 'operapet_01', name: '戏曲兽', style: 'china', rarity: 'epic', cost: 50 },
  { id: 'sakura_dragon', name: '樱花龙', style: 'china', rarity: 'epic', cost: 50 },
  { id: 'golden_dragon', name: '金龙', style: 'china', rarity: 'legendary', cost: 100 }
];

// 宠物各阶段emoji映射
const PET_STAGE_EMOJIS = {
  // 萌宠风
  'cat_01': { EGG: '🥚', BABY: '🐱', YOUNG: '😺', ADULT: '🦁' },
  'dog_01': { EGG: '🥚', BABY: '🐶', YOUNG: '🐕', ADULT: '🐺' },
  'rabbit_01': { EGG: '🥚', BABY: '🐰', YOUNG: '🐇', ADULT: '🐾' },
  'hamster_01': { EGG: '🥚', BABY: '🐹', YOUNG: '🐁', ADULT: '🐭' },
  'bear_01': { EGG: '🥚', BABY: '🧸', YOUNG: '🐻', ADULT: '🐻‍❄️' },
  'fox_01': { EGG: '🥚', BABY: '🦊', YOUNG: '🦊', ADULT: '🦊' },
  'raccoon_01': { EGG: '🥚', BABY: '🦝', YOUNG: '🦝', ADULT: '🦝' },
  'panda_01': { EGG: '🥚', BABY: '🐼', YOUNG: '🐼', ADULT: '🐼' },

  // 幻想风
  'dragon_01': { EGG: '🥚', BABY: '🐉', YOUNG: '🐉', ADULT: '🐲' },
  'unicorn_01': { EGG: '🥚', BABY: '🦄', YOUNG: '🦄', ADULT: '🦄' },
  'fairy_01': { EGG: '🥚', BABY: '🧚', YOUNG: '🧚', ADULT: '🧚‍♀️' },
  'crystal_01': { EGG: '🥚', BABY: '💎', YOUNG: '💠', ADULT: '🔮' },
  'phoenix_01': { EGG: '🥚', BABY: '🐦', YOUNG: '🔥', ADULT: '🦚' },
  'moonrabbit_01': { EGG: '🥚', BABY: '🐰', YOUNG: '🌙', ADULT: '🐇' },
  'starbeast_01': { EGG: '🥚', BABY: '⭐', YOUNG: '🌟', ADULT: '✨' },
  'rainbow_dragon': { EGG: '🥚', BABY: '🌈', YOUNG: '🐉', ADULT: '🌈' },

  // 像素风
  'chicken_01': { EGG: '🥚', BABY: '🐤', YOUNG: '🐔', ADULT: '🐓' },
  'frog_01': { EGG: '🥚', BABY: '🐸', YOUNG: '🐸', ADULT: '🐸' },
  'dinosaur_01': { EGG: '🥚', BABY: '🦖', YOUNG: '🦕', ADULT: '🦕' },
  'trex_01': { EGG: '🥚', BABY: '🦖', YOUNG: '🦖', ADULT: '🦖' },
  'asiandragon_01': { EGG: '🥚', BABY: '🐉', YOUNG: '🐲', ADULT: '🐲' },
  'bat_01': { EGG: '🥚', BABY: '🦇', YOUNG: '🦇', ADULT: '🦇' },
  'ghost_01': { EGG: '🥚', BABY: '👻', YOUNG: '👻', ADULT: '👻' },
  'skeleton_dragon': { EGG: '🥚', BABY: '💀', YOUNG: '☠️', ADULT: '☠️' },

  // 科幻风
  'robot_01': { EGG: '🥚', BABY: '🤖', YOUNG: '🤖', ADULT: '🤖' },
  'alien_01': { EGG: '🥚', BABY: '👽', YOUNG: '👽', ADULT: '👽' },
  'rocketpet_01': { EGG: '🥚', BABY: '🚀', YOUNG: '🚀', ADULT: '🚀' },
  'ufo_01': { EGG: '🥚', BABY: '🛸', YOUNG: '🛸', ADULT: '🛸' },
  'mechpet_01': { EGG: '🥚', BABY: '⚙️', YOUNG: '🔧', ADULT: '🔧' },
  'energypet_01': { EGG: '🥚', BABY: '⚡', YOUNG: '💡', ADULT: '💡' },
  'nebula_dragon': { EGG: '🥚', BABY: '🌌', YOUNG: '🌠', ADULT: '🌠' },
  'cyber_dragon': { EGG: '🥚', BABY: '🤖', YOUNG: '🐲', ADULT: '🐲' },

  // 国潮风
  'bigpanda_01': { EGG: '🥚', BABY: '🐼', YOUNG: '🐼', ADULT: '🐼' },
  'chinesedragon_01': { EGG: '🥚', BABY: '🐉', YOUNG: '🐲', ADULT: '🐲' },
  'peacock_01': { EGG: '🥚', BABY: '🦚', YOUNG: '🦚', ADULT: '🦚' },
  'deer_01': { EGG: '🥚', BABY: '🦌', YOUNG: '🦌', ADULT: '🦌' },
  'luckybeast_01': { EGG: '🥚', BABY: '🐲', YOUNG: '🐲', ADULT: '🏆' },
  'operapet_01': { EGG: '🥚', BABY: '🎭', YOUNG: '🎭', ADULT: '🎭' },
  'sakura_dragon': { EGG: '🥚', BABY: '🌸', YOUNG: '🌸', ADULT: '🌸' },
  'golden_dragon': { EGG: '🥚', BABY: '🏅', YOUNG: '🏅', ADULT: '🏅' }
};

// 稀有度配置
const RARITY_CONFIG = {
  common: { name: '普通', color: '#95a5a6', bgColor: '#ecf0f1' },
  rare: { name: '稀有', color: '#3498db', bgColor: '#d6eaf8' },
  epic: { name: '史诗', color: '#9b59b6', bgColor: '#ebdef0' },
  legendary: { name: '传说', color: '#f39c12', bgColor: '#fef9e7' }
};

// 风格配置
const STYLE_CONFIG = {
  cute: { name: '萌宠风', emoji: '🐱', color: '#ff6b6b' },
  fantasy: { name: '幻想风', emoji: '🐉', color: '#a29bfe' },
  pixel: { name: '像素风', emoji: '🐤', color: '#00b894' },
  scifi: { name: '科幻风', emoji: '🤖', color: '#0984e3' },
  china: { name: '国潮风', emoji: '🐼', color: '#e17055' }
};

// 辅助函数
function getPetById(petId) {
  return PET_DATABASE.find(p => p.id === petId);
}

function getPetsByStyle(style) {
  return PET_DATABASE.filter(p => p.style === style);
}

function getPetsByRarity(rarity) {
  return PET_DATABASE.filter(p => p.rarity === rarity);
}

function getPetEmoji(petId, stage) {
  const emojis = PET_STAGE_EMOJIS[petId];
  return emojis ? emojis[stage] : '🥚';
}

function getStageByScore(score) {
  if (score >= 300) return 'ADULT';
  if (score >= 150) return 'YOUNG';
  if (score >= 50) return 'BABY';
  return 'EGG';
}

// 导出
window.PET_STAGES = PET_STAGES;
window.PET_DATABASE = PET_DATABASE;
window.PET_STAGE_EMOJIS = PET_STAGE_EMOJIS;
window.RARITY_CONFIG = RARITY_CONFIG;
window.STYLE_CONFIG = STYLE_CONFIG;
window.getPetById = getPetById;
window.getPetsByStyle = getPetsByStyle;
window.getPetsByRarity = getPetsByRarity;
window.getPetEmoji = getPetEmoji;
window.getStageByScore = getStageByScore;
