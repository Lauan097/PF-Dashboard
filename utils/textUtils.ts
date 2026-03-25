const specialCharMap: Record<string, string> = {
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ғ': 'f', 
  'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 
  'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 
  'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y', 'ᴢ': 'z'
};

export const normalizeText = (str: string): string => {
  // 1. Substitui caracteres do mapa especial
  const mapped = str.split('').map(char => specialCharMap[char] || char).join('');
  
  // 2. Normalização padrão (remove acentos e lowercase)
  return mapped.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};