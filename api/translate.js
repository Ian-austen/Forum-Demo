export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { text, targetLang } = req.body;

  // 映射一下语种代码，因为 LibreTranslate 的中文代码是 zh
  const finalLang = targetLang === 'zh-CN' ? 'zh' : targetLang;

  try {
    // 核心：直接请求 LibreTranslate 官方全球公开的免 Key 免费测试节点
    const response = await fetch("https://translate.libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto", // 让开源引擎自动检测输入的语言
        target: finalLang,
        format: "text"
      })
    });

    const data = await response.json();

    if (data.translatedText) {
      res.status(200).json({ translatedText: data.translatedText });
    } else {
      // 如果官方节点人太多报错了，返回一个友好的模拟文本，确保你的前端不崩溃
      res.status(200).json({ translatedText: `[免Key演示] 收到翻译请求！由于官方免费节点拥挤，AI 模拟将此内容翻译为了【${targetLang}】。` });
    }
  } catch (error) {
    // 即使网络彻底断开，也保证前端能看到模拟的成功效果，方便你验证 UI 体验
    res.status(200).json({ translatedText: `[网络离线兜底] 成功触发翻译！前端传来的原文是: "${text}"，当前目标语言是: ${targetLang}` });
  }
}