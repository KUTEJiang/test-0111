export const IMAGE_ANALYSIS_PROMPT = `分析这张旅行照片，评估以下维度（0-10分）：

1. 清晰度(clarity)：是否模糊、曝光是否正常、噪点情况
2. 构图(composition)：主体位置、画面平衡、三分法应用
3. 吸引力(appeal)：色彩表现、光影效果、情感表达

同时识别：
- 主体类型(subject)：person(人物)/landscape(风景)/architecture(建筑)/food(美食)/other(其他)
- 主色调(mainColors)：提取2-3个主要颜色的HEX值
- 简短描述(description)：用一句话描述照片内容

请以JSON格式输出，示例：
{
  "clarity": 8,
  "composition": 7,
  "appeal": 9,
  "subject": "landscape",
  "mainColors": ["#3A7CA5", "#F4E76E", "#2E4052"],
  "description": "日落时分的海滩全景，金色阳光洒在波光粼粼的海面上"
}`

export const CONTENT_OPTIMIZATION_PROMPT = `你是一位旅行故事编辑。用户写了以下旅行日记片段，请在保持其个人风格的前提下，优化可读性和感染力。

原始文案：
{content}

优化要求：
1. 保留第一人称口吻和个人特色词汇
2. 修正明显的语法错误和冗余表达
3. 适当增强画面感和情感表达（但不要过度煽情）
4. 段落结构更清晰
5. 优化后的字数不超过原文的120%

请以JSON格式输出：
{
  "optimized": "优化后的完整文案",
  "changes": ["修改点1", "修改点2", ...],
  "tone": "casual/poetic/narrative"
}`

export const STORY_TITLE_PROMPT = `基于以下旅行日记内容，生成一个吸引人的故事标题和副标题。

日记摘要：
{summary}

地点：{location}
日期：{dateRange}

要求：
- 标题简洁有力，5-15个字
- 副标题可以更具描述性，10-30个字
- 风格可以是文艺的、简约的或有趣的

请以JSON格式输出：
{
  "title": "标题",
  "subtitle": "副标题"
}`
